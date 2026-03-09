import Redis from 'ioredis';

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
    client.on('error', (err) => console.error('[Redis] error', err));
  }
  return client;
}

/** Plain connection config for BullMQ (avoids ioredis version conflicts). */
export function getBullMQConnection() {
  const raw = process.env.REDIS_URL ?? 'redis://localhost:6379';
  const url  = new URL(raw);
  const tls  = raw.startsWith('rediss://');
  return {
    host:     url.hostname,
    port:     parseInt(url.port || '6379', 10),
    username: url.username || undefined,
    ...(url.password ? { password: url.password } : {}),
    ...(tls ? { tls: {} } : {}),
    maxRetriesPerRequest: null,
  };
}
