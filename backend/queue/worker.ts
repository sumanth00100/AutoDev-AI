import { Worker } from 'bullmq';
import { getBullMQConnection } from './redis';
import { QUEUE_NAME, GenerateJobData } from './producer';
import { UserStore } from '../services/redisStore';
import { decryptToken } from '../services/crypto';
import { runPipeline } from '../services/pipeline';

export function startWorker(): Worker<GenerateJobData> {
  const worker = new Worker<GenerateJobData>(
    QUEUE_NAME,
    async (job) => {
      const { requestId, prompt, targetRepo, userId, model } = job.data;
      console.log(`[Worker] Processing job ${job.id} for requestId ${requestId}`);

      const user = await UserStore.findById(userId);
      if (!user) throw new Error(`User ${userId} not found – cannot push to GitHub`);

      const githubToken = decryptToken(user.encrypted_token);
      await runPipeline(requestId, prompt, targetRepo, githubToken, model);
    },
    {
      connection:  getBullMQConnection(),
      concurrency: 3,
    }
  );

  worker.on('completed', (job) =>
    console.log(`[Worker] Job ${job.id} completed`)
  );

  worker.on('failed', (job, err) =>
    console.error(`[Worker] Job ${job?.id} failed:`, err)
  );

  return worker;
}
