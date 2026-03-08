import Redis from 'ioredis';

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      lazyConnect: false,
    });
    client.on('error', (err) => console.error('[Redis] error', err));
  }
  return client;
}

/** Plain connection config for BullMQ (avoids ioredis version conflicts). */
export function getBullMQConnection(): { host: string; port: number; password?: string; maxRetriesPerRequest: null } {
  const url = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');
  return {
    host: url.hostname,
    port: parseInt(url.port || '6379', 10),
    ...(url.password ? { password: url.password } : {}),
    maxRetriesPerRequest: null,
  };
}
