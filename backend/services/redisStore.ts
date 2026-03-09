/**
 * Redis-backed store replacing the PostgreSQL database.
 * All data is stored with a 7-day TTL (except user records which persist).
 */
import { randomUUID } from 'crypto';
import { getRedis }   from '../queue/redis';

const JOB_TTL  = 7 * 24 * 60 * 60; // 7 days in seconds
const USER_TTL = 0;                  // no expiry for users

// ── Types ────────────────────────────────────────────────────────────────────

export type RequestStatus = 'pending' | 'running' | 'completed' | 'failed';
export type TaskStatus    = 'pending' | 'running' | 'completed' | 'failed';
export type LogLevel      = 'info' | 'warn' | 'error' | 'debug';

export interface User {
  id:              string;
  github_id:       number;
  github_username: string;
  encrypted_token: string;
  created_at:      string;
  updated_at:      string;
}

export interface Request {
  id:         string;
  user_id:    string | null;
  prompt:     string;
  status:     RequestStatus;
  github_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id:          string;
  request_id:  string;
  description: string;
  status:      TaskStatus;
  created_at:  string;
}

export interface Log {
  id:         string;
  request_id: string;
  level:      LogLevel;
  message:    string;
  created_at: string;
}

// ── User Store ───────────────────────────────────────────────────────────────

export const UserStore = {
  async upsert(githubId: number, githubUsername: string, encryptedToken: string): Promise<User> {
    const redis = getRedis();
    const now   = new Date().toISOString();

    // Check if user already exists by github_id
    const existing = await redis.get(`user:gh:${githubId}`);
    const id       = existing ?? randomUUID();

    const user: User = {
      id,
      github_id:       githubId,
      github_username: githubUsername,
      encrypted_token: encryptedToken,
      created_at:      existing ? (await redis.hget(`user:${id}`, 'created_at') ?? now) : now,
      updated_at:      now,
    };

    await redis.hmset(`user:${id}`, {
      id,
      github_id:       String(githubId),
      github_username: githubUsername,
      encrypted_token: encryptedToken,
      created_at:      user.created_at,
      updated_at:      now,
    });

    // Index github_id → uuid
    await redis.set(`user:gh:${githubId}`, id);

    return user;
  },

  async findById(id: string): Promise<User | null> {
    const redis = getRedis();
    const data  = await redis.hgetall(`user:${id}`);
    if (!data || !data.id) return null;
    return {
      ...data,
      github_id: Number(data.github_id),
    } as User;
  },
};

// ── Request Store ─────────────────────────────────────────────────────────────

export const RequestStore = {
  async create(prompt: string, userId?: string): Promise<Request> {
    const redis = getRedis();
    const now   = new Date().toISOString();
    const id    = randomUUID();

    const req: Request = {
      id,
      user_id:    userId ?? null,
      prompt,
      status:     'pending',
      github_url: null,
      created_at: now,
      updated_at: now,
    };

    await redis.hmset(`request:${id}`, {
      id,
      user_id:    userId ?? '',
      prompt,
      status:     'pending',
      github_url: '',
      created_at: now,
      updated_at: now,
    });
    await redis.expire(`request:${id}`, JOB_TTL);

    return req;
  },

  async findById(id: string): Promise<Request | null> {
    const redis = getRedis();
    const data  = await redis.hgetall(`request:${id}`);
    if (!data || !data.id) return null;
    return {
      ...data,
      user_id:    data.user_id    || null,
      github_url: data.github_url || null,
    } as Request;
  },

  async updateStatus(id: string, status: RequestStatus, githubUrl?: string): Promise<void> {
    const redis   = getRedis();
    const updated = new Date().toISOString();
    const fields: Record<string, string> = { status, updated_at: updated };
    if (githubUrl) fields.github_url = githubUrl;
    await redis.hmset(`request:${id}`, fields);
    await redis.expire(`request:${id}`, JOB_TTL);
  },
};

// ── Task Store ────────────────────────────────────────────────────────────────

export const TaskStore = {
  async bulkCreate(requestId: string, descriptions: string[]): Promise<Task[]> {
    if (descriptions.length === 0) return [];
    const redis = getRedis();
    const tasks: Task[] = [];

    for (const description of descriptions) {
      const id  = randomUUID();
      const now = new Date().toISOString();
      const task: Task = { id, request_id: requestId, description, status: 'pending', created_at: now };

      await redis.hmset(`task:${id}`, { id, request_id: requestId, description, status: 'pending', created_at: now });
      await redis.expire(`task:${id}`, JOB_TTL);
      await redis.rpush(`tasks:${requestId}`, id);
      tasks.push(task);
    }

    await redis.expire(`tasks:${requestId}`, JOB_TTL);
    return tasks;
  },

  async findByRequestId(requestId: string): Promise<Task[]> {
    const redis   = getRedis();
    const taskIds = await redis.lrange(`tasks:${requestId}`, 0, -1);
    if (taskIds.length === 0) return [];

    const tasks: Task[] = [];
    for (const id of taskIds) {
      const data = await redis.hgetall(`task:${id}`);
      if (data?.id) tasks.push(data as unknown as Task);
    }
    return tasks;
  },

  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    const redis = getRedis();
    await redis.hset(`task:${id}`, 'status', status);
  },
};

// ── Log Store ─────────────────────────────────────────────────────────────────

export const LogStore = {
  async append(requestId: string, message: string, level: LogLevel = 'info'): Promise<Log> {
    const redis = getRedis();
    const log: Log = {
      id:         randomUUID(),
      request_id: requestId,
      level,
      message,
      created_at: new Date().toISOString(),
    };

    await redis.rpush(`logs:${requestId}`, JSON.stringify(log));
    await redis.expire(`logs:${requestId}`, JOB_TTL);
    return log;
  },

  async findByRequestId(requestId: string): Promise<Log[]> {
    const redis   = getRedis();
    const entries = await redis.lrange(`logs:${requestId}`, 0, -1);
    return entries.map(e => JSON.parse(e) as Log);
  },
};
