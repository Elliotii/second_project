import { randomBytes } from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Worker, type Job } from "bullmq";
import { digestObject } from "../hash.ts";
import { loadServiceRuntimeConfig, publicRuntimeConfig } from "./config.ts";
import type { ArtifactReference, EvaluationChildTerminal, EvaluationJobTerminal, EvaluationLaunchControl, EvaluationQueueData, EvaluationQueueResult, RegisteredEvaluationSpec, ServiceRuntimeConfig } from "./contracts.ts";
import { readCredentialSecret } from "./evaluation-job-child.ts";
import { EvaluationJobStore, readJsonFile } from "./job-store.ts";
import { terminateRecordedProcessTree } from "./process-supervisor.ts";
import { createEvaluationQueue, createWorkerRedis } from "./redis.ts";
import { loadCredentialProfiles, validateFormalSpecFiles } from "./registry.ts";
import { validateEvaluationResult } from "./result-validation.ts";

interface RunnerProcessRecord {
	schema_version: 1;
	job_id: string;
	launch_token: string;
	pid: number;
	started_at: string;
}

function writeOnce(path: string, value: unknown): void {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
}

function isDirectory(path: string): boolean {
	return existsSync(path) && lstatSync(path).isDirectory() && !lstatSync(path).isSymbolicLink();
}

function baseArtifacts(store: EvaluationJobStore, jobId: string): ArtifactReference[] {
	const root = store.jobRoot(jobId);
	return [
		store.artifact(jobId, "request", resolve(root, "request.json")),
		store.artifact(jobId, "spec_snapshot", resolve(root, "spec-snapshot.json")),
		...(existsSync(resolve(root, "queue-receipt.json")) ? [store.artifact(jobId, "queue_receipt", resolve(root, "queue-receipt.json"))] : []),
	];
}

export function diagnosticArtifacts(store: EvaluationJobStore, jobId: string, launchRoot: string): ArtifactReference[] {
	const names: Array<[string, string]> = [
		["stdout", "stdout.log"],
		["stderr", "stderr.log"],
		["log_metadata", "log-metadata.json"],
		["analysis_provider_requests", "evaluation-output/review/analysis-provider-requests.json"],
		["controlled_unblind_invocation", "evaluation-output/review/controlled-unblind-invocation.json"],
	];
	return names.flatMap(([name, file]) => existsSync(resolve(launchRoot, file)) ? [store.artifact(jobId, name, resolve(launchRoot, file))] : []);
}

function terminal(store: EvaluationJobStore, input: Omit<EvaluationJobTerminal, "schema_version" | "attempt">): EvaluationJobTerminal {
	return store.writeTerminal({ schema_version: 1, attempt: 1, ...input });
}

function validateQueueEnvelope(store: EvaluationJobStore, data: EvaluationQueueData): RegisteredEvaluationSpec {
	if (data.schema_version !== 1 || data.kind !== "formal_skill_evaluation" || !/^[a-f0-9]{64}$/.test(data.job_id)) throw new Error("queue Job envelope is invalid");
	const request = store.readRequest(data.job_id);
	if (request.job_id !== data.job_id || request.kind !== data.kind || request.evaluation_spec_id !== data.evaluation_spec_id || request.payload_sha256 !== data.payload_sha256) throw new Error("queue Job does not match its immutable request");
	const spec = store.readSpecSnapshot(data.job_id);
	if (spec.id !== data.evaluation_spec_id || digestObject(spec) !== data.spec_snapshot_sha256) throw new Error("queue Job does not match its Evaluation Spec snapshot");
	return spec;
}

