import { randomUUID } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, openSync, closeSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { digestObject, fileSha256, sha256, stableJson } from "../hash.ts";
import { EVALUATION_JOB_KIND, type ArtifactReference, type EvaluationJobRequest, type EvaluationJobTerminal, type RegisteredEvaluationSpec } from "./contracts.ts";

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export class SubmissionConflictError extends Error {}

function ordinaryDirectory(path: string, label: string): void {
	const stats = lstatSync(path);
	if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error(`${label} must be an ordinary directory`);
}

function writeOnce(path: string, value: unknown): void {
	mkdirSync(dirname(path), { recursive: true });
	const handle = openSync(path, "wx");
	try { writeFileSync(handle, `${JSON.stringify(value, null, 2)}\n`, "utf8"); } finally { closeSync(handle); }
}

export function readJsonFile(path: string): unknown {
	return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function writeOnceOrVerify(path: string, value: unknown): void {
	try { writeOnce(path, value); }
	catch (error) {
		if (!existsSync(path)) throw error;
		if (stableJson(readJsonFile(path)) !== stableJson(value)) throw new SubmissionConflictError(`immutable artifact conflict at ${path}`);
	}
}

export function writeAtomicJson(path: string, value: unknown): void {
	mkdirSync(dirname(path), { recursive: true });
	const temporary = resolve(dirname(path), `.${randomUUID()}.tmp`);
	writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
	renameSync(temporary, path);
}

export interface SubmissionInput {
	kind: typeof EVALUATION_JOB_KIND;
	evaluation_spec_id: string;
	idempotency_key: string;
}

export interface StoredSubmission {
	jobId: string;
	jobRoot: string;
	request: EvaluationJobRequest;
	specSnapshotSha256: string;
	created: boolean;
}

export class EvaluationJobStore {
	readonly jobsRoot: string;
	readonly submissionsRoot: string;

	constructor(rootValue: string) {
		const root = resolve(rootValue);
		mkdirSync(root, { recursive: true });
		ordinaryDirectory(root, "Job store root");
		this.jobsRoot = resolve(root, "jobs");
		this.submissionsRoot = resolve(root, "submissions");
		mkdirSync(this.jobsRoot, { recursive: true });
		mkdirSync(this.submissionsRoot, { recursive: true });
		ordinaryDirectory(this.jobsRoot, "jobs root");
		ordinaryDirectory(this.submissionsRoot, "submissions root");
	}

	jobRoot(jobId: string): string {
		if (!/^[a-f0-9]{64}$/.test(jobId)) throw new Error("job_id is invalid");
		return resolve(this.jobsRoot, jobId);
	}

	createSubmission(input: SubmissionInput, spec: RegisteredEvaluationSpec): StoredSubmission {
		if (input.kind !== EVALUATION_JOB_KIND || !ID.test(input.evaluation_spec_id) || !ID.test(input.idempotency_key)) throw new Error("submission fields are invalid");
		const keyHash = sha256(input.idempotency_key);
		const payload = { schema_version: 1, kind: input.kind, evaluation_spec_id: input.evaluation_spec_id };
		const payloadSha256 = digestObject(payload);
		const jobId = sha256(`evaluation-job-v1\n${keyHash}`);
		const indexPath = resolve(this.submissionsRoot, `${keyHash}.json`);
		const index = { schema_version: 1, key_sha256: keyHash, job_id: jobId, payload_sha256: payloadSha256 };
		let created = true;
		try { writeOnce(indexPath, index); }
		catch (error) {
			if (!existsSync(indexPath)) throw error;
			const existing = readJsonFile(indexPath) as Record<string, unknown>;
			if (existing.job_id !== jobId || existing.payload_sha256 !== payloadSha256) throw new SubmissionConflictError("idempotency key was already used with a different request");
			created = false;
		}
		const jobRoot = this.jobRoot(jobId);
		mkdirSync(jobRoot, { recursive: true });
		ordinaryDirectory(jobRoot, "Job root");
		const request: EvaluationJobRequest = {
			schema_version: 1,
			job_id: jobId,
			kind: input.kind,
			evaluation_spec_id: input.evaluation_spec_id,
			idempotency_key_sha256: keyHash,
			payload_sha256: payloadSha256,
			accepted_at: new Date().toISOString(),
		};
		if (!created && existsSync(resolve(jobRoot, "request.json"))) {
			const previous = readJsonFile(resolve(jobRoot, "request.json")) as EvaluationJobRequest;
			request.accepted_at = previous.accepted_at;
		}
		writeOnceOrVerify(resolve(jobRoot, "request.json"), request);
		const snapshot = { ...spec };
		writeOnceOrVerify(resolve(jobRoot, "spec-snapshot.json"), snapshot);
		return { jobId, jobRoot, request, specSnapshotSha256: digestObject(snapshot), created };
	}

	writeQueueReceipt(jobId: string, value: Record<string, unknown>): void {
		writeOnceOrVerify(resolve(this.jobRoot(jobId), "queue-receipt.json"), value);
	}

	readRequest(jobId: string): EvaluationJobRequest {
		return readJsonFile(resolve(this.jobRoot(jobId), "request.json")) as EvaluationJobRequest;
	}

	readSpecSnapshot(jobId: string): RegisteredEvaluationSpec {
		return readJsonFile(resolve(this.jobRoot(jobId), "spec-snapshot.json")) as RegisteredEvaluationSpec;
	}

	specSnapshotSha256(jobId: string): string {
		return digestObject(this.readSpecSnapshot(jobId));
	}

	terminalPath(jobId: string): string { return resolve(this.jobRoot(jobId), "terminal.json"); }

	readTerminal(jobId: string): EvaluationJobTerminal | null {
		const path = this.terminalPath(jobId);
		return existsSync(path) ? readJsonFile(path) as EvaluationJobTerminal : null;
	}

	writeTerminal(terminal: EvaluationJobTerminal): EvaluationJobTerminal {
		const path = this.terminalPath(terminal.job_id);
		writeOnceOrVerify(path, terminal);
		return this.readTerminal(terminal.job_id)!;
	}

	artifact(jobId: string, name: string, pathValue: string): ArtifactReference {
		const jobRoot = this.jobRoot(jobId);
		const path = resolve(pathValue);
		const rel = relative(jobRoot, path);
		if (rel === ".." || rel.startsWith(`..${sep}`) || rel === "" || rel.includes("\0") || path === jobRoot) throw new Error("artifact path escapes the Job root");
		const stats = lstatSync(path);
		if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`artifact ${name} is not an ordinary file`);
		return { name, path: rel.split(sep).join("/"), sha256: fileSha256(path), bytes: stats.size };
	}

	resolvePublicArtifact(jobId: string, relativePath: string): string {
		if (relativePath.length === 0 || relativePath.includes("\0") || isAbsolutePortable(relativePath) || relativePath.replaceAll("\\", "/").split("/").includes("..")) throw new Error("artifact locator is invalid");
		const path = resolve(this.jobRoot(jobId), relativePath);
		const rel = relative(this.jobRoot(jobId), path);
		if (rel === ".." || rel.startsWith(`..${sep}`)) throw new Error("artifact locator escapes the Job root");
		return path;
	}
}

function isAbsolutePortable(value: string): boolean {
	return value.startsWith("/") || value.startsWith("\\") || /^[A-Za-z]:/.test(value);
}

