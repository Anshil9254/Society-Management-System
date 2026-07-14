const { Queue, Worker, QueueEvents } = require('bullmq');
const Redis = require('ioredis');

class QueueService {
  constructor(redisClient) {
    this.connection = redisClient;
    this.queues = new Map();
    this.workers = new Map();
  }

  // Get or create a queue
  getQueue(queueName) {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, { connection: this.connection });
      this.queues.set(queueName, queue);
      
      // Setup Queue Events for logging
      const queueEvents = new QueueEvents(queueName, { connection: this.connection });
      queueEvents.on('failed', ({ jobId, failedReason }) => {
        console.error(`[BullMQ] Job ${jobId} failed in ${queueName}: ${failedReason}`);
      });
    }
    return this.queues.get(queueName);
  }

  // Add a job to a queue
  async addJob(queueName, jobName, data, options = {}) {
    const queue = this.getQueue(queueName);
    return queue.add(jobName, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      ...options,
    });
  }

  // Create a worker for a queue
  createWorker(queueName, processor, concurrency = 5) {
    if (this.workers.has(queueName)) {
      return this.workers.get(queueName);
    }
    const worker = new Worker(queueName, processor, {
      connection: this.connection,
      concurrency,
    });
    
    worker.on('completed', (job) => {
      console.log(`[BullMQ] Job ${job.id} completed in ${queueName}`);
    });
    
    worker.on('failed', (job, err) => {
      console.error(`[BullMQ] Job ${job.id} failed in ${queueName}:`, err);
    });

    this.workers.set(queueName, worker);
    return worker;
  }

  async shutdown() {
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    await this.connection.quit();
  }
}

module.exports = QueueService;
