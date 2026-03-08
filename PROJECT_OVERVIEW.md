# AutoDev AI - Complete Project Overview

## 🎯 What This Project Does

AutoDev AI is an **autonomous AI software engineer** that:

1. Takes a plain-English project description from the user
2. Plans the architecture (Planner Agent using Claude)
3. Generates complete, runnable code (Generator Agent)
4. Tests it in an isolated Docker sandbox
5. Auto-fixes bugs if the sandbox fails (Debugger Agent loop)
6. Pushes the final code to GitHub automatically

All without any human intervention after the initial prompt.

---

## 🏗️ Architecture at a Glance

```
┌─ Frontend (Next.js) ─────────────────────────────────────────┐
│  • Login with GitHub OAuth                                    │
│  • Submit project descriptions                                │
│  • Real-time log streaming via WebSocket                      │
│  • View generated tasks & repo links                          │
└─────────────────────────────────────────────────────────────┘
                            ↕️ REST API + WebSocket
┌─ Backend (Fastify) ──────────────────────────────────────────┐
│  • OAuth flow: /auth/github → /auth/github/callback           │
│  • Generate endpoint: POST /api/generate-project              │
│  • Enqueues jobs to Redis/BullMQ                              │
│  • Worker picks up jobs & orchestrates pipeline               │
└─────────────────────────────────────────────────────────────┘
                            ↕️ SQL + Pub/Sub
┌─ Database (Supabase/PostgreSQL) ─────────────────────────────┐
│  • users: GitHub OAuth users + encrypted tokens              │
│  • requests: project generation jobs                         │
│  • tasks: planned development tasks                          │
│  • files: generated source code                              │
│  • logs: execution events                                    │
└─────────────────────────────────────────────────────────────┘

┌─ Queue (Redis + BullMQ) ─────────────────────────────────────┐
│  • Job queue for background processing                        │
│  • Pub/Sub for live log streaming                             │
└─────────────────────────────────────────────────────────────┘

┌─ AI Agents (Claude via OpenRouter) ──────────────────────────┐
│  • Planner: Breaks down requirements into tasks              │
│  • Generator: Writes complete code from tasks                │
│  • Debugger: Fixes errors from sandbox failures              │
└─────────────────────────────────────────────────────────────┘

┌─ Sandbox (Docker) ───────────────────────────────────────────┐
│  • Isolated execution of generated code                       │
│  • Resource limits (512MB RAM, 1 CPU, no network)            │
│  • Captures stdout/stderr for debugging                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow (OAuth 2.0)

### Current Implementation (No Changes Needed!)

```
1. User clicks "Sign in with GitHub" button
   ↓
2. Frontend redirects to: GET /api/auth/github
   ↓
3. Backend redirects to GitHub OAuth authorization URL
   (Scope: repo user:email)
   ↓
4. User grants permission on GitHub
   ↓
5. GitHub redirects to: GET /api/auth/github/callback?code=XXX
   ↓
6. Backend exchanges code for access token (GitHub API)
   ↓
7. Backend fetches user profile (github.com/user)
   ↓
8. Backend encrypts token + upserts user in DB
   ↓
9. Backend signs JWT (7-day expiry)
   ↓
10. Backend redirects to frontend with: /#token=<jwt>
    ↓
11. Frontend extracts JWT from URL, stores in sessionStorage
    ↓
