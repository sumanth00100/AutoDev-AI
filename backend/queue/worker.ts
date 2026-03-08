import { Worker } from 'bullmq';
import { getBullMQConnection } from './redis';
import { QUEUE_NAME, GenerateJobData } from './producer';
import { runPipeline } from '../services/pipeline';

export function startWorker(): Worker<GenerateJobData> {
  const worker = new Worker<GenerateJobData>(
    QUEUE_NAME,
    async (job) => {
      console.log(`[Worker] Processing job ${job.id} for requestId ${job.data.requestId}`);
      await runPipeline(job.data.requestId, job.data.prompt, job.data.targetRepo);
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
