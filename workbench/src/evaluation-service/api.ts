import { createReadStream, existsSync, lstatSync } from "node:fs";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Queue } from "bullmq";
import type { Redis } from "ioredis";
import { fileSha256 } from "../hash.ts";
import { loadServiceRuntimeConfig, publicRuntimeConfig } from "./config.ts";
import { EVALUATION_JOB_KIND, type EvaluationQueueData, type EvaluationQueueResult, type ServiceRuntimeConfig } from "./contracts.ts";
import { EvaluationJobStore, SubmissionConflictError } from "./job-store.ts";
import { createEvaluationQueue, createProducerRedis } from "./redis.ts";
import { loadEvaluationSpecRegistry, validateFormalSpecFiles } from "./registry.ts";

const BODY_LIMIT = 16 * 1024;
const JOB_ID = /^[a-f0-9]{64}$/;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

function json(response: ServerResponse, status: number, value: unknown): void {
	const body = `${JSON.stringify(value)}\n`;
	response.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(body), "cache-control": "no-store" });
	response.end(body);
}

function publicError(response: ServerResponse, status: number, code: string, message: string): void {
	json(response, status, { error: code, message });
}

async function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
	let total = 0;
	const chunks: Buffer[] = [];
	for await (const chunk of request) {
		const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		total += value.length;
		if (total > BODY_LIMIT) throw new Error("request body exceeds 16 KiB");
		chunks.push(value);
	}
	const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("request body must be an object");
	return parsed as Record<string, unknown>;
}

function exactSubmission(value: Record<string, unknown>): { kind: typeof EVALUATION_JOB_KIND; evaluation_spec_id: string; idempotency_key: string } {
	const keys = Object.keys(value).sort();
	if (JSON.stringify(keys) !== JSON.stringify(["evaluation_spec_id", "idempotency_key", "kind"])) throw new Error("submission fields are invalid");
	if (value.kind !== EVALUATION_JOB_KIND || typeof value.evaluation_spec_id !== "string" || typeof value.idempotency_key !== "string" || !IDEMPOTENCY_KEY.test(value.idempotency_key)) throw new Error("submission fields are invalid");
	return { kind: EVALUATION_JOB_KIND, evaluation_spec_id: value.evaluation_spec_id, idempotency_key: value.idempotency_key };
}

function contentType(path: string): string {
	switch (extname(path).toLowerCase()) {
		case ".json": return "application/json; charset=utf-8";
		case ".md": return "text/markdown; charset=utf-8";
		case ".html": return "text/html; charset=utf-8";
		case ".pdf": return "application/pdf";
		default: return "text/plain; charset=utf-8";
	}
}

export interface EvaluationApiHandle {
	server: Server;
	close(): Promise<void>;
	address(): { host: string; port: number };
}

