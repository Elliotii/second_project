import { Queue, type ConnectionOptions } from "bullmq";
import { Redis } from "ioredis";
import type { EvaluationQueueData, EvaluationQueueResult } from "./contracts.ts";

export function createProducerRedis(redisUrl: string): Redis {
	return new Redis(redisUrl, { maxRetriesPerRequest: 1, enableReadyCheck: true, lazyConnect: true, connectTimeout: 2_000, retryStrategy: () => null });
}

export function createWorkerRedis(redisUrl: string): Redis {
	return new Redis(redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: true, lazyConnect: true });
}

export function createEvaluationQueue(name: string, connection: ConnectionOptions): Queue<EvaluationQueueData, EvaluationQueueResult, "formal_skill_evaluation"> {
	return new Queue<EvaluationQueueData, EvaluationQueueResult, "formal_skill_evaluation">(name, {
		connection,
		defaultJobOptions: { attempts: 1, removeOnComplete: false, removeOnFail: false },
	});
}
