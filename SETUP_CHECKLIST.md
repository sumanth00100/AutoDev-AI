# ✅ AutoDev AI - Complete Setup Checklist

## Phase 1: Understanding (5-60 minutes)

Choose based on your available time:

### ⏱️ 5-Minute Overview

- [ ] Read `START_HERE.md`
- [ ] Understand it's an autonomous AI software engineer
- [ ] Know that OAuth is already implemented

### ⏱️ 15-Minute Understanding

- [ ] Read `PROJECT_OVERVIEW.md`
- [ ] Read `OAUTH_VISUAL_GUIDE.md`
- [ ] Understand the complete flow

### ⏱️ 30-Minute Deep Dive

- [ ] Add `ARCHITECTURE.md` to above
- [ ] Understand all components

### ⏱️ 60-Minute Expert Level

- [ ] Add `STATUS.md` to above
- [ ] Review implementation status
- [ ] Understand the roadmap

---

## Phase 2: Setup (15 minutes total)

### Step 1: GitHub OAuth Registration (2 minutes)

- [ ] Open https://github.com/settings/developers
- [ ] Click "New OAuth App"
- [ ] Fill in form:
  - [ ] Application name: `AutoDev AI`
  - [ ] Homepage URL: `http://localhost:3000`
  - [ ] Application description: `Autonomous AI Software Engineer`
  - [ ] Authorization callback URL: `http://localhost:3001/api/auth/github/callback`
- [ ] Click "Register application"
- [ ] Copy **Client ID**
- [ ] Copy **Client Secret** (click to reveal)
- [ ] ⚠️ Keep Client Secret safe - never commit to git!

### Step 2: Supabase Account (2 minutes)

- [ ] Open https://supabase.com
- [ ] Sign up / Log in
- [ ] Create new project
- [ ] Wait for project initialization
- [ ] Go to Project Settings → Database
- [ ] Copy PostgreSQL connection string
- [ ] Format: `postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres`

### Step 3: OpenRouter API Key (1 minute)

- [ ] Open https://openrouter.ai
- [ ] Sign up / Log in
- [ ] Go to API keys section
- [ ] Copy API key
- [ ] Format: `sk-or-v1-...`

### Step 4: Environment Configuration (2 minutes)

```bash
# From project root
cp .env.example .env
```

- [ ] Open `.env` in your editor
- [ ] Fill in GitHub OAuth:
  ```bash
  GITHUB_CLIENT_ID=Ov23li...
  GITHUB_CLIENT_SECRET=ghp_...
  ```
- [ ] Fill in Database:
  ```bash
  DB_URL=postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres
  DB_SSL=true
  ```
- [ ] Fill in OpenRouter:
  ```bash
  OPENROUTER_API_KEY=sk-or-v1-...
  AI_MODEL=anthropic/claude-3.5-sonnet
  ```
- [ ] Generate JWT Secret:
  ```bash
  openssl rand -hex 32
  # Copy output to: JWT_SECRET=...
  ```
- [ ] Generate Token Encryption Key:
  ```bash
  openssl rand -hex 32
  # Copy output to: TOKEN_ENCRYPTION_KEY=...
  ```
- [ ] Verify other env vars are set:
  ```bash
  FRONTEND_URL=http://localhost:3000
  NEXT_PUBLIC_API_URL=http://localhost:3001/api
  NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
  REDIS_URL=redis://localhost:6379
  ```

### Step 5: Install Dependencies (2 minutes)

