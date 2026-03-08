# ⚡ Quick Start Checklist

## Before You Run Anything

### 1️⃣ Register GitHub OAuth App (2 min)

- [ ] Go to https://github.com/settings/developers → OAuth Apps
- [ ] Create "AutoDev AI" app
  - Callback: `http://localhost:3001/api/auth/github/callback`
- [ ] Copy **Client ID** and **Client Secret**
- [ ] Reference: `OAUTH_SETUP.md` in this repo

### 2️⃣ Create Supabase Project (2 min)

- [ ] Sign up at https://supabase.com (free tier)
- [ ] Create new project
- [ ] Copy PostgreSQL connection string
  - Format: `postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres`

### 3️⃣ Get OpenRouter API Key (1 min)

- [ ] Sign up at https://openrouter.ai
- [ ] Copy API key from dashboard

### 4️⃣ Set Up Environment Variables

```bash
# From repo root
cp .env.example .env

# Edit .env and fill in:
GITHUB_CLIENT_ID=<from GitHub OAuth app>
GITHUB_CLIENT_SECRET=<from GitHub OAuth app>
DB_URL=<from Supabase>
OPENROUTER_API_KEY=<from OpenRouter>

# Generate these (openssl rand -hex 32):
JWT_SECRET=<paste output>
TOKEN_ENCRYPTION_KEY=<paste output>
```

### 5️⃣ Install Dependencies

```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 6️⃣ Run the App

**Option A: Docker Compose (Easiest)**

```bash
docker-compose up --build
```

Opens:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Redis: localhost:6379

**Option B: Manual (3 terminals)**

```bash
# Terminal 1: Redis
docker run -p 6379:6379 redis:7-alpine

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: Frontend
cd frontend && npm run dev
```

## ✅ First Run Test

1. Open http://localhost:3000
2. Click "Sign in with GitHub"
3. You should be redirected to GitHub → back to app
4. Try prompt: `"Build a hello world express server with TypeScript"`
5. Watch logs in real-time
6. Check GitHub for created repository

## 📚 Documentation

- **PROJECT_OVERVIEW.md** — Complete architecture & data flow
- **OAUTH_SETUP.md** — Detailed OAuth setup with diagrams
- **README.md** — Original project docs

## 🚀 What Happens After You Submit a Prompt

1. **Planner Agent** breaks down your request into tasks (Claude)
2. **Generator Agent** writes complete source code (Claude)
3. **Sandbox** builds a Docker image & runs the code
4. **Debugger Agent** fixes any errors (up to 3 retries)
5. **GitHub** creates a repo & pushes all files automatically
6. **You** get a link to your finished project ✨

All in ~2-5 minutes, **completely automated**.

## 🆘 Troubleshooting

### "Cannot connect to database"

- Check `DB_URL` is correct
- Verify Supabase project is running
- Try running schema: `backend/database/schema.sql` in Supabase SQL editor

### "Invalid GitHub credentials"

- Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- Verify callback URL matches: `http://localhost:3001/api/auth/github/callback`

### "OPENROUTER_API_KEY not set"

- Make sure it's in `.env` and backend is restarted

### WebSocket connection fails

- Check `NEXT_PUBLIC_WS_URL` is correct
- Verify frontend can reach `http://localhost:3001`

### Docker sandbox issues

- Make sure Docker Desktop is running
- Check `docker ps` to see containers

## 💡 Pro Tips

- **Detailed Prompts** → Better code. Include tech stack, features, requirements.
- **Watch the Logs** → You'll see the AI thinking in real-time.
- **Inspect Generated Code** → The GitHub repos are fully functional.
- **Iterate Quickly** → Each generation takes 2-5 minutes.

---

**You're all set!** 🎉 Start with `docker-compose up --build` and let AutoDev AI work its magic.
