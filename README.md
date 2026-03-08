# AutoDev AI – Autonomous AI Software Engineer

AutoDev AI takes a plain-English description of a software project and autonomously plans, generates, debugs, sandboxes, and ships it to GitHub — all without human intervention.

---

## Architecture Overview

```
┌─────────────┐   POST /generate-project   ┌─────────────────────────────────────────────┐
│  Next.js UI │ ─────────────────────────► │                Fastify API                  │
│  (port 3000)│ ◄── WebSocket live logs ── │                (port 3001)                  │
└─────────────┘                            └──────┬──────────────────────────────────────┘
                                                  │ enqueue job
                                                  ▼
                                           ┌─────────────┐
                                           │  BullMQ +   │
                                           │  Redis Queue│
                                           └──────┬──────┘
                                                  │ worker picks up job
                                                  ▼
                                    ┌─────────────────────────┐
                                    │      Pipeline Service    │
                                    │                          │
                                    │  1. Planner Agent        │
                                    │  2. Generator Agent      │
                                    │  3. Docker Sandbox       │
                                    │  4. Debugger Agent (loop)│
                                    │  5. GitHub push          │
                                    └──────┬──────────────────┘
                                           │ reads/writes
                                           ▼
                                    ┌─────────────────┐
                                    │ Supabase Postgres│
                                    │  requests        │
                                    │  tasks           │
                                    │  files           │
                                    │  logs            │
                                    └─────────────────┘
```

---

## Project Structure

```
autodev-ai/
├── frontend/                     # Next.js 14 App Router UI
│   ├── app/
│   │   ├── page.tsx              # Dashboard page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── PromptInput.tsx       # Textarea with Cmd+Enter submit
│   │   ├── StatusBadge.tsx       # Animated status pill
│   │   ├── LogConsole.tsx        # Live WebSocket log terminal
│   │   └── TaskList.tsx          # Polled planned-task list
│   ├── hooks/
│   │   └── useAutoDevJob.ts      # Job state + polling hook
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── index.ts              # Fastify bootstrap
│   │   ├── routes/
│   │   │   ├── generate.ts       # POST /api/generate-project
│   │   │   ├── request.ts        # GET  /api/request/:id
│   │   │   ├── logs.ts           # GET  /api/logs/:id
│   │   │   └── tasks.ts          # GET  /api/tasks/:id
│   │   └── websocket/
│   │       └── logStream.ts      # WS  /ws/logs/:id  (Redis pub/sub)
│   ├── agents/
│   │   ├── planner.ts            # GPT-4o: prompt → task list
│   │   ├── generator.ts          # GPT-4o: tasks  → source files
│   │   └── debugger.ts           # GPT-4o: errors → fixed files
│   ├── database/
│   │   ├── db.ts                 # pg Pool singleton + helpers
│   │   ├── repositories.ts       # Typed CRUD for all tables
│   │   └── schema.sql            # DDL for Supabase
│   ├── queue/
│   │   ├── redis.ts              # ioredis singleton
│   │   ├── producer.ts           # BullMQ queue + enqueue helper
│   │   └── worker.ts             # BullMQ worker
│   ├── sandbox/
│   │   └── dockerRunner.ts       # Writes files → builds image → runs container
│   ├── services/
│   │   ├── pipeline.ts           # Main orchestration logic
│   │   ├── github.ts             # Octokit: create repo + push files
│   │   └── logPublisher.ts       # Redis pub/sub publisher
│   └── package.json
│
├── docker/
│   ├── Dockerfile.backend        # Multi-stage Node.js backend image
│   ├── Dockerfile.frontend       # Multi-stage Next.js frontend image
│   └── Dockerfile.sandbox        # Base image for generated code execution
│
├── scripts/
│   └── setup-db.ts               # One-time Supabase schema migration
│
├── docker-compose.yml            # Full stack: redis + backend + frontend
├── .env.example                  # Environment variable template
└── README.md
```

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 14, TailwindCSS, TypeScript     |
| Backend    | Fastify, TypeScript, BullMQ             |
| AI Agents  | OpenAI GPT-4o (structured JSON output) |
| Database   | Supabase (PostgreSQL), `pg` driver      |
| Queue      | Redis + BullMQ                          |
| Sandbox    | Docker (isolated containers)            |
| VCS Push   | GitHub REST API via Octokit             |
| Real-time  | WebSocket + Redis pub/sub               |

---

## Prerequisites

