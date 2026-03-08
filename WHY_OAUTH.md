# 🔐 Why OAuth + How to Set It Up (5 Minutes)

## Why Do You Need GitHub OAuth?

### The Problem Without OAuth

Without OAuth, you'd have to:

1. Ask users for their GitHub username + password
2. Store passwords in your database (security nightmare 😱)
3. Handle password resets, changes, etc.
4. Be responsible if passwords get hacked
5. Not access their GitHub account anyway

### What OAuth Solves

**OAuth lets users:**

- Sign in securely using their existing GitHub account
- Never share their password with you
- Control what permissions you have
- Revoke access anytime
- Stay logged in with a session token

**You get:**

- User's GitHub username & ID
- Permission to create repositories on their behalf
- Never see or store their password
- Secure, industry-standard authentication

---

## Simple Analogy

**Without OAuth** (like writing your credit card number on paper):

```
User types GitHub password into your app
    ↓
You store it in database
    ↓
Someone hacks database
    ↓
Hackers can access user's GitHub account
    ↓
😱 Disaster
```

**With OAuth** (like using Apple Pay):

```
User clicks "Sign in with GitHub"
    ↓
User logs in on GitHub's website (not yours)
    ↓
User clicks "Authorize"
    ↓
GitHub gives you a temporary token
    ↓
You use token to do things on their behalf
    ↓
Token can be revoked anytime
    ↓
✅ Safe & Secure
```

---

## How AutoDev AI Uses OAuth

```
1. User clicks "Sign in with GitHub"
   ↓
2. Your app asks: "Can I access your GitHub account?"
   ↓
3. GitHub asks user: "Do you authorize AutoDev AI?"
   ↓
4. User clicks "Yes"
   ↓
5. GitHub gives you a token (like a temporary key)
   ↓
6. You use that token to create repositories for them
   ↓
7. Generated code gets pushed to their GitHub automatically ✨
```

### Why This Matters for AutoDev AI

AutoDev needs to:

1. **Know who the user is** → OAuth gives you their username
2. **Create GitHub repos** → OAuth gives you permission to do this
3. **Push code to repos** → OAuth gives you a token to authenticate
4. **Never store passwords** → OAuth means you never see passwords

Without OAuth, you'd have to:

