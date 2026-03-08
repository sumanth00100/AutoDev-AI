-- AutoDev AI Database Schema
-- Run this against your Supabase PostgreSQL instance

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- requests table: tracks each AI project generation request
CREATE TABLE IF NOT EXISTS requests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt      TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  github_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tasks table: individual development tasks planned by the Planner Agent
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- files table: generated source code files per request
CREATE TABLE IF NOT EXISTS files (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  path        TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- logs table: execution and pipeline event logs
CREATE TABLE IF NOT EXISTS logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  level       VARCHAR(10) NOT NULL DEFAULT 'info'
                CHECK (level IN ('info', 'warn', 'error', 'debug')),
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for frequent lookups
CREATE INDEX IF NOT EXISTS idx_tasks_request_id   ON tasks(request_id);
CREATE INDEX IF NOT EXISTS idx_files_request_id   ON files(request_id);
CREATE INDEX IF NOT EXISTS idx_logs_request_id    ON logs(request_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at    ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_requests_status    ON requests(status);

-- Auto-update updated_at on requests
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS requests_updated_at ON requests;
CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