```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed

### Step 6: Run Locally (1 minute)

```bash
docker-compose up --build
```

Wait for:

- [ ] Redis to start
- [ ] Backend to start (port 3001)
- [ ] Frontend to start (port 3000)

---

## Phase 3: Verification (5 minutes)

### Test Login

- [ ] Open http://localhost:3000
- [ ] Click "Sign in with GitHub"
- [ ] Should redirect to GitHub authorization page
- [ ] Click "Authorize"
- [ ] Should redirect back to dashboard
- [ ] Should show login status

### Test Job Submission

- [ ] Enter prompt: `"Build a hello world express server with TypeScript"`
- [ ] Click submit or press Cmd+Enter
- [ ] Should see status change to "running"
- [ ] Should see logs appearing in real-time
- [ ] Should eventually see "completed"
- [ ] Should show GitHub repository link

### Verify Components

- [ ] Check logs are streaming live (WebSocket working)
- [ ] Check tasks are displayed (API working)
- [ ] Check status updates (polling working)
- [ ] Check GitHub link works (repo created)

---

## Phase 4: Troubleshooting (if needed)

### OAuth Issues

- [ ] Verify callback URL matches exactly: `http://localhost:3001/api/auth/github/callback`
- [ ] Check Client ID and Secret are correct
- [ ] Check they're in `.env` file
- [ ] Restart backend: `docker-compose restart`

### Database Issues

- [ ] Check DB_URL is correct (copy from Supabase)
- [ ] Check postgres connection can be made
- [ ] Check DB_SSL=true is set
- [ ] Run schema migration if needed

### Job Execution Issues

- [ ] Check OPENROUTER_API_KEY is set
- [ ] Check Docker is running (for sandbox)
- [ ] Check Redis is running
- [ ] Review logs for error details

### Port Already in Use

- [ ] Kill existing processes:
  ```bash
  lsof -i :3000  # Frontend
  lsof -i :3001  # Backend
  lsof -i :6379  # Redis
  ```
- [ ] Or change ports in docker-compose.yml

---

## Phase 5: Next Steps

After successful setup:

### Immediate (Today)

- [ ] Read `PROJECT_OVERVIEW.md` for complete understanding
- [ ] Try different prompts to see capabilities
- [ ] Check generated GitHub repositories

### Short Term (This Week)

- [ ] Read `ARCHITECTURE.md` to understand components
- [ ] Read `STATUS.md` for roadmap
- [ ] Explore code in `backend/services/pipeline.ts`

### Medium Term (This Month)

- [ ] Deploy to production (Railway/Fly.io)
- [ ] Add custom features
- [ ] Integrate with your workflow

---

## 📚 Documentation Reference

| Need             | File                    | Time   |
| ---------------- | ----------------------- | ------ |
| Quick start      | `QUICK_START.md`        | 5 min  |
| Full overview    | `PROJECT_OVERVIEW.md`   | 15 min |
| OAuth details    | `OAUTH_VISUAL_GUIDE.md` | 8 min  |
| Architecture     | `ARCHITECTURE.md`       | 15 min |
| Status & roadmap | `STATUS.md`             | 10 min |
| Navigation       | `DOCS_INDEX.md`         | 5 min  |

---

## ✨ Success Criteria

You'll know it's working when:

1. ✅ Can log in with GitHub
2. ✅ Can see dashboard
3. ✅ Can submit a prompt
4. ✅ Can see real-time logs
5. ✅ Job completes successfully
6. ✅ GitHub repo is created with code
7. ✅ Code is runnable

---

## 🆘 Getting Help

If something doesn't work:

1. Check the relevant troubleshooting section above
2. Review `STATUS.md` FAQ section
3. Check logs: `docker-compose logs -f`
4. Verify environment variables: `cat .env | grep -v "^#"`

---

## 📝 Notes

- Keep `.env` file secure - never commit it
- Client Secret should never be shared
- JWT_SECRET and TOKEN_ENCRYPTION_KEY should be regenerated for production
- Docker must be running to use sandbox execution

---

## ⏱️ Time Summary

| Phase         | Duration               |
| ------------- | ---------------------- |
| Understanding | 5-60 min (your choice) |
| Setup         | 15 min                 |
| Verification  | 5 min                  |
| **TOTAL**     | **25-80 min**          |

**Most common: 30 minutes** (5 min reading + 15 min setup + 5 min verification + 5 min testing)

---

## 🎉 You're Done!

Once you've completed all checkboxes, AutoDev AI is ready to use!

Next: Read `PROJECT_OVERVIEW.md` to fully understand what you have.
