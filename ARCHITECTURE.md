# 🏗️ AutoDev AI - System Architecture

## High-Level System Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js 14)                               │
│                        Port 3000 / localhost:3000                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ • Login Page (GitHub OAuth)                                          │   │
│  │ • Prompt Input (textarea with Cmd+Enter)                            │   │
│  │ • Real-time Log Console (WebSocket)                                 │   │
│  │ • Task List (polling from API)                                      │   │
│  │ • Repository Link (once job completes)                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
                  │
                  │ REST API + WebSocket
                  │ (JWT in Authorization header)
                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Fastify + Node)                             │
│                        Port 3001 / localhost:3001                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ REST Routes:                                                         │   │
│  │  • GET  /auth/github          → Redirect to GitHub OAuth            │   │
│  │  • GET  /auth/github/callback → Exchange code for JWT               │   │
│  │  • GET  /auth/me              → Get current user (JWT verified)     │   │
│  │  • POST /generate-project     → Enqueue job (JWT required)          │   │
│  │  • GET  /request/:id          → Get job status                      │   │
│  │  • GET  /tasks/:id            → Get planned tasks                   │   │
│  │  • GET  /logs/:id             → Get all logs                        │   │
│  │  • GET  /repos               → List user's GitHub repos            │   │
│  │                                                                      │   │
│  │ WebSocket:                                                           │   │
│  │  • WS   /ws/logs/:id          → Stream logs in real-time            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Pipeline Orchestration (pipeline.ts):                               │   │
│  │                                                                      │   │
│  │  1. Planner Agent                                                   │   │
│  │     Input: project prompt                                           │   │
│  │     Output: ordered list of development tasks                       │   │
│  │     Model: Claude 3.5 Sonnet (temp: 0.3)                           │   │
│  │                                                                      │   │
│  │  2. Generator Agent                                                 │   │
│  │     Input: prompt + task list                                       │   │
│  │     Output: complete source code files                              │   │
│  │     Model: Claude 3.5 Sonnet (temp: 0.2, 8K tokens)                │   │
│  │                                                                      │   │
│  │  3. Docker Sandbox Execution                                        │   │
│  │     Input: generated files                                          │   │
│  │     Output: success/error + stdout/stderr                           │   │
│  │     Limits: 512MB RAM, 1 CPU, no network, timeout 60s              │   │
│  │                                                                      │   │
│  │  4. Debugger Agent Loop (up to 3 retries)                           │   │
│  │     Input: prompt + current files + error output                    │   │
│  │     Output: corrected files                                         │   │
│  │     Model: Claude 3.5 Sonnet (temp: 0.1)                           │   │
│  │                                                                      │   │
│  │  5. GitHub Push                                                      │   │
│  │     Input: final files + encrypted GitHub token                     │   │
│  │     Output: repository URL                                          │   │
│  │     Action: Create repo or push to existing                         │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Support Services:                                                    │   │
│  │  • Crypto (AES-256-GCM token encryption)                           │   │
│  │  • Log Publisher (Redis pub/sub)                                   │   │
│  │  • GitHub API Client (Octokit wrapper)                             │   │
│  │  • Database Repositories (typed CRUD)                              │   │
│  │  • Queue Producer/Worker (BullMQ)                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
                  │
                  │ SQL + Pub/Sub
                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                     DATABASE (Supabase PostgreSQL)                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Tables:                                                              │   │
│  │  • users          → GitHub OAuth users + encrypted tokens           │   │
│  │  • requests       → Project generation jobs                         │   │
│  │  • tasks          → Individual development tasks                    │   │
│  │  • files          → Generated source code                           │   │
│  │  • logs           → Execution events + debugging info               │   │
│  │                                                                      │   │
│  │ Relationships:                                                       │   │
│  │  • requests → tasks, files, logs (via request_id)                   │   │
│  │  • users → requests (implicit, via OAuth)                           │   │
│  │                                                                      │   │
│  │ Indexes:                                                             │   │
│  │  • Optimized for: status lookups, time-range queries                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
                  ▲
                  │
                  └──── Pub/Sub for live logs