- Node.js ≥ 20
- Docker Desktop (running)
- A [Supabase](https://supabase.com) project (free tier works)
- OpenAI API key with GPT-4o access
- GitHub personal access token (`repo` scope)
- Redis (included via docker-compose, or use Upstash for serverless)

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-org/autodev-ai.git
cd autodev-ai

# Backend deps
cd backend && npm install && cd ..

# Frontend deps
cd frontend && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your real credentials
```

Required variables:

```
DB_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres
OPENAI_KEY=sk-...
GITHUB_TOKEN=ghp_...
GITHUB_USERNAME=your-username
REDIS_URL=redis://localhost:6379
```

### 3. Run database migration

```bash
# From repo root
cd backend
DB_URL="..." ts-node ../scripts/setup-db.ts
```

Or paste the contents of `backend/database/schema.sql` directly into the Supabase SQL editor.

### 4. Start with Docker Compose (recommended)

```bash
docker-compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Redis: localhost:6379

### 5. Local development (without Docker Compose)

```bash
# Terminal 1 – Redis
docker run -p 6379:6379 redis:7-alpine

# Terminal 2 – Backend
cd backend
cp .env.example .env  # fill in values
npm run dev

# Terminal 3 – Frontend
cd frontend
cp .env.example .env.local
npm run dev
```

---

## API Reference

### `POST /api/generate-project`

Start an autonomous project generation job.

**Body:**
```json
{ "prompt": "Build a REST API for a todo app with PostgreSQL and JWT auth" }
```

**Response `202`:**
```json
{ "requestId": "uuid", "status": "pending" }
```

---

### `GET /api/request/:id`

Poll the status of a generation request.

**Response:**
```json
{
  "id": "uuid",
  "prompt": "...",
  "status": "completed",
  "github_url": "https://github.com/user/autodev-xxxx",
  "created_at": "...",
  "updated_at": "..."
}
```

Status values: `pending` → `running` → `completed` | `failed`

---

### `GET /api/tasks/:id`

Returns the planned tasks for a request.

---

### `GET /api/logs/:id`

Returns all execution logs for a request.

---

### `WS /ws/logs/:id`

WebSocket endpoint for live log streaming. Messages are JSON:
```json
{ "message": "Sandbox execution succeeded", "level": "info", "ts": "..." }
```

---

## AI Agent Details

### Planner Agent (`agents/planner.ts`)

- Model: `gpt-4o`
- Input: project description
- Output: ordered JSON array of development task strings
- Temperature: 0.3 (consistent planning)

### Generator Agent (`agents/generator.ts`)

- Model: `gpt-4o`
- Input: project description + task list
- Output: `{ files: [{ path, content }] }` – complete, runnable project
- Temperature: 0.2 (precise code generation)
- `max_tokens`: 8192

### Debugger Agent (`agents/debugger.ts`)

- Model: `gpt-4o`
- Input: project description + current files + sandbox error output
- Output: complete corrected file set
- Invoked up to `SANDBOX_MAX_RETRIES` times (default: 3)
- Temperature: 0.1 (minimal, targeted fixes)

---

## Docker Sandbox

The sandbox runner (`sandbox/dockerRunner.ts`):

1. Writes generated files to a temp directory
2. Builds a Docker image from the project's `Dockerfile` (or auto-generates one)
3. Runs the container with strict resource limits:
   - No network access (`--network none`)
   - 512 MB memory cap
   - 1 CPU
   - Read-only filesystem + `/tmp` tmpfs
4. Captures stdout/stderr and exit code
5. Cleans up the image after execution

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
vercel deploy
# Set env vars in Vercel project settings:
#   NEXT_PUBLIC_API_URL=https://your-backend.com/api
#   NEXT_PUBLIC_WS_URL=wss://your-backend.com/ws
```

### Backend → Docker (VPS / Railway / Fly.io)

```bash
docker build -f docker/Dockerfile.backend -t autodev-backend .
docker run \
  -e DB_URL="..." \
  -e OPENAI_KEY="..." \
  -e GITHUB_TOKEN="..." \
  -e REDIS_URL="..." \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 3001:3001 \
  autodev-backend
```

> **Important:** The Docker socket must be mounted so the backend can spawn sandbox containers.

### Database → Supabase

Use the Supabase dashboard SQL editor to run `backend/database/schema.sql` once.

---

## Environment Variables Reference

| Variable              | Required | Description                                      |
|-----------------------|----------|--------------------------------------------------|
| `DB_URL`              | Yes      | Supabase PostgreSQL connection string            |
| `OPENAI_KEY`          | Yes      | OpenAI API key (needs GPT-4o access)             |
| `GITHUB_TOKEN`        | Yes      | GitHub PAT with `repo` scope                     |
| `GITHUB_USERNAME`     | Yes      | GitHub username (for repo ownership)             |
| `GITHUB_ORG`          | No       | Push to an org instead of personal account       |
| `REDIS_URL`           | Yes      | Redis connection string                          |
| `PORT`                | No       | Backend port (default: 3001)                     |
| `FRONTEND_URL`        | No       | Allowed CORS origin (default: localhost:3000)    |
| `SANDBOX_TIMEOUT_MS`  | No       | Max sandbox execution time ms (default: 60000)   |
| `SANDBOX_MAX_RETRIES` | No       | Max debugger retry attempts (default: 3)         |
| `DB_SSL`              | No       | Set to `false` to disable SSL (default: true)    |

---

## Pipeline Flow (Detailed)

```
User submits prompt
       │
       ▼
POST /api/generate-project
  └── RequestRepo.create()           → inserts row in `requests` (status=pending)
  └── enqueueGenerate()              → pushes job to Redis/BullMQ
       │
       ▼
BullMQ Worker picks up job
  └── runPipeline(requestId, prompt)
        │
        ├─ 1. RequestRepo.updateStatus('running')
        │
        ├─ 2. plannerAgent(prompt)
        │      └── GPT-4o → string[]
        │      └── TaskRepo.bulkCreate()
        │
        ├─ 3. generatorAgent(prompt, tasks)
        │      └── GPT-4o → GeneratedFile[]
        │      └── FileRepo.bulkUpsert()
        │
        ├─ 4. runInSandbox(requestId, files)    ← Docker build + run
        │      ├── EXIT 0 → success ✓
        │      └── EXIT ≠0 → debuggerAgent() → retry (max 3x)
        │
        ├─ 5. pushToGitHub(requestId, files)
        │      └── Octokit: createRepo + pushFile (per file)
        │
        └─ 6. RequestRepo.updateStatus('completed', githubUrl)

Throughout: LogRepo.append() + Redis PUBLISH → WebSocket → UI
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes
4. Open a pull request

---

## License

MIT
