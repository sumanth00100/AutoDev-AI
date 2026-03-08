# 🎯 OAuth Flow - Visual Explanation

## The Simple Version

```
┌─────────────────┐
│  Your Browser   │
│  (localhost)    │
└────────┬────────┘
         │
         │ "Sign in with GitHub"
         ▼
┌─────────────────────┐
│  AutoDev AI App     │
│  (backend)          │
│                     │
│ Has Client ID       │
│ Has Client Secret   │
└────────┬────────────┘
         │
         │ "Redirect to GitHub"
         ▼
┌─────────────────────┐
│  GitHub.com         │
│  (login page)       │
│                     │
│ "Please login"      │
└────────┬────────────┘
         │
         │ User logs in
         ▼
┌─────────────────────┐
│  GitHub.com         │
│  (permissions)      │
│                     │
│ "Allow AutoDev AI   │
│  to access your     │
│  repositories?"     │
└────────┬────────────┘
         │
         │ User clicks "Yes"
         ▼
┌─────────────────────┐
│  AutoDev AI App     │
│  (gets token)       │
│                     │
│ Token = magic key   │
│ Can create repos    │
│ Can push code       │
└────────┬────────────┘
         │
         │ "You're logged in!"
         ▼
┌─────────────────┐
│  Your Browser   │
│  Dashboard      │
│  (logged in!)   │
└─────────────────┘
```

---

## Without OAuth (⚠️ BAD - DON'T DO THIS)

```
User: "I want to use AutoDev AI"
    ↓
App: "Give me your GitHub password"
    ↓
User: Types password into app
    ↓
App: Stores password in database
    ↓
Hacker: Gets database
    ↓
Hacker: Has user's GitHub password!
    ↓
😱 Disaster - hacker can do ANYTHING on GitHub
```

---

## With OAuth (✅ GOOD - WHAT WE USE)

```
User: "I want to use AutoDev AI"
    ↓
App: "Click here to sign in with GitHub"
    ↓
User: Clicks, goes to GitHub.com (NOT the app)
    ↓
User: Logs into GitHub (GitHub is trusted)
    ↓
GitHub: "Does AutoDev AI have permission?"
    ↓
User: Clicks "Yes"
    ↓
GitHub: Gives AutoDev a temporary token
    ↓
App: Uses token to create repos
    ↓
User: Logged in ✅
    ↓
If user wants to revoke:
    └─ GitHub Settings → Revoke (takes 1 second)
```

---

## The OAuth Dance (Step by Step)

### Step 1: User Initiates Login

```
User clicks: "Sign in with GitHub"
    ↓
Browser: https://localhost:3000/
    ↓
Frontend sends user to: http://localhost:3001/api/auth/github
```

### Step 2: Backend Redirects to GitHub

```
Backend reads .env:
  GITHUB_CLIENT_ID = Ov23liXyz...

Builds GitHub URL:
  https://github.com/login/oauth/authorize?
    client_id=Ov23liXyz...&
    scope=repo,user:email&
    state=random_string

Redirects browser to GitHub
```

### Step 3: User Authorizes on GitHub

```
Browser: Goes to GitHub
    ↓
GitHub: Shows login page (if needed)
    ↓
GitHub: Shows permissions dialog:
  ✓ Can access repositories
  ✓ Can read email
    ↓
User: Clicks "Authorize"
```

### Step 4: GitHub Redirects Back

```
GitHub redirects to:
  http://localhost:3001/api/auth/github/callback?
    code=Ov23liXyz...&
    state=random_string
```

### Step 5: Backend Exchanges Code for Token

```
Backend receives: code
    ↓
Backend sends to GitHub:
  POST https://github.com/login/oauth/access_token

  Body:
    client_id: Ov23liXyz...
    client_secret: ghp_secret...
    code: Ov23liXyz...
    ↓
GitHub validates credentials
    ↓
GitHub returns:
  access_token: ghu_abcdef123456...
```

### Step 6: Backend Stores Token Securely

```
access_token = ghu_abcdef123456...
    ↓
Encrypt with AES-256-GCM:
  encrypted = aes_encrypt(access_token)
    ↓
Store in database:
  users table
    └─ encrypted_token: aes_encrypt(token)
```

### Step 7: Backend Creates Session Token

```
payload = {
  userId: "12345",
  githubUsername: "john_doe"
}
    ↓
Sign with JWT_SECRET:
  jwt_token = jwt.sign(payload, JWT_SECRET)
    ↓
Token expires in: 7 days
```

### Step 8: Send JWT to Frontend

```
Redirect to:
  http://localhost:3000/#token=eyJhbGci...
    ↓
Frontend extracts token from URL
    ↓
Frontend stores in sessionStorage
```

### Step 9: Frontend Uses JWT for All API Calls

```
For every API request:
  Authorization: Bearer eyJhbGci...
    ↓
Backend verifies JWT
    ↓
Request allowed
```

### Step 10: User is Logged In! ✅

