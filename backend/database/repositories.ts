import { query, transaction } from './db';
import { PoolClient } from 'pg';

// ─── Types ─────────────────────────────────────────────────────────────────

export type RequestStatus = 'pending' | 'running' | 'completed' | 'failed';
export type TaskStatus    = 'pending' | 'running' | 'completed' | 'failed';
export type LogLevel      = 'info' | 'warn' | 'error' | 'debug';

export interface Request {
  id: string;
  user_id: string | null;
  prompt: string;
  status: RequestStatus;
  github_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  request_id: string;
  description: string;
  status: TaskStatus;
  created_at: Date;
}

export interface File {
  id: string;
  request_id: string;
  path: string;
  content: string;
  created_at: Date;
}

export interface Log {
  id: string;
  request_id: string;
  level: LogLevel;
  message: string;
  created_at: Date;
}

// ─── Request Repository ─────────────────────────────────────────────────────

export const RequestRepo = {
  async create(prompt: string, userId?: string): Promise<Request> {
    const rows = await query<Request>(
      `INSERT INTO requests (prompt, user_id) VALUES ($1, $2) RETURNING *`,
      [prompt, userId ?? null]
    );
    return rows[0];
  },

  async findById(id: string): Promise<Request | null> {
    const rows = await query<Request>(`SELECT * FROM requests WHERE id = $1`, [id]);
    return rows[0] ?? null;
  },

  async updateStatus(id: string, status: RequestStatus, githubUrl?: string): Promise<void> {
    await query(
      `UPDATE requests SET status = $1, github_url = COALESCE($2, github_url) WHERE id = $3`,
      [status, githubUrl ?? null, id]
    );
  },
};

// ─── Task Repository ────────────────────────────────────────────────────────

export const TaskRepo = {
  async bulkCreate(requestId: string, descriptions: string[], client?: PoolClient): Promise<Task[]> {
    if (descriptions.length === 0) return [];
    const exec = client ?? { query: async (sql: string, p: unknown[]) => ({ rows: await query(sql, p) }) };

    const tasks: Task[] = [];
    for (const desc of descriptions) {
      const rows = await (client
        ? client.query<Task>(`INSERT INTO tasks (request_id, description) VALUES ($1, $2) RETURNING *`, [requestId, desc])
        : query<Task>(`INSERT INTO tasks (request_id, description) VALUES ($1, $2) RETURNING *`, [requestId, desc]));
      tasks.push(client ? (rows as any).rows[0] : (rows as Task[])[0]);
    }
    return tasks;
  },

  async findByRequestId(requestId: string): Promise<Task[]> {
    return query<Task>(`SELECT * FROM tasks WHERE request_id = $1 ORDER BY created_at`, [requestId]);
  },

  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    await query(`UPDATE tasks SET status = $1 WHERE id = $2`, [status, id]);
  },
};

// ─── File Repository ─────────────────────────────────────────────────────────

export const FileRepo = {
  async bulkUpsert(requestId: string, files: { path: string; content: string }[]): Promise<void> {
    await transaction(async (client) => {
      await client.query(`DELETE FROM files WHERE request_id = $1`, [requestId]);
      for (const f of files) {
        await client.query(
          `INSERT INTO files (request_id, path, content) VALUES ($1, $2, $3)`,
          [requestId, f.path, f.content]
        );
      }
    });
  },

  async findByRequestId(requestId: string): Promise<File[]> {
    return query<File>(`SELECT * FROM files WHERE request_id = $1 ORDER BY path`, [requestId]);
  },
};

// ─── User Repository ─────────────────────────────────────────────────────────

export interface User {
  id:              string;
  github_id:       number;
  github_username: string;
  encrypted_token: string;
  created_at:      Date;
  updated_at:      Date;
}

export const UserRepo = {
  async upsert(githubId: number, githubUsername: string, encryptedToken: string): Promise<User> {
    const rows = await query<User>(
      `INSERT INTO users (github_id, github_username, encrypted_token)
       VALUES ($1, $2, $3)
       ON CONFLICT (github_id) DO UPDATE
         SET github_username = EXCLUDED.github_username,
             encrypted_token = EXCLUDED.encrypted_token,
             updated_at      = NOW()
       RETURNING *`,
      [githubId, githubUsername, encryptedToken]
    );
    return rows[0];
  },

  async findById(id: string): Promise<User | null> {
    const rows = await query<User>(`SELECT * FROM users WHERE id = $1`, [id]);
    return rows[0] ?? null;
  },
};

// ─── Log Repository ──────────────────────────────────────────────────────────

export const LogRepo = {
  async append(requestId: string, message: string, level: LogLevel = 'info'): Promise<Log> {
    const rows = await query<Log>(
      `INSERT INTO logs (request_id, level, message) VALUES ($1, $2, $3) RETURNING *`,
      [requestId, level, message]
    );
    return rows[0];
  },

  async findByRequestId(requestId: string): Promise<Log[]> {
    return query<Log>(
      `SELECT * FROM logs WHERE request_id = $1 ORDER BY created_at`,
      [requestId]
    );
  },
};
