import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
const connection = new IORedis({ maxRetriesPerRequest: null });

export const userQueue = new Queue("shapesQueue", { connection });

export function createWorker(
  name: string,
  processor: (job: Job) => Promise<any>,
) {
  return new Worker(name, processor, { connection });
}