```
Dashboard loads
    ↓
Can submit prompts
    ↓
AutoDev uses stored token to create repos
    ↓
Everything automated!
```

---

## What Each Credential Does

### Client ID (Ov23liXyz...)

```
├─ What: Public identifier for your OAuth app
├─ Where: GitHub shows this publicly
├─ Use: Tells GitHub which app is requesting access
└─ Safe: Yes, can be in code
```

### Client Secret (ghp_secret...)

```
├─ What: Password for your OAuth app
├─ Where: Only you and GitHub know this
├─ Use: Proves to GitHub that code is yours
└─ Safe: NO, only in .env (never in git)
```

### JWT Secret (abc123def...)

```
├─ What: Signing key for session tokens
├─ Where: Only your backend knows
├─ Use: Signs JWTs so they can't be forged
└─ Safe: NO, only in .env
```

### Token Encryption Key (xyz789...)

```
├─ What: Key to encrypt GitHub tokens in DB
├─ Where: Only your backend knows
├─ Use: Even if DB is hacked, tokens are encrypted
└─ Safe: NO, only in .env
```

---

## Security Checklist

### What GitHub OAuth Protects Against

- ✅ User passwords never stored locally
- ✅ User passwords never transmitted to app
- ✅ App can't access other GitHub accounts
- ✅ User can revoke access anytime
- ✅ Token can be limited to specific permissions
- ✅ Token can expire

### What Your .env File Protects

- ✅ Client Secret not in git
- ✅ JWT Secret not public
- ✅ Encryption Key not public
- ✅ Database credentials not public

**Result: Very secure! ✅**

---

## Real Example Walkthrough

### You Want to Use AutoDev AI

**Time: 0:00**

```
You: Click "Sign in with GitHub" button
     (on http://localhost:3000)
```

**Time: 0:01**

```
Browser redirects to GitHub login
GitHub: "Hi! Want to authorize AutoDev AI
         to access your repositories?"
```

**Time: 0:02**

```
You: Click "Authorize AutoDev AI"
```

**Time: 0:03**

```
Browser redirects back to localhost:3000
Frontend receives JWT in URL
Frontend stores JWT in sessionStorage
```

**Time: 0:04**

```
You: See dashboard
     Can submit prompts
```

**Time: 0:05**

```
You: Submit: "Build a todo app"
     AutoDev uses encrypted token to create repo
     AutoDev uses token to push code
```

**Time: 0:10**

```
You: See link to your new GitHub repo
     Go to GitHub → see generated code
     Code is already running!
```

**Entire flow: ~10 minutes for AutoDev to generate project**

---

## How to Revoke Access

If you want to disconnect AutoDev AI from your GitHub:

```
1. Go to: https://github.com/settings/applications
2. Find: "AutoDev AI"
3. Click: "Revoke"
4. Done!
   └─ Token becomes invalid
   └─ AutoDev can no longer access your GitHub
   └─ Takes effect immediately
```

---

## OAuth vs Personal Access Token

| Aspect                   | OAuth                     | Personal Token           |
| ------------------------ | ------------------------- | ------------------------ |
| **Security**             | ✅ Better (user controls) | ❌ Risky (app controls)  |
| **User shares password** | ❌ No                     | ✅ Yes (bad!)            |
| **Can be revoked**       | ✅ Yes (1 click)          | ✅ Yes (but more effort) |
| **Permissions**          | ✅ Granular               | ❌ All or nothing        |
| **Modern**               | ✅ Yes (2024+)            | ⚠️ Legacy                |
| **User experience**      | ✅ Great                  | ❌ Scary                 |

**OAuth is better in every way!**

---

## The 30-Second Version

```
You: "Can I use AutoDev AI?"
AutoDev: "Sure, log in with GitHub"
You: Click GitHub button
GitHub: "Is this ok?"
You: "Yes"
GitHub: "Here's a token"
AutoDev: Uses token to create repos
You: Dashboard loads
AutoDev: "Your code is on GitHub"
You: ✨ Done!
```

---

## Key Takeaways

✅ **OAuth is:**

- Secure (passwords stay on GitHub)
- Standard (everyone uses it)
- Convenient (no password to remember)
- Controllable (you can revoke anytime)

✅ **You need to:**

1. Register OAuth app on GitHub (2 min)
2. Copy Client ID and Secret
3. Add to `.env`
4. Done! The app handles the rest

✅ **AutoDev AI can now:**

- Know who you are
- Create repos on your behalf
- Push generated code
- Fully automate your workflow

---

## Next Steps

1. Go to: https://github.com/settings/developers
2. Click: "New OAuth App"
3. Fill in form (see SETUP_CHECKLIST.md or OAUTH_SETUP.md)
4. Copy Client ID and Secret
5. Add to `.env`
6. Run: `docker-compose up --build`
7. Open: http://localhost:3000
8. Click "Sign in with GitHub"
9. Authorize
10. ✨ You're logged in!

Done! OAuth is now working! 🎉
