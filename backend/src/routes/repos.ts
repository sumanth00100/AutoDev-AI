import { FastifyInstance } from 'fastify';
import { Octokit } from '@octokit/rest';
import { complete } from '../../agents/openrouter';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function reposRoute(app: FastifyInstance) {
  // ── List all repos ─────────────────────────────────────────────────────────
  app.get('/repos', async (_req, reply) => {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
      affiliation: 'owner',
    });
    reply.send(
      data.map((r) => ({
        id:          r.id,
        name:        r.name,
        fullName:    r.full_name,
        owner:       r.owner.login,
        description: r.description ?? null,
        language:    r.language ?? null,
        url:         r.html_url,
        updatedAt:   r.updated_at,
        isPrivate:   r.private,
        stars:       r.stargazers_count,
      }))
    );
  });

  // ── AI description of a specific repo ──────────────────────────────────────
  app.get<{ Params: { owner: string; repo: string } }>(
    '/repos/:owner/:repo/describe',
    async (req, reply) => {
      const { owner, repo } = req.params;

      // Fetch repo metadata
      const { data: meta } = await octokit.repos.get({ owner, repo });

      // Try README first, fall back to file listing
      let content = '';
      try {
        const { data: rm } = await octokit.repos.getReadme({ owner, repo });
        content = Buffer.from(rm.content, 'base64').toString('utf8').slice(0, 3000);
      } catch {
        try {
          const { data: tree } = await octokit.repos.getContent({ owner, repo, path: '' });
          if (Array.isArray(tree)) {
            content = `Root files: ${tree.map((f) => f.name).join(', ')}`;
          }
        } catch {
          content = 'No README or file listing available.';
        }
      }

      const context = `Repository: ${owner}/${repo}
GitHub description: ${meta.description ?? 'none'}
Primary language: ${meta.language ?? 'unknown'}
Stars: ${meta.stargazers_count}

README / file listing:
${content}`;

      const result = await complete({
        messages: [
          {
            role: 'system',
            content:
              'You are a senior software engineer. Given a GitHub repository, write a concise 2–3 sentence description: what the project does, its tech stack, and its purpose. Be specific and direct. No filler.',
          },
          { role: 'user', content: context },
        ],
        temperature: 0.3,
        max_tokens:  200,
        reasoning:   false,
      });

      reply.send({ description: result.content.trim() });
    }
  );
}