┌──────────────────────────────────────────────────────────────────────────────┐
│                     JOB QUEUE (Redis + BullMQ)                               │
│                        Port 6379 / localhost:6379                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ • BullMQ Queue: `generate` job type                                 │   │
│  │ • Producer: Backend enqueues jobs when /generate-project is called   │   │
│  │ • Worker: Picks up jobs & runs pipeline.ts                          │   │
│  │ • Pub/Sub: Broadcasts logs to all connected WebSocket clients       │   │
│  │ • Retry: Failed jobs can be retried (configurable)                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                      AI PROVIDERS & EXTERNAL APIS                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ OpenRouter API (https://openrouter.ai)                              │   │
│  │  • Model: Claude 3.5 Sonnet (configurable via AI_MODEL env)        │   │
│  │  • Used by: Planner, Generator, Debugger agents                    │   │
│  │  • Cost: Cheaper than direct OpenAI, same quality                  │   │
│  │                                                                      │   │
│  │ GitHub REST API (via Octokit)                                       │   │
│  │  • Create repositories                                              │   │
│  │  • Push commits & files                                             │   │
│  │  • Fetch user repos                                                 │   │
│  │  • Uses encrypted OAuth token from database                         │   │
│  │                                                                      │   │
│  │ Docker (local daemon)                                               │   │
│  │  • Build images from generated code                                 │   │
│  │  • Run containers with resource isolation                           │   │
│  │  • Capture stdout/stderr for debugging                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow: From Prompt to GitHub

```
┌─────────────────┐
│  User Submits   │
│  Prompt via UI  │
└────────┬────────┘
         │
         │ (1) POST /api/generate-project (with JWT)
         │ Body: { prompt: "...", targetRepo?: {...} }
         ▼
┌─────────────────────────────────────────────────────┐
│ Backend: Generate Endpoint                          │
│  • Validate JWT                                     │
│  • Create request row (status: "pending")           │
│  • Enqueue job to Redis/BullMQ                      │
│  • Return: { requestId, status: "pending" }         │
└────────┬────────────────────────────────────────────┘
         │
         │ (2) Frontend polls /api/request/:id every 2s
         │     WebSocket connects to /ws/logs/:id
         ▼
┌─────────────────────────────────────────────────────┐
│ BullMQ Worker: Job Picked Up                        │
│  • Update request status: "running"                 │
│  • Publish log: "Starting pipeline..."              │
└────────┬────────────────────────────────────────────┘
         │
         │ (3a) Planner Agent
         │      Input: prompt
         │      → Claude generates task list
         │      → Save tasks to DB
         │      → Publish logs: "Task 1: ...", "Task 2: ..."
         ▼
┌─────────────────────────────────────────────────────┐
│ Task Planning Complete                              │
└────────┬────────────────────────────────────────────┘
         │
         │ (3b) Generator Agent
         │      Input: prompt + task list
         │      → Claude generates source files
         │      → Save files to DB
         │      → Publish logs: "Generated package.json", ...
         ▼
┌─────────────────────────────────────────────────────┐
│ Code Generation Complete                            │
└────────┬────────────────────────────────────────────┘
         │
         │ (3c) Docker Sandbox Execution
         │      Input: generated files
         │      → Write files to temp directory
         │      → Build Docker image from Dockerfile
         │      → Run container with resource limits
         │      → Capture stdout/stderr + exit code
         │      → Publish logs: stdout/stderr
         ▼
         │
         ├─ Success (exit code 0)?  → Jump to step (4)
         │
         └─ Failure (exit code ≠ 0)? → Go to (3d)
                  │
                  │ (3d) Debugger Agent Loop (retry up to 3x)
                  │      Input: prompt + current files + error output
                  │      → Claude analyzes error
                  │      → Claude generates corrected files
                  │      → Update files in DB
                  │      → Re-run sandbox from (3c)
                  │      → Repeat until success or max retries
                  ▼
                  │
                  └─ Success? → Continue to (4)
                               Fail? → Mark as failed, exit
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ (4) GitHub Push                                      │
│  • Decrypt GitHub token from DB                     │
│  • Use Octokit to:                                  │
│    - If targetRepo: push files to existing repo    │
│    - Else: create new repo (autodev-<requestId>)   │
│  • Return: repository URL                          │
│  • Publish log: "Pushed to <github_url>"           │
└────────┬────────────────────────────────────────────┘
         │
         │ (5) Update Database
         │  • Set request status: "completed"
         │  • Store github_url
         │  • Publish final log: "✓ Job complete!"
         ▼
┌─────────────────────────────────────────────────────┐
│ (6) Frontend Receives Updates                       │
│  • Polls /api/request/:id → sees status: "completed"
│  • WebSocket receives final logs in real-time       │
│  • Displays GitHub URL to user                      │
│  • User clicks link → sees auto-generated repo ✨   │
└─────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: User clicks "Sign in with GitHub"                       │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend redirects to: /api/auth/github                          │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend constructs GitHub OAuth URL:                            │
│ https://github.com/login/oauth/authorize?                       │
│   client_id=<GITHUB_CLIENT_ID>&                                 │
│   scope=repo%20user:email&                                      │
│   state=<random>                                                │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ User sees GitHub permission dialog                              │
│ User clicks "Authorize AutoDev AI"                              │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ GitHub redirects to callback with ?code=<authorization_code>    │
│ → /api/auth/github/callback?code=xxx&state=yyy                 │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend exchanges code for access token (server-to-server):     │
│ POST https://github.com/login/oauth/access_token with          │
│   client_id, client_secret, code                                │
│ Response: { access_token: "ghu_...", ... }                      │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend fetches user profile with access token:                 │
│ GET https://api.github.com/user                                 │
│ Response: { id: 12345, login: "username", ... }                │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend operations:                                              │
│ 1. Encrypt access token with AES-256-GCM                        │
│ 2. Upsert user in DB:                                           │
│    - github_id: 12345                                           │
│    - github_username: "username"                                │
│    - encrypted_token: "iv:tag:encrypted_hex"                    │
│ 3. Sign JWT with 7-day expiry:                                  │
│    payload: { userId: "<uuid>", githubUsername: "username" }    │
│    secret: JWT_SECRET                                           │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend redirects to:                                            │
│ http://localhost:3000/#token=<jwt>                              │
│                                                                 │
│ JWT is in URL fragment (#) to avoid being sent to server logs   │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend (useAuth hook):                                        │
│ 1. Extracts JWT from URL hash                                   │
│ 2. Stores in sessionStorage (not localStorage for security)     │
│ 3. Clears URL fragment with history.replaceState()             │
│ 4. Calls GET /auth/me to verify JWT                            │
│ 5. Updates user state                                          │
│ 6. Redirects to dashboard                                       │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ User is logged in! ✓                                            │
│                                                                 │
│ All future API calls include:                                   │
│ Authorization: Bearer <jwt>                                     │
│                                                                 │
│ Backend middleware verifies JWT before processing               │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

| Layer         | Component        | Technology               | Purpose                                 |
| ------------- | ---------------- | ------------------------ | --------------------------------------- |
| **Frontend**  | UI Framework     | Next.js 14 (React)       | Server + client rendering, SEO          |
|               | Styling          | TailwindCSS              | Utility-first CSS                       |
|               | Language         | TypeScript               | Type safety                             |
|               | State            | React Hooks              | useAuth, useAutoDevJob, useRepos        |
|               | API Comm         | Fetch API                | HTTP + WebSocket                        |
| **Backend**   | Framework        | Fastify                  | Fast, minimal web framework             |
|               | Language         | TypeScript               | Type safety, runtime safety             |
|               | Auth             | @fastify/jwt             | JWT token signing & verification        |
|               | WebSocket        | @fastify/websocket       | Real-time log streaming                 |
|               | CORS             | @fastify/cors            | Cross-origin requests                   |
| **Database**  | System           | PostgreSQL (Supabase)    | Relational data + strong consistency    |
|               | Client           | pg (node-postgres)       | Type-safe DB queries                    |
|               | ORM              | None (raw SQL)           | Direct control, no abstraction overhead |
| **Queue**     | System           | Redis                    | In-memory data store                    |
|               | Job Queue        | BullMQ                   | Reliable job processing                 |
|               | Pub/Sub          | Redis Streams            | Live log broadcasting                   |
| **AI Agents** | Model            | Claude 3.5 Sonnet        | High-quality code generation            |
|               | Provider         | OpenRouter               | Cheaper than direct API                 |
|               | Format           | JSON (structured output) | Reliable parsing                        |
| **Sandbox**   | Container        | Docker                   | Isolated, reproducible execution        |
|               | Isolation        | namespaces + cgroups     | Resource limits                         |
|               | Client           | Docker SDK (Node)        | Programmatic image build + run          |
| **VCS**       | System           | GitHub                   | Repository hosting                      |
|               | Client           | Octokit                  | GitHub REST API wrapper                 |
|               | Auth             | OAuth 2.0 + PAT          | User-based repository creation          |
| **Security**  | Token Encryption | AES-256-GCM              | Symmetric encryption (openssl crypto)   |
|               | Session          | JWT                      | Stateless session tokens                |
|               | HTTPS            | TLS 1.3                  | Transport security (production)         |

## File Organization Logic

```
backend/
├── src/                          # Runtime code
│   ├── index.ts                  # App bootstrap & route registration
│   ├── middleware/               # Fastify middleware (auth guards)
│   ├── routes/                   # API endpoint handlers
│   ├── websocket/                # WebSocket handlers
│   └── ...
├── agents/                       # AI agent implementations
│   └── openrouter.ts             # Abstraction layer over API
├── database/                     # Database layer
│   ├── db.ts                     # Connection pool
│   ├── repositories.ts           # CRUD operations (data access layer)
│   └── schema.sql                # DDL (one-time setup)
├── queue/                        # Job queue setup
│   ├── redis.ts                  # Redis client singleton
│   ├── producer.ts               # Job enqueuing logic
│   └── worker.ts                 # Job processing logic
├── sandbox/                      # Execution environment
│   └── dockerRunner.ts           # Docker build + run
├── services/                     # Business logic utilities
│   ├── crypto.ts                 # Encryption/decryption
│   ├── github.ts                 # GitHub API integration
│   ├── logPublisher.ts           # Event publishing
│   └── pipeline.ts               # Orchestration (main logic)
└── package.json

frontend/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Root page (/)
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── PromptInput.tsx           # Form input
│   ├── LogConsole.tsx            # Log display
│   ├── TaskList.tsx              # Task list view
│   ├── RepoList.tsx              # Repo selector
│   └── StatusBadge.tsx           # Status indicator
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Auth state & OAuth flow
│   ├── useAutoDevJob.ts          # Job polling & WebSocket
│   └── useRepos.ts               # Repo list fetching
├── lib/                          # Utilities
│   └── auth.ts                   # Auth header helper
└── package.json
```

This organization keeps concerns separated:

- **Routes** handle HTTP request/response
- **Repositories** handle database operations
- **Agents** handle AI interactions
- **Services** contain business logic
- **Components** are reusable UI blocks
- **Hooks** manage state & side effects