12. Frontend uses JWT in Authorization header for all API calls
```

### Key Security Details

- **GitHub Token Encryption**: Uses AES-256-GCM (backend/services/crypto.ts)
- **JWT**: Session token with 7-day expiration, signed with `JWT_SECRET`
- **Token Storage**: Encrypted in DB, JWT in sessionStorage (never localStorage)
- **API Authentication**: All protected endpoints require valid JWT in `Authorization: Bearer <token>` header

---

## 📁 Project Structure Deep Dive

### Backend

```
backend/
├── src/
│   ├── index.ts                 # Fastify app bootstrap + middleware setup
│   ├── middleware/
│   │   └── authenticate.ts      # JWT verification middleware
│   ├── routes/
│   │   ├── auth.ts              # OAuth flow + /auth/me endpoint
│   │   ├── generate.ts          # POST /api/generate-project (requires JWT)
│   │   ├── request.ts           # GET /api/request/:id (get job status)
│   │   ├── logs.ts              # GET /api/logs/:id (get job logs)
│   │   ├── tasks.ts             # GET /api/tasks/:id (get planned tasks)
│   │   └── repos.ts             # GET /api/repos (list user's GitHub repos)
│   └── websocket/
│       └── logStream.ts         # WS /ws/logs/:id (live log streaming)
│
├── agents/
│   ├── planner.ts               # Claude agent: prompt → task array
│   ├── generator.ts             # Claude agent: tasks → source files
│   ├── debugger.ts              # Claude agent: error → fixed files
│   └── openrouter.ts            # OpenRouter API client wrapper
│
├── database/
│   ├── db.ts                    # pg.Pool singleton + connection helpers
│   ├── repositories.ts          # Typed CRUD for users, requests, tasks, files, logs
│   └── schema.sql               # DDL: CREATE TABLE statements
│
├── queue/
│   ├── redis.ts                 # ioredis singleton
│   ├── producer.ts              # BullMQ queue + enqueueGenerate()
│   └── worker.ts                # BullMQ worker that runs pipeline
│
├── sandbox/
│   └── dockerRunner.ts          # Docker API: write files → build → run → capture output
│
├── services/
│   ├── crypto.ts                # AES-256-GCM encrypt/decrypt for GitHub tokens
│   ├── github.ts                # Octokit wrapper: create repo + push files
│   ├── logPublisher.ts          # Redis pub/sub for live logs
│   └── pipeline.ts              # Main orchestration: planner → generator → sandbox → github
│
└── package.json
```

### Frontend

```
frontend/
├── app/
│   ├── page.tsx                 # Main dashboard: login screen + job submission + live logs
│   ├── layout.tsx               # Root layout + globals
│   └── globals.css              # TailwindCSS styles
│
├── components/
│   ├── PromptInput.tsx          # Textarea for project description
│   ├── StatusBadge.tsx          # Animated status indicator (pending/running/completed/failed)
│   ├── LogConsole.tsx           # Live log terminal (WebSocket messages)
│   ├── TaskList.tsx             # Display planned tasks
│   └── RepoList.tsx             # Select existing repo (optional)
│
├── hooks/
│   ├── useAuth.ts               # Parse JWT from URL fragment, manage login/logout
│   ├── useAutoDevJob.ts         # Poll job status, handle submission
│   └── useRepos.ts              # Fetch user's GitHub repos
│
├── lib/
│   └── auth.ts                  # Helper: add JWT to request headers
│
└── package.json
```

---

## 🔑 Environment Variables Required

### GitHub OAuth Setup (What You Need to Do)

Go to: **https://github.com/settings/developers** → **OAuth Apps** → **New OAuth App**

Fill in:

- **Application name**: AutoDev AI
- **Homepage URL**: http://localhost:3000 (or your production domain)
- **Authorization callback URL**: http://localhost:3001/api/auth/github/callback

Then copy:

- **Client ID** → `GITHUB_CLIENT_ID`
- **Client Secret** → `GITHUB_CLIENT_SECRET`

### Other Required Variables

```bash
# Database (from Supabase dashboard)
DB_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres
DB_SSL=true

# AI Model (OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-...
AI_MODEL=anthropic/claude-3.5-sonnet

# Security (generate with: openssl rand -hex 32)
JWT_SECRET=<32-byte hex string>
TOKEN_ENCRYPTION_KEY=<32-byte hex string>

# GitHub (for fallback token pushes, optional with OAuth)
GITHUB_TOKEN=ghp_...
GITHUB_USERNAME=your-username

# Redis (default for docker-compose)
REDIS_URL=redis://localhost:6379

# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Data Flow: From Prompt to GitHub

1. **User submits prompt** via frontend

   - Frontend calls: `POST /api/generate-project` with JWT
   - Includes optional `targetRepo` to push to existing repo

2. **Backend creates request** in DB

   - Status: `pending`
   - Enqueues job to Redis

3. **BullMQ Worker picks up job**

   - Starts pipeline orchestration

