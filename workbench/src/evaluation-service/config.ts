import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { ServiceRuntimeConfig } from "./contracts.ts";

const DEFAULT_PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function positiveInteger(environment: NodeJS.ProcessEnv, name: string, fallback: number): number {
	const raw = environment[name];
	if (raw === undefined || raw === "") return fallback;
	const value = Number(raw);
	if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${name} must be a positive safe integer`);
	return value;
}

function localPath(projectRoot: string, environment: NodeJS.ProcessEnv, name: string, fallback: string): string {
	const value = environment[name] || fallback;
	return resolve(projectRoot, value);
}

export function loadServiceRuntimeConfig(environment: NodeJS.ProcessEnv = process.env): ServiceRuntimeConfig {
	const projectRoot = resolve(environment.EVALUATION_SERVICE_PROJECT_ROOT || DEFAULT_PROJECT_ROOT);
	return {
		projectRoot,
		registryPath: localPath(projectRoot, environment, "EVALUATION_SERVICE_SPEC_REGISTRY", "workbench/config/evaluation-service/specs.json"),
		credentialRegistryPath: environment.EVALUATION_SERVICE_CREDENTIAL_REGISTRY ? resolve(projectRoot, environment.EVALUATION_SERVICE_CREDENTIAL_REGISTRY) : null,
		jobsRoot: localPath(projectRoot, environment, "EVALUATION_SERVICE_JOBS_ROOT", ".runs/evaluation-service"),
		redisUrl: environment.EVALUATION_SERVICE_REDIS_URL || "redis://127.0.0.1:6379/0",
		queueName: environment.EVALUATION_SERVICE_QUEUE || "skill-evaluation-jobs-v1",
		host: "127.0.0.1",
		port: positiveInteger(environment, "EVALUATION_SERVICE_PORT", 4317),
		workerConcurrency: positiveInteger(environment, "EVALUATION_SERVICE_WORKER_CONCURRENCY", 1),
		globalConcurrency: positiveInteger(environment, "EVALUATION_SERVICE_GLOBAL_CONCURRENCY", 2),
		lockDurationMs: positiveInteger(environment, "EVALUATION_SERVICE_LOCK_DURATION_MS", 120_000),
		stalledIntervalMs: positiveInteger(environment, "EVALUATION_SERVICE_STALLED_INTERVAL_MS", 30_000),
		killGraceMs: positiveInteger(environment, "EVALUATION_SERVICE_KILL_GRACE_MS", 10_000),
		reconciliationGraceMs: positiveInteger(environment, "EVALUATION_SERVICE_RECONCILIATION_GRACE_MS", 5_000),
	};
}

export function publicRuntimeConfig(config: ServiceRuntimeConfig): Record<string, unknown> {
	return {
		host: config.host,
		port: config.port,
		queue_name: config.queueName,
		worker_concurrency: config.workerConcurrency,
		global_concurrency: config.globalConcurrency,
		lock_duration_ms: config.lockDurationMs,
		stalled_interval_ms: config.stalledIntervalMs,
	};
}
