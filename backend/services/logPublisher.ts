import { getRedis } from '../queue/redis';

export interface LogEvent {
  message: string;
  level: string;
  ts: string;
}

export async function publishLog(requestId: string, event: LogEvent): Promise<void> {
  try {
    const redis = getRedis();
    await redis.publish(`logs:${requestId}`, JSON.stringify(event));
  } catch {
    // Non-critical – log publishing should never crash the pipeline
  }
}