4. **Pipeline Steps**:

   **a) Planner Agent**

   - Reads: project description
   - Claude generates: ordered task array
   - Saves: tasks to `tasks` table
   - Logs: "Task 1: Set up Express server", etc.

   **b) Generator Agent**

   - Reads: description + tasks
   - Claude generates: `{ files: [{ path, content }] }`
   - Saves: files to `files` table
   - Logs: "Generated package.json", etc.

   **c) Docker Sandbox**

   - Writes generated files to temp directory
   - Builds Docker image
   - Runs with limits (512MB, 1 CPU, no network)
   - Captures stderr/stdout
   - If exit code ≠ 0: goto step (d)
   - If success: goto step (e)

   **d) Debugger Agent** (retry loop, max 3x)

   - Reads: description + current files + error output
   - Claude generates: corrected files
   - Overwrites files in DB
   - Re-runs sandbox
   - Repeat until success or max retries

   **e) GitHub Push**

   - Creates new repo OR pushes to existing repo
   - Uses Octokit + encrypted GitHub token from DB
   - Pushes all files

5. **Update DB**

   - Status: `completed`
   - GitHub URL stored

6. **Live Updates**
   - All logs published via Redis pub/sub
   - WebSocket clients receive in real-time
   - Frontend displays in log console

---

## 🔄 Database Schema

### users

```sql
id (UUID)             → Unique user ID
github_id (BIGINT)    → GitHub user ID (for linking)
github_username       → For display + GitHub API calls
encrypted_token       → AES-256-GCM encrypted GitHub access token
created_at
updated_at
```

### requests

```sql
id (UUID)             → Job ID
prompt (TEXT)         → User's project description
status                → pending | running | completed | failed
github_url            → Link to generated repo
created_at
updated_at
```

### tasks

```sql
id (UUID)
request_id (FK)       → Links to requests
description           → "Set up database schema", etc.
status                → pending | running | completed | failed
created_at
```

### files

```sql
id (UUID)
request_id (FK)       → Links to requests
path                  → "src/index.ts", "package.json", etc.
content               → Full source code
created_at
```

### logs

```sql
id (UUID)
request_id (FK)       → Links to requests
level                 → info | warn | error | debug
message               → "Sandbox execution succeeded", etc.
created_at
```

---

## 🛠️ Key Components Explained

### authenticate.ts (Middleware)

- Verifies JWT from `Authorization: Bearer <token>` header
- Extracts `userId` + `githubUsername` to `req.user`
- Returns 401 if missing or invalid

### useAutoDevJob.ts (Frontend Hook)

- Submits prompt to backend
- Polls `/api/request/:id` for status updates (every 2s)
- Connects WebSocket to `/ws/logs/:id` for live logs
- Tracks job state (pending → running → completed/failed)

### pipeline.ts (Main Orchestration)

1. Calls `plannerAgent(prompt)` → saves tasks
2. Calls `generatorAgent(prompt, tasks)` → saves files
3. Calls `runInSandbox(requestId, files)` → executes
4. If error, calls `debuggerAgent()` up to 3 times
5. Calls `pushToGitHub(files, token)` → creates repo + pushes
6. Updates status to `completed`

### logPublisher.ts (Real-time Logs)

- Every agent/sandbox step: calls `publishLog(requestId, message, level)`
- Redis PUBLISH to channel: `logs:${requestId}`
- WebSocket handler subscribes to channel
- Messages streamed to frontend in real-time

---

## ✅ TODO: Get It Running

### Step 1: GitHub OAuth Registration (2 minutes)

1. Go to: https://github.com/settings/developers
2. Click: "OAuth Apps" → "New OAuth App"
3. Fill in form:
   - App name: "AutoDev AI"
   - Homepage: http://localhost:3000
   - Callback: http://localhost:3001/api/auth/github/callback
4. Copy Client ID + Secret → `.env`

### Step 2: Supabase Setup

1. Create free tier at https://supabase.com
2. New project → copy connection string
3. Run SQL from `backend/database/schema.sql` in SQL editor

### Step 3: OpenRouter Key

1. Create account at https://openrouter.ai
2. Copy API key

### Step 4: Environment

