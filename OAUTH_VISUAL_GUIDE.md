# 🔐 GitHub OAuth Registration - Visual Step-by-Step

## Complete Step-by-Step Guide (Literally 2 Minutes)

### Step 1: Go to GitHub Developer Settings

1. Log in to **github.com**
2. Click your **profile icon** (top right corner)
3. Select **Settings**
4. In left sidebar, click **Developer settings**
5. Click **OAuth Apps** (or go directly: https://github.com/settings/developers)

You should see a page that says "OAuth Apps" with a **New OAuth App** button.

### Step 2: Create a New OAuth App

Click the **New OAuth App** button.

You'll see a form with these fields:

```
┌─────────────────────────────────────────────────────────┐
│ Register a new OAuth application                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Application name *                                      │
│ [AutoDev AI                        ]                    │
│                                                         │
│ Homepage URL *                                          │
│ [http://localhost:3000            ]                    │
│                                                         │
│ Application description                                 │
│ [Autonomous AI Software Engineer    ]                  │
│                                                         │
│ Authorization callback URL *                            │
│ [http://localhost:3001/api/auth/github/callback]       │
│                                                         │
│ ☑ Request user authorization (OAuth) during installation │
│                                                         │
│                    [Cancel]  [Register application]    │
└─────────────────────────────────────────────────────────┘
```

### Step 3: Fill in the Form

Copy and paste exactly:

| Field                          | Value                                            |
| ------------------------------ | ------------------------------------------------ |
| **Application name**           | `AutoDev AI`                                     |
| **Homepage URL**               | `http://localhost:3000`                          |
| **Application description**    | `Autonomous AI Software Engineer`                |
| **Authorization callback URL** | `http://localhost:3001/api/auth/github/callback` |

⚠️ **Important Notes:**

- **Homepage URL** and **Callback URL** must match your environment

  - **Local development**: use `http://localhost:3000` and `http://localhost:3001`
  - **Production**: use your actual domain (e.g., `https://autodev.mycompany.com`)
  - **Staging**: use staging domain (e.g., `https://staging-autodev.mycompany.com`)

- The **callback URL must be exact** — GitHub will reject any mismatch

### Step 4: Click "Register Application"

Click the blue **Register application** button.

### Step 5: Copy Your Credentials

After registration, you'll see a page like this:

```
┌──────────────────────────────────────────────────────┐
│ AutoDev AI                                           │
│ Autonomous AI Software Engineer                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ OAuth App Settings                                   │
│                                                      │
│ Client ID:                                           │
│ ┌──────────────────────────────┐                    │
│ │ Ov23li1234567890abcdef       │ [Copy]             │
│ └──────────────────────────────┘                    │
│                                                      │
│ Client Secret:                                       │
│ ┌──────────────────────────────┐                    │
│ │ ghp_********************     │ [🔑 Show]           │
│ └──────────────────────────────┘                    │
│                                                      │
│ Generate new client secret                           │
│                                                      │
│ Authorization callback URL:                          │
│ http://localhost:3001/api/auth/github/callback       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Copy these two values:**

1. **Client ID** (always visible)
2. **Client Secret** (click to reveal)

⚠️ **Keep the Client Secret safe!** Never commit it to git. Only put it in `.env`.

### Step 6: Add to Your `.env` File

Open `.env` in the project root and add:

```bash
# GitHub OAuth App (from https://github.com/settings/developers)
GITHUB_CLIENT_ID=Ov23li1234567890abcdef
GITHUB_CLIENT_SECRET=ghp_your_secret_here_keep_it_safe_123456789
```

Example with real-looking values:

```bash
GITHUB_CLIENT_ID=Ov23liXyz9abcDEF12345
GITHUB_CLIENT_SECRET=ghp_abcdef1234567890ghijklmnopqrstuvwxyz
```

### Step 7: Generate JWT Secrets

Open terminal and run:

```bash
openssl rand -hex 32
```

This outputs something like:

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Copy the output. Run the command again for a second secret.

Add both to `.env`:

```bash
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
TOKEN_ENCRYPTION_KEY=x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4
```

### Step 8: Complete `.env` File

Your `.env` should now look like:

```bash
# ─── Database (from Supabase) ─────────────────────
DB_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres
DB_SSL=true

# ─── AI Model (from OpenRouter) ───────────────────
OPENROUTER_API_KEY=sk-or-v1-abcdef1234567890
AI_MODEL=anthropic/claude-3.5-sonnet

# ─── GitHub OAuth (from GitHub.com settings) ──────
GITHUB_CLIENT_ID=Ov23li1234567890abcdef
GITHUB_CLIENT_SECRET=ghp_abcdef1234567890

# ─── Security (generated with: openssl rand -hex 32) ──
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
TOKEN_ENCRYPTION_KEY=x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4

# ─── GitHub (optional fallback, not needed with OAuth) ─
GITHUB_TOKEN=ghp_optional_fallback_token
GITHUB_USERNAME=your-username

# ─── Redis (leave as-is for docker-compose) ──────
REDIS_URL=redis://localhost:6379

# ─── Frontend URLs ────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
FRONTEND_URL=http://localhost:3000

# ─── Sandbox tuning (optional) ────────────────────
SANDBOX_TIMEOUT_MS=60000
SANDBOX_MAX_RETRIES=3
```

### Step 9: You're Done! ✅

Now you can:

```bash
# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Run the app
docker-compose up --build
```

Then open http://localhost:3000 and click "Sign in with GitHub" ✨

---

## 🔄 What Happens When User Clicks "Sign in with GitHub"

```
1. User clicks "Sign in with GitHub" button on frontend
   ↓
2. Frontend redirects to: http://localhost:3001/api/auth/github
   ↓
3. Backend builds GitHub OAuth URL with your GITHUB_CLIENT_ID
   ↓
4. Backend redirects to:
   https://github.com/login/oauth/authorize?
   client_id=Ov23li1234567890abcdef&
   scope=repo%20user:email&
   state=random_string
   ↓
5. GitHub shows: "AutoDev AI wants permission to access:"
   ✓ Access your repositories
   ✓ Read your email address
   [Cancel]  [Authorize AutoDev AI]
   ↓
6. User clicks "Authorize AutoDev AI"
   ↓
7. GitHub redirects to your callback URL with ?code=
   http://localhost:3001/api/auth/github/callback?code=Ov23li1234567890abcdef
   ↓
8. Backend receives code, exchanges it for access token (server-to-server)
   POST https://github.com/login/oauth/access_token
   Body: {
     client_id: "Ov23li1234567890abcdef",
     client_secret: "ghp_secret_...",
     code: "Ov23li1234567890abcdef"
   }
   ↓
9. GitHub returns: { access_token: "ghu_..." }
   ↓
10. Backend uses token to fetch user profile
    GET https://api.github.com/user
    Authorization: Bearer ghu_...
    ↓
11. GitHub returns: { id: 12345, login: "john_doe", ... }
    ↓
12. Backend operations:
    - Encrypt token with AES-256-GCM
    - Upsert user in database
    - Sign JWT (valid 7 days): { userId: "...", githubUsername: "john_doe" }
    ↓
13. Backend redirects to:
    http://localhost:3000/#token=eyJhbGc...
    (JWT in URL fragment for security)
    ↓
14. Frontend extracts JWT from #token=...
    ↓
15. Frontend stores in sessionStorage
    ↓
16. Frontend redirects to dashboard ✓
    ↓
17. User is logged in and can submit prompts!
```

---

## ❓ Common Questions

### Q: Do I need a GitHub personal access token?

**A:** No! OAuth is preferred. The personal token (`GITHUB_TOKEN`) is only a fallback for if you want to push to specific repos without user permission.

### Q: What if I get "Invalid client_id"?

**A:** Your Client ID is wrong. Go back to https://github.com/settings/developers, click your app, and verify the Client ID is copied correctly.

### Q: What if I get "Redirect URI mismatch"?

**A:** Your callback URL in GitHub settings doesn't match what your backend is using. Make sure both are exactly: `http://localhost:3001/api/auth/github/callback`

### Q: Can I use the same OAuth app for production?

**A:** No. Create a separate OAuth app with production URLs. You'll get different Client ID/Secret for prod.

### Q: Is the Client Secret safe to put in `.env`?

**A:** Yes, because `.env` is in `.gitignore` and never committed. Never put it in code or public repos.

### Q: What if someone gets my Client Secret?

**A:** Go to GitHub settings, click your app, and click "Regenerate client secret". The old one becomes invalid immediately.

### Q: How long does the JWT last?

**A:** 7 days. After that, user must log in again. You can change this in `backend/src/routes/auth.ts` line 61.

### Q: Can I use GitHub Enterprise?

**A:** Yes, but you need to configure the OAuth app URL. Contact your GitHub Enterprise admin.

---

## 🎯 Production Checklist

When deploying to production:

- [ ] Create a **new** OAuth app on GitHub with production URLs
- [ ] Update `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in production `.env`
- [ ] Update `FRONTEND_URL` to your production domain
- [ ] Update `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` to production URLs
- [ ] Regenerate `JWT_SECRET` and `TOKEN_ENCRYPTION_KEY` for production
- [ ] Never reuse development secrets in production
- [ ] Enable HTTPS/TLS (required by GitHub for OAuth)
- [ ] Use environment secrets (GitHub Actions, cloud provider, etc.)

Example production `.env`:

```bash
GITHUB_CLIENT_ID=Ov23liProd1234567890abc
GITHUB_CLIENT_SECRET=ghp_prod_secret_keep_safe_in_vault
FRONTEND_URL=https://autodev.mycompany.com
NEXT_PUBLIC_API_URL=https://api.autodev.mycompany.com/api
NEXT_PUBLIC_WS_URL=wss://api.autodev.mycompany.com/ws
```

---

**You're all set!** 🚀

Go to https://github.com/settings/developers and register your app now. It takes 2 minutes!
