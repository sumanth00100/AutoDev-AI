import { FastifyInstance } from 'fastify';
import { UserStore } from '../../services/redisStore';
import { encryptToken } from '../../services/crypto';

// Augment @fastify/jwt types so req.user is typed everywhere
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: { userId: string; githubUsername: string };
  }
}

const GITHUB_CLIENT_ID     = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const FRONTEND_URL         = process.env.FRONTEND_URL ?? 'http://localhost:3000';

export async function authRoute(app: FastifyInstance) {
  // ── Step 1: Redirect to GitHub OAuth ────────────────────────────────────
  app.get('/auth/github', async (_req, reply) => {
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', GITHUB_CLIENT_ID);
    url.searchParams.set('scope', 'repo user:email');
    reply.redirect(302, url.toString());
  });

  // ── Step 2: GitHub redirects back with ?code= ────────────────────────────
  app.get<{ Querystring: { code?: string; error?: string } }>(
    '/auth/github/callback',
    async (req, reply) => {
      const { code, error } = req.query;
      if (error || !code) {
        return reply.redirect(302, `${FRONTEND_URL}/?auth_error=denied`);
      }

      // Exchange code → access token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code }),
      });
      const tokenData = await tokenRes.json() as { access_token?: string };
      if (!tokenData.access_token) {
        return reply.redirect(302, `${FRONTEND_URL}/?auth_error=token_failed`);
      }

      // Fetch GitHub user profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'AutoEngineer-AI' },
      });
      const githubUser = await userRes.json() as { id: number; login: string };

      // Encrypt + upsert user in DB
      const encrypted = encryptToken(tokenData.access_token);
      const user      = await UserStore.upsert(githubUser.id, githubUser.login, encrypted);

      // Sign a JWT session token
      const jwt = app.jwt.sign(
        { userId: user.id, githubUsername: user.github_username },
        { expiresIn: '7d' }
      );

      // Pass token to frontend via URL fragment (never reaches server logs)
      reply.redirect(302, `${FRONTEND_URL}/#token=${encodeURIComponent(jwt)}`);
    }
  );

  // ── Get current user (for frontend auth check) ───────────────────────────
  app.get('/auth/me', async (req, reply) => {
    try {
      await req.jwtVerify();
      reply.send({ userId: req.user.userId, githubUsername: req.user.githubUsername });
    } catch {
      reply.code(401).send({ error: 'Not authenticated' });
    }
  });
}