```bash
# From project root
cp .env.example .env

# Fill in:
# - GITHUB_CLIENT_ID (from OAuth app)
# - GITHUB_CLIENT_SECRET (from OAuth app)
# - DB_URL (from Supabase)
# - OPENROUTER_API_KEY
# - JWT_SECRET and TOKEN_ENCRYPTION_KEY (run: openssl rand -hex 32)
```

### Step 5: Dependencies

```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Step 6: Run

```bash
# Option A: Docker Compose (all-in-one)
docker-compose up --build

# Option B: Manual (3 terminals)
# Terminal 1: redis
docker run -p 6379:6379 redis:7-alpine

# Terminal 2: backend
cd backend && npm run dev

# Terminal 3: frontend
cd frontend && npm run dev
```

### Step 7: Test

- Open http://localhost:3000
- Click "Sign in with GitHub"
- Should redirect to GitHub → back to dashboard
- Try submitting: "Build a hello world express server with TypeScript"

---

## 🎓 Understanding the AI Agents

All agents use **Claude 3.5 Sonnet** via OpenRouter with structured JSON output.

### Planner Agent

- **Prompt**: "You are an expert software architect. Break down this requirement into 5-7 concrete development tasks."
- **Output**: `{ tasks: ["Set up project structure", "Implement auth", ...] }`
- **Temperature**: 0.3 (consistent)

### Generator Agent

- **Prompt**: "You are an expert full-stack developer. Given these tasks, generate COMPLETE, WORKING source code."
- **Output**: `{ files: [{ path: "src/index.ts", content: "..." }, ...] }`
- **Temperature**: 0.2 (precise)
- **Max tokens**: 8192

### Debugger Agent

- **Prompt**: "The code failed with this error. Fix ONLY what's broken. Return corrected files."
- **Output**: `{ files: [{ path, content }, ...] }`
- **Temperature**: 0.1 (minimal, targeted)
- Called up to 3 times if sandbox fails

---

## 🔒 Security Highlights

1. **GitHub Token Encryption**: Stored encrypted in DB, decrypted only when needed
2. **JWT**: Short-lived (7 days), signed with secret
3. **Sandbox Isolation**: Docker containers with network disabled
4. **CORS**: Limited to `FRONTEND_URL`
5. **Rate Limiting**: Not yet implemented (could add via fastify-rate-limit)

---

## 📊 Current Status

✅ **Implemented**:

- GitHub OAuth flow (login)
- Project generation pipeline
- Docker sandbox execution
- AI agent orchestration
- Database persistence
- Real-time log streaming
- GitHub repository creation & push

❌ **Not Yet**:

- Rate limiting
- Email notifications
- User dashboard / job history (partially done)
- Payment/credits system
- CLI tool

---

## 🚢 Deployment

### Frontend → Vercel

```bash
cd frontend
vercel deploy

# Set env vars in Vercel:
NEXT_PUBLIC_API_URL=https://your-backend.com/api
NEXT_PUBLIC_WS_URL=wss://your-backend.com/ws
```

### Backend → Docker (Railway/Fly.io/VPS)

```bash
docker build -f docker/Dockerfile.backend -t autodev-backend .
docker run -e DB_URL=... -e OPENROUTER_API_KEY=... -e JWT_SECRET=... \
  -e TOKEN_ENCRYPTION_KEY=... -e GITHUB_CLIENT_ID=... \
  -e GITHUB_CLIENT_SECRET=... \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 3001:3001 autodev-backend
```

⚠️ **Important**: Docker socket must be mounted so backend can spawn sandbox containers.

---

## 🤔 FAQ

**Q: Does the user need a GitHub personal access token?**
A: Only if pushing to the user's own personal repos. OAuth tokens are preferred now.

**Q: What happens if the sandbox fails 3 times?**
A: Job marked as `failed`. User sees logs in real-time and can retry.

**Q: Can I use a different AI model?**
A: Yes! OpenRouter supports 200+ models. Change `AI_MODEL` env var.

**Q: Is the frontend secure?**
A: JWT is never sent to server logs (URL fragment). SessionStorage is used, not localStorage.

**Q: How do I extend the pipeline?**
A: Add new agents in `agents/`, then call them in `pipeline.ts` orchestration.

---

**You're all set! The OAuth is already implemented — you just need to register the app on GitHub and fill in the env vars.** 🚀
