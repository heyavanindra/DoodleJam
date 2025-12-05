import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});
export const userQueue = new Queue("shapesQueue", { connection });

export function createWorker(
  name: string,
  processor: (job: Job) => Promise<any>
) {
  return new Worker(name, processor, { connection });
}