export async function startEvaluationApi(config: ServiceRuntimeConfig = loadServiceRuntimeConfig(), requestedPort = config.port): Promise<EvaluationApiHandle> {
	const store = new EvaluationJobStore(config.jobsRoot);
	const redis: Redis = createProducerRedis(config.redisUrl);
	redis.on("error", () => { /* health and submissions expose a bounded unavailable status */ });
	const queue: Queue<EvaluationQueueData, EvaluationQueueResult, "formal_skill_evaluation"> = createEvaluationQueue(config.queueName, redis);
	const ensureQueue = async (): Promise<void> => {
		if (redis.status === "wait" || redis.status === "end") await redis.connect();
		await redis.ping();
		await queue.setGlobalConcurrency(config.globalConcurrency);
	};

	const handler = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
		const url = new URL(request.url ?? "/", `http://${config.host}`);
		const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
		if (request.method === "GET" && url.pathname === "/health") {
			try { await ensureQueue(); json(response, 200, { status: "ready", redis: "ready", ...publicRuntimeConfig(config) }); }
			catch { json(response, 503, { status: "degraded", redis: "unavailable", ...publicRuntimeConfig(config) }); }
			return;
		}
		if (request.method === "GET" && url.pathname === "/v1/evaluation-specs") {
			try {
				const specs = [...loadEvaluationSpecRegistry(config.registryPath).values()].filter((spec) => spec.enabled).map((spec) => ({ id: spec.id, kind: spec.kind, executor: spec.executor.kind, job_timeout_ms: spec.job_timeout_ms }));
				json(response, 200, { specs });
			} catch { publicError(response, 500, "registry_unavailable", "Evaluation Spec registry is unavailable"); }
			return;
		}
		if (request.method === "POST" && url.pathname === "/v1/evaluation-jobs") {
			let submission;
			try { submission = exactSubmission(await readJsonBody(request)); }
			catch (error) { publicError(response, 400, "invalid_request", error instanceof Error ? error.message : "invalid request"); return; }
			try {
				const spec = loadEvaluationSpecRegistry(config.registryPath).get(submission.evaluation_spec_id);
				if (!spec || !spec.enabled) { publicError(response, 404, "spec_not_found", "registered Evaluation Spec was not found or is disabled"); return; }
				validateFormalSpecFiles(config.projectRoot, spec);
				const stored = store.createSubmission(submission, spec);
				await ensureQueue();
				const data: EvaluationQueueData = { schema_version: 1, job_id: stored.jobId, kind: EVALUATION_JOB_KIND, evaluation_spec_id: spec.id, payload_sha256: stored.request.payload_sha256, spec_snapshot_sha256: stored.specSnapshotSha256 };
				const prior = await queue.getJob(stored.jobId);
				const queued = prior ?? await queue.add(EVALUATION_JOB_KIND, data, { jobId: stored.jobId, attempts: 1, removeOnComplete: false, removeOnFail: false });
				if (queued.data.payload_sha256 !== data.payload_sha256 || queued.data.spec_snapshot_sha256 !== data.spec_snapshot_sha256) throw new Error("existing Redis Job conflicts with immutable Job artifacts");
				store.writeQueueReceipt(stored.jobId, { schema_version: 1, job_id: stored.jobId, queue_name: config.queueName, redis_job_id: queued.id, enqueued_at: new Date(queued.timestamp).toISOString() });
				json(response, stored.created ? 202 : 200, { job_id: stored.jobId, status: "queued", deduplicated: !stored.created, status_url: `/v1/evaluation-jobs/${stored.jobId}`, result_url: `/v1/evaluation-jobs/${stored.jobId}/result` });
			} catch (error) {
				if (error instanceof SubmissionConflictError) { publicError(response, 409, "idempotency_conflict", error.message); return; }
				publicError(response, 503, "submission_unavailable", "Job artifacts may have been accepted, but the queue submission is unavailable; safely retry with the same idempotency key");
			}
			return;
		}
		if (parts.length >= 3 && parts[0] === "v1" && parts[1] === "evaluation-jobs" && JOB_ID.test(parts[2]!)) {
			const jobId = parts[2]!;
			try { store.readRequest(jobId); }
			catch { publicError(response, 404, "job_not_found", "Evaluation Job was not found"); return; }
			const completed = store.readTerminal(jobId);
			if (request.method === "GET" && parts.length === 3) {
				let queueState = "unavailable";
				try { await ensureQueue(); queueState = await (await queue.getJob(jobId))?.getState() ?? "not_found"; } catch { /* preserve artifact-backed state */ }
				const status = completed ? "terminal" : queueState === "active" ? "running" : queueState === "waiting" || queueState === "delayed" || queueState === "paused" ? "queued" : queueState === "failed" ? "queue_failed" : queueState === "completed" ? "inconsistent_requires_review" : existsSync(resolve(store.jobRoot(jobId), "queue-receipt.json")) ? "pending_or_unavailable" : "submission_pending";
				json(response, 200, { job_id: jobId, status, queue_state: queueState, terminal_reason: completed?.reason ?? null, result_url: `/v1/evaluation-jobs/${jobId}/result` });
				return;
			}
			if (request.method === "GET" && parts.length === 4 && parts[3] === "result") {
				if (!completed) { json(response, 202, { job_id: jobId, status: "pending" }); return; }
				json(response, 200, { ...completed, artifacts: completed.artifacts.map((artifact) => ({ ...artifact, url: `/v1/evaluation-jobs/${jobId}/artifacts/${encodeURIComponent(artifact.name)}` })) });
				return;
			}
			if (request.method === "GET" && parts.length === 5 && parts[3] === "artifacts") {
				if (!completed) { publicError(response, 409, "result_not_terminal", "Artifacts are available after terminalization"); return; }
				const artifact = completed.artifacts.find((entry) => entry.name === parts[4]);
				if (!artifact) { publicError(response, 404, "artifact_not_found", "Artifact reference was not found"); return; }
				const path = store.resolvePublicArtifact(jobId, artifact.path);
				const stats = lstatSync(path);
				if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1 || stats.size !== artifact.bytes || fileSha256(path) !== artifact.sha256) { publicError(response, 409, "artifact_integrity_failed", "Artifact no longer matches its terminal reference"); return; }
				response.writeHead(200, { "content-type": contentType(path), "content-length": artifact.bytes, "cache-control": "no-store", "x-content-sha256": artifact.sha256 });
				createReadStream(path).pipe(response);
				return;
			}
		}
		publicError(response, 404, "not_found", "route was not found");
	};

	const server = createServer((request, response) => { void handler(request, response).catch(() => { if (!response.headersSent) publicError(response, 500, "internal_error", "request failed"); else response.destroy(); }); });
	await new Promise<void>((resolveListen, reject) => {
		server.once("error", reject);
		server.listen(requestedPort, config.host, () => { server.off("error", reject); resolveListen(); });
	});
	const address = server.address();
	if (!address || typeof address === "string") throw new Error("HTTP server did not expose a TCP address");
	return {
		server,
		address: () => ({ host: config.host, port: address.port }),
		close: async () => {
			await new Promise<void>((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
			await queue.close();
			if (redis.status !== "end") redis.disconnect(false);
		},
	};
}

async function main(): Promise<void> {
	const config = loadServiceRuntimeConfig();
	const api = await startEvaluationApi(config);
	process.stdout.write(`${JSON.stringify({ status: "ready", role: "api", pid: process.pid, ...api.address(), ...publicRuntimeConfig(config) })}\n`);
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === entry) main().catch((error) => { process.stderr.write(`Evaluation API failed: ${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; });