- Ask for their GitHub password (they'd refuse)
- Store it (very unsafe)
- Manually do things instead of automating

---

## ✅ Step-by-Step: Register GitHub OAuth App (2 Minutes)

### What You'll Get

- **Client ID** (public, safe to share)
- **Client Secret** (KEEP SECRET! Add to .env only)

### The Steps

#### 1. Open GitHub Developer Settings

```
Go to: https://github.com/settings/developers
```

You should see a page that says "OAuth Apps"

#### 2. Click "New OAuth App"

You'll see a form with 4 fields:

#### 3. Fill in the Form

| Field                          | What to Type                                     |
| ------------------------------ | ------------------------------------------------ |
| **Application name**           | `AutoDev AI`                                     |
| **Homepage URL**               | `http://localhost:3000`                          |
| **Application description**    | `Autonomous AI Software Engineer`                |
| **Authorization callback URL** | `http://localhost:3001/api/auth/github/callback` |

⚠️ **IMPORTANT**: The callback URL must be EXACTLY `http://localhost:3001/api/auth/github/callback`

#### 4. Click "Register application"

GitHub will show you your credentials:

```
Client ID:         Ov23liXyz9abcDEF12345
Client secret:     ghp_abcdef1234567890ghijklmnopqrstuvwxyz
```

#### 5. Copy Your Credentials

**Client ID:**

- Always visible
- Safe to put in code/env files
- Copy it

**Client Secret:**

- Click "Click to reveal" to see it
- ⚠️ KEEP THIS SECRET
- Only put in `.env` file (never in code or git)
- Copy it

---

## 📝 Add to Your .env File

Open `.env` and add these two lines:

```bash
GITHUB_CLIENT_ID=Ov23liXyz9abcDEF12345
GITHUB_CLIENT_SECRET=ghp_abcdef1234567890ghijklmnopqrstuvwxyz
```

(Replace with your actual values)

**That's it!** OAuth is now configured. 🎉

---

## 🔄 How It Works (Behind the Scenes)

When someone uses AutoDev AI:

```
1️⃣ User clicks "Sign in with GitHub"
   └─ Frontend redirects to: /api/auth/github

2️⃣ Backend reads GITHUB_CLIENT_ID from .env
   └─ Builds GitHub authorization URL

3️⃣ Frontend redirected to GitHub login page
   └─ User logs in (if not already)

4️⃣ User sees permissions dialog:
   ✓ Access your repositories
   ✓ Read your email address
   └─ User clicks "Authorize"

5️⃣ GitHub redirects back to your callback:
   └─ URL: http://localhost:3001/api/auth/github/callback?code=XXX

6️⃣ Backend exchanges code for access token
   └─ Sends: client_id + client_secret + code to GitHub
   └─ Receives: access_token back

7️⃣ Backend decrypts & encrypts access token
   └─ Stores in database (encrypted)

8️⃣ Backend creates JWT session token
   └─ Sends to frontend

9️⃣ Frontend stores JWT in browser
   └─ Uses it for future API calls

🔟 User is logged in! ✅
   └─ Can now use AutoDev AI
   └─ AutoDev can create repos on their behalf
```

---

## ⚠️ Security Questions Answered

**Q: Doesn't this mean AutoDev AI can hack my GitHub?**
A: No! GitHub OAuth lets users control permissions. Users can revoke access anytime by going to GitHub Settings → Applications.

**Q: Where's my GitHub password stored?**
A: Nowhere! You never give it to AutoDev AI. GitHub handles authentication directly.

**Q: What if AutoDev AI company goes evil?**
A: Users can revoke access at any time. The token you give them can be revoked within seconds.

**Q: Why not just use a GitHub Personal Access Token?**
A: That's less secure:

- You'd have to give the app your full credentials
- You can't revoke specific permissions
- It's more like sharing your password
- OAuth is the modern, secure way

---

## 🚀 Next Steps

### After Registering OAuth App

1. ✅ Add Client ID to `.env`
2. ✅ Add Client Secret to `.env`
3. ✅ Generate JWT_SECRET: `openssl rand -hex 32`
4. ✅ Generate TOKEN_ENCRYPTION_KEY: `openssl rand -hex 32`
5. ✅ Run: `docker-compose up --build`
6. ✅ Open: `http://localhost:3000`
7. ✅ Click "Sign in with GitHub"
8. ✅ Should work! 🎉

---

## 🔗 What Each Environment Variable Does

```bash
# GitHub OAuth (YOU register this on github.com)
GITHUB_CLIENT_ID=Ov23liXyz...
    └─ Public ID for your OAuth app

GITHUB_CLIENT_SECRET=ghp_secret...
    └─ Secret key - KEEP SAFE! Only in .env

# Security (generate with: openssl rand -hex 32)
JWT_SECRET=abc123def456...
    └─ Signs session tokens

TOKEN_ENCRYPTION_KEY=xyz789uvw012...
    └─ Encrypts GitHub tokens in database
```

---

## ✅ How to Verify It Works

1. Open http://localhost:3000
2. Click "Sign in with GitHub"
3. You should be redirected to GitHub login page
4. Login if needed
5. GitHub asks: "Authorize AutoDev AI?"
6. Click "Authorize"
7. You should be redirected back to http://localhost:3000
8. Dashboard should load
9. ✅ Success!

---

## 🛠️ Production Setup

When deploying to production (e.g., https://autodev.mycompany.com):

### Create a NEW OAuth App for Production

1. Go to https://github.com/settings/developers
2. Click "New OAuth App" again
3. Fill in:
   - Name: `AutoDev AI (Production)`
   - Homepage: `https://autodev.mycompany.com`
   - Callback: `https://autodev.mycompany.com/api/auth/github/callback`
4. Copy new Client ID and Secret
5. Update `.env` on production server with new credentials

**Don't reuse development credentials in production!**

---

## 📚 Learn More

- [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [OAuth 2.0 Explained](https://www.youtube.com/results?search_query=oauth+2.0+explained)
- [AutoDev AI OAUTH_SETUP.md](./OAUTH_SETUP.md)
- [AutoDev AI OAUTH_VISUAL_GUIDE.md](./OAUTH_VISUAL_GUIDE.md)

---

## 🎯 TL;DR (Too Long; Didn't Read)

**Why OAuth?**

- ✅ Users don't share passwords
- ✅ Secure industry standard
- ✅ Users can revoke access anytime
- ✅ App can create repos on user's behalf

**How to set up (2 minutes):**

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in 4 fields (use form above)
4. Copy Client ID and Secret
5. Add to `.env`
6. Done! 🎉

**That's it!** The rest of OAuth is already coded in AutoDev AI.