function launchDirectories(attemptRoot: string): string[] {
	if (!isDirectory(attemptRoot)) return [];
	return readdirSync(attemptRoot, { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && /^launch-\d{4}$/.test(entry.name))
		.map((entry) => resolve(attemptRoot, entry.name)).sort();
}

function readRunner(path: string): RunnerProcessRecord | null {
	if (!existsSync(path)) return null;
	const value = readJsonFile(path) as RunnerProcessRecord;
	return value.schema_version === 1 && Number.isSafeInteger(value.pid) && value.pid > 0 ? value : null;
}

async function reconcileLaunch(config: ServiceRuntimeConfig, launchRoot: string): Promise<{ cleanup_confirmed: boolean; message: string }> {
	const runner = readRunner(resolve(launchRoot, "runner-process.json"));
	if (!runner) return { cleanup_confirmed: false, message: "runner process identity is missing" };
	return terminateRecordedProcessTree({ runnerPid: runner.pid, launchToken: runner.launch_token, processTreePath: resolve(launchRoot, "process-tree.json"), graceMs: config.reconciliationGraceMs });
}

function readChildTerminal(path: string): EvaluationChildTerminal {
	const child = readJsonFile(path) as EvaluationChildTerminal;
	if (child.schema_version !== 1 || !/^[a-f0-9]{64}$/.test(child.job_id) || typeof child.launch_token !== "string") throw new Error("child terminal is invalid");
	return child;
}

function finalizeChild(store: EvaluationJobStore, jobId: string, spec: RegisteredEvaluationSpec, launchRoot: string, child: EvaluationChildTerminal, startedAt: string): EvaluationJobTerminal {
	const commonArtifacts = [...baseArtifacts(store, jobId), ...diagnosticArtifacts(store, jobId, launchRoot)];
	if (child.job_id !== jobId) throw new Error("child terminal Job identity mismatch");
	if (child.reason === "execution_failed") return terminal(store, { job_id: jobId, reason: "execution_failed", started_at: startedAt, finished_at: child.finished_at, message: child.message, cleanup_confirmed: true, evaluation_result: null, artifacts: commonArtifacts });
	try {
		const validated = validateEvaluationResult({ store, jobId, launchRoot, spec, child });
		return terminal(store, { job_id: jobId, reason: "completed", started_at: startedAt, finished_at: child.finished_at, message: "Evaluation artifacts were validated", cleanup_confirmed: true, evaluation_result: validated.publicResult, artifacts: [...commonArtifacts, ...validated.artifacts] });
	} catch (error) {
		return terminal(store, { job_id: jobId, reason: "artifact_invalid", started_at: startedAt, finished_at: new Date().toISOString(), message: error instanceof Error ? error.message : String(error), cleanup_confirmed: true, evaluation_result: null, artifacts: commonArtifacts });
	}
}

function childExit(child: ChildProcess): Promise<{ code: number | null; signal: NodeJS.Signals | null }> {
	return new Promise((resolveExit, reject) => {
		child.once("error", reject);
		child.once("exit", (code, signal) => resolveExit({ code, signal }));
	});
}

async function executeNewLaunch(options: { config: ServiceRuntimeConfig; store: EvaluationJobStore; data: EvaluationQueueData; spec: RegisteredEvaluationSpec; attemptRoot: string; credentialFile: string | null }): Promise<EvaluationJobTerminal> {
	const ordinal = launchDirectories(options.attemptRoot).length + 1;
	const launchRoot = resolve(options.attemptRoot, `launch-${String(ordinal).padStart(4, "0")}`);
	mkdirSync(launchRoot, { recursive: false });
	const token = randomBytes(32).toString("hex");
	const startedAt = new Date().toISOString();
	const control: EvaluationLaunchControl = { schema_version: 1, job_id: options.data.job_id, launch_token: token, project_root: options.config.projectRoot, launch_root: launchRoot, spec: options.spec };
	const controlPath = resolve(launchRoot, "control.json");
	writeOnce(controlPath, control);
	writeOnce(resolve(launchRoot, "launch-reservation.json"), { schema_version: 1, job_id: options.data.job_id, attempt: 1, ordinal, launch_token: token, reserved_at: startedAt });
	const runnerScript = resolve(dirname(fileURLToPath(import.meta.url)), "evaluation-job-child.ts");
	const environment = { ...process.env };
	delete environment.DEEPSEEK_API_KEY;
	if (options.credentialFile) environment.EVALUATION_SERVICE_CREDENTIAL_FILE = options.credentialFile;
	const child = spawn(process.execPath, ["--experimental-strip-types", runnerScript, controlPath, token], {
		cwd: options.config.projectRoot,
		env: environment,
		windowsHide: true,
		detached: process.platform !== "win32",
		stdio: "ignore",
	});
	if (!child.pid) throw new Error("Evaluation runner did not return a process ID");
	writeOnce(resolve(launchRoot, "runner-process.json"), { schema_version: 1, job_id: options.data.job_id, launch_token: token, pid: child.pid, started_at: startedAt } satisfies RunnerProcessRecord);
	const exit = childExit(child);
	let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
	const race = await Promise.race([
		exit.then((value) => ({ kind: "exit" as const, value })),
		new Promise<{ kind: "timeout" }>((resolveTimeout) => { timeoutHandle = setTimeout(() => resolveTimeout({ kind: "timeout" }), options.spec.job_timeout_ms); }),
	]);
	if (race.kind === "exit" && timeoutHandle) clearTimeout(timeoutHandle);
	if (race.kind === "timeout") {
		const cleanup = await terminateRecordedProcessTree({ runnerPid: child.pid, launchToken: token, processTreePath: resolve(launchRoot, "process-tree.json"), graceMs: options.config.killGraceMs });
		return terminal(options.store, {
			job_id: options.data.job_id,
			reason: cleanup.cleanup_confirmed ? "timed_out_cleanup_complete" : "uncertain_requires_review",
			started_at: startedAt,
			finished_at: new Date().toISOString(),
			message: cleanup.cleanup_confirmed ? "Evaluation exceeded its registered timeout; recorded process tree was terminated" : `Evaluation timed out and cleanup is unconfirmed: ${cleanup.message}`,
			cleanup_confirmed: cleanup.cleanup_confirmed,
			evaluation_result: null,
			artifacts: [...baseArtifacts(options.store, options.data.job_id), ...diagnosticArtifacts(options.store, options.data.job_id, launchRoot)],
		});
	}
	const childTerminalPath = resolve(launchRoot, "child-terminal.json");
	if (existsSync(childTerminalPath)) return finalizeChild(options.store, options.data.job_id, options.spec, launchRoot, readChildTerminal(childTerminalPath), startedAt);
	const dispatched = existsSync(resolve(launchRoot, "dispatch.json"));
	return terminal(options.store, {
		job_id: options.data.job_id,
		reason: dispatched ? "uncertain_requires_review" : "execution_failed",
		started_at: startedAt,
		finished_at: new Date().toISOString(),
		message: dispatched ? "runner exited after dispatch without a terminal artifact" : "runner exited before dispatch without a terminal artifact",
		cleanup_confirmed: true,
		evaluation_result: null,
		artifacts: [...baseArtifacts(options.store, options.data.job_id), ...diagnosticArtifacts(options.store, options.data.job_id, launchRoot)],
	});
}

async function processJob(config: ServiceRuntimeConfig, store: EvaluationJobStore, job: Job<EvaluationQueueData, EvaluationQueueResult, "formal_skill_evaluation">): Promise<EvaluationQueueResult> {
	const existingTerminal = store.readTerminal(job.data.job_id);
	if (existingTerminal) return { job_id: job.data.job_id, reason: existingTerminal.reason };
	let spec: RegisteredEvaluationSpec;
	let credentialFile: string | null = null;
	try {
		spec = validateQueueEnvelope(store, job.data);
		if (!spec.enabled) throw new Error("Evaluation Spec is disabled");
		validateFormalSpecFiles(config.projectRoot, spec);
		if (spec.executor.credential_profile_id !== null) {
			const credentials = loadCredentialProfiles(config.credentialRegistryPath);
			credentialFile = credentials.get(spec.executor.credential_profile_id) ?? null;
			if (!credentialFile) throw new Error(`Credential profile ${spec.executor.credential_profile_id} is unavailable to this Worker`);
			readCredentialSecret(credentialFile);
		}
	} catch (error) {
		const completed = terminal(store, { job_id: job.data.job_id, reason: "preflight_failed", started_at: null, finished_at: new Date().toISOString(), message: error instanceof Error ? error.message : String(error), cleanup_confirmed: null, evaluation_result: null, artifacts: baseArtifacts(store, job.data.job_id) });
		return { job_id: job.data.job_id, reason: completed.reason };
	}
	const attemptRoot = resolve(store.jobRoot(job.data.job_id), "attempt-1");
	mkdirSync(attemptRoot, { recursive: true });
	for (const launchRoot of launchDirectories(attemptRoot)) {
		const childPath = resolve(launchRoot, "child-terminal.json");
		const runner = readRunner(resolve(launchRoot, "runner-process.json"));
		const startedAt = runner?.started_at ?? null;
		if (existsSync(childPath) && startedAt) {
			const completed = finalizeChild(store, job.data.job_id, spec, launchRoot, readChildTerminal(childPath), startedAt);
			return { job_id: job.data.job_id, reason: completed.reason };
		}
		const dispatched = existsSync(resolve(launchRoot, "dispatch.json"));
		const cleanup = await reconcileLaunch(config, launchRoot);
		if (dispatched || !cleanup.cleanup_confirmed) {
			const completed = terminal(store, {
				job_id: job.data.job_id,
				reason: "uncertain_requires_review",
				started_at: startedAt,
				finished_at: new Date().toISOString(),
				message: dispatched ? `a previous delivery crossed the dispatch boundary; ${cleanup.message}` : `a pre-dispatch runner could not be safely reconciled; ${cleanup.message}`,
				cleanup_confirmed: cleanup.cleanup_confirmed,
				evaluation_result: null,
				artifacts: [...baseArtifacts(store, job.data.job_id), ...diagnosticArtifacts(store, job.data.job_id, launchRoot)],
			});
			return { job_id: job.data.job_id, reason: completed.reason };
		}
	}
	const completed = await executeNewLaunch({ config, store, data: job.data, spec, attemptRoot, credentialFile });
	return { job_id: job.data.job_id, reason: completed.reason };
}

export async function startEvaluationWorker(config: ServiceRuntimeConfig = loadServiceRuntimeConfig()): Promise<Worker<EvaluationQueueData, EvaluationQueueResult, "formal_skill_evaluation">> {
	const store = new EvaluationJobStore(config.jobsRoot);
	const queueConnection = createWorkerRedis(config.redisUrl);
	queueConnection.on("error", (error) => process.stderr.write(`Evaluation Worker Redis error: ${error.message}\n`));
	await queueConnection.connect();
	const queue = createEvaluationQueue(config.queueName, queueConnection);
	await queue.setGlobalConcurrency(config.globalConcurrency);
	await queue.close();
	queueConnection.disconnect(false);
	const workerConnection = createWorkerRedis(config.redisUrl);
	workerConnection.on("error", (error) => process.stderr.write(`Evaluation Worker Redis error: ${error.message}\n`));
	const worker = new Worker<EvaluationQueueData, EvaluationQueueResult, "formal_skill_evaluation">(
		config.queueName,
		(job) => processJob(config, store, job),
		{
			connection: workerConnection,
			concurrency: config.workerConcurrency,
			lockDuration: config.lockDurationMs,
			stalledInterval: config.stalledIntervalMs,
			maxStalledCount: 1,
		},
	);
	worker.on("error", (error) => process.stderr.write(`Evaluation Worker error: ${error.message}\n`));
	worker.once("closed", () => workerConnection.disconnect(false));
	return worker;
}

async function main(): Promise<void> {
	const config = loadServiceRuntimeConfig();
	const worker = await startEvaluationWorker(config);
	process.stdout.write(`${JSON.stringify({ status: "ready", role: "worker", pid: process.pid, ...publicRuntimeConfig(config) })}\n`);
	let closing = false;
	const close = async (): Promise<void> => {
		if (closing) return;
		closing = true;
		await worker.close();
	};
	process.once("SIGINT", () => { void close().then(() => { process.exitCode = 0; }); });
	process.once("SIGTERM", () => { void close().then(() => { process.exitCode = 0; }); });
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === entry) {
	main().catch((error) => { process.stderr.write(`Evaluation Worker failed: ${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; });
}
