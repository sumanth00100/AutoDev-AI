# 🔐 GitHub OAuth Setup Guide (2 Minutes)

## Step 1: Register OAuth App on GitHub

1. **Log in to GitHub** (https://github.com)
2. Go to **Settings** → **Developer settings** → **OAuth Apps**
   - Direct link: https://github.com/settings/developers
3. Click **New OAuth App**

## Step 2: Fill in the Form

| Field                          | Value                                          |
| ------------------------------ | ---------------------------------------------- |
| **Application name**           | AutoDev AI                                     |
| **Homepage URL**               | http://localhost:3000                          |
| **Application description**    | Autonomous AI Software Engineer                |
| **Authorization callback URL** | http://localhost:3001/api/auth/github/callback |

**Important Notes:**

- For **local development**, use `http://localhost:3000` and `http://localhost:3001`
- For **production**, use your actual domain (e.g., `https://autodev.mycompany.com`)
- The callback URL **must match exactly** with `http://localhost:3001/api/auth/github/callback`

## Step 3: Copy Credentials

After creating the app, you'll see:

- **Client ID** (public, safe to commit to env.example)
- **Client Secret** (KEEP SECRET! Add to `.env` only, never commit)

Example:

```
GITHUB_CLIENT_ID=Ov23li1234567890abcd
GITHUB_CLIENT_SECRET=ghp_abcdef1234567890abcdefghijklmnopqrst
```

## Step 4: Update `.env` File

Edit `.env` in the project root:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=<paste your client ID>
GITHUB_CLIENT_SECRET=<paste your client secret>

# ... other variables ...
```

## Step 5: Generate Security Keys

Open terminal and run:

```bash
# Generate JWT secret (32-byte hex string)
openssl rand -hex 32

# Generate token encryption key (32-byte hex string)
openssl rand -hex 32
```

Add these to `.env`:

```bash
JWT_SECRET=<paste first output>
TOKEN_ENCRYPTION_KEY=<paste second output>
```

## Step 6: Verify Callback URL

Make sure your `.env` has:

```bash
FRONTEND_URL=http://localhost:3000
```

This tells the backend where to redirect after OAuth completes.

## ✅ You're Done!

The OAuth flow is now configured. When you start the app:

1. User clicks "Sign in with GitHub"
2. Gets redirected to GitHub authorization page
3. User clicks "Authorize"
4. Gets redirected back to your app with a JWT token
5. Frontend stores JWT in sessionStorage
6. User can now submit project descriptions

## 🔄 OAuth Flow Diagram

```
Frontend                          GitHub                         Backend
  │                                 │                               │
  ├─ User clicks "Login" ──────────>│                               │
  │                                 │                               │
  ├─────────────────────────────────────────────────────────────>│
  │    Redirect to /auth/github                                  │
  │                                                               │
  │                      Backend redirects to GitHub OAuth URL   │
  │<──────────────────────────────────────────────────────────────│
  │                                                               │
  ├─ User grants permission on GitHub ──────────────────────────>│
  │                                                               │
  │                      GitHub sends ?code=XXX back to callback │
  │<──────────────────────────────────────────────────────────────│
  │                                                               │
  │                      Backend exchanges code for access token │
  │                      Backend fetches user profile            │
  │                      Backend creates/updates user in DB      │
  │                      Backend signs JWT (7-day)              │
  │                                                               │
  │  /#token=<jwt> (in URL fragment, safe from logs)            │
  │<──────────────────────────────────────────────────────────────│
  │                                                               │
  ├─ Frontend extracts JWT from URL ──                          │
  ├─ Stores in sessionStorage                                    │
  └─ Ready to use! 🎉
```

## 🚨 Common Issues

### "Invalid client_id" or "Redirect URI mismatch"

- Check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- Verify callback URL matches exactly: `http://localhost:3001/api/auth/github/callback`

### JWT not being recognized

- Make sure `JWT_SECRET` is set and matches between backend runs
- Check that frontend is reading from sessionStorage correctly

### User profile not being fetched

- Verify GitHub OAuth app has `repo user:email` scope (it should be auto-set)
- Check GitHub token has not expired

### Can't login after deployment

- Update callback URL in GitHub OAuth settings to your production domain
- Update `FRONTEND_URL` env var on backend
- Update `NEXT_PUBLIC_API_URL` env var on frontend

## 📚 References

- GitHub OAuth Docs: https://docs.github.com/en/developers/apps/building-oauth-apps
- OpenID Connect: https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
