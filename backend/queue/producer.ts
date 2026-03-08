import { Queue } from 'bullmq';
import { getBullMQConnection } from './redis';

export const QUEUE_NAME = 'autodev-generate';

let queue: Queue | null = null;

function getQueue(): Queue {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, { connection: getBullMQConnection() });
  }
  return queue;
}

export interface GenerateJobData {
  requestId:   string;
  prompt:      string;
  targetRepo?: { owner: string; repo: string };
}

export async function enqueueGenerate(
  requestId:   string,
  prompt:      string,
  targetRepo?: { owner: string; repo: string }
): Promise<void> {
  await getQueue().add(
    'generate',
    { requestId, prompt, targetRepo } satisfies GenerateJobData,
    {
      attempts:         1,
      removeOnComplete: 100,
      removeOnFail:     50,
    }
  );
}
