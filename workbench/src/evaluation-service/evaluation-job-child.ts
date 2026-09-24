import { spawn } from "node:child_process";
import { closeSync, existsSync, fstatSync, lstatSync, mkdirSync, openSync, readFileSync, realpathSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { createBoundedLogSink } from "./bounded-log.ts";
import type { EvaluationChildTerminal, EvaluationLaunchControl, ProcessTreeRecord } from "./contracts.ts";

function writeOnce(path: string, value: unknown): void {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
}

function writeMutable(path: string, value: unknown): void {
	const temporary = `${path}.${process.pid}.tmp`;
	writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
	try { renameSync(temporary, path); }
	catch {
		try { writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
		finally { try { if (existsSync(temporary)) unlinkSync(temporary); } catch { /* diagnostic only */ } }
	}
}

function loadControl(path: string, token: string): EvaluationLaunchControl {
	const value = JSON.parse(readFileSync(resolve(path), "utf8")) as EvaluationLaunchControl;
	if (value.schema_version !== 1 || value.launch_token !== token || !/^[a-f0-9]{64}$/.test(value.job_id)) throw new Error("launch control is invalid");
	if (resolve(value.launch_root) !== resolve(dirname(path))) throw new Error("launch root does not match the control file");
	return value;
}

function safeProjectPath(projectRootValue: string, value: string): string {
	if (!value || isAbsolute(value)) throw new Error("registered path must be project-relative");
	const projectRoot = resolve(projectRootValue);
	const path = resolve(projectRoot, value);
	const rel = relative(projectRoot, path);
	if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error("registered path escapes the project root");
	return path;
}

export function readCredentialSecret(pathValue: string): string {
	const path = resolve(pathValue);
	const expected = lstatSync(path);
	if (!expected.isFile() || expected.isSymbolicLink() || expected.nlink !== 1) throw new Error("Credential source must be one ordinary non-link file");
	const expectedReal = realpathSync.native(path);
	const handle = openSync(path, "r");
	let content: string;
	try {
		const opened = fstatSync(handle);
		if (!opened.isFile() || opened.nlink !== 1 || opened.dev !== expected.dev || opened.ino !== expected.ino) throw new Error("Credential source identity changed during resolution");
		content = readFileSync(handle, "utf8");
	} finally { closeSync(handle); }
	if (realpathSync.native(path) !== expectedReal) throw new Error("Credential source identity changed after resolution");
	const matches = content.split(/\r?\n/).flatMap((line) => {
		const match = line.match(/^\s*DEEPSEEK_API_KEY\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))\s*$/);
		return match ? [match[1] ?? match[2] ?? match[3] ?? ""] : [];
	});
	if (matches.length !== 1 || !matches[0]) throw new Error("opaque Credential source is invalid");
	return matches[0];
}

function delay(ms: number): Promise<void> { return new Promise((resolveDelay) => setTimeout(resolveDelay, ms)); }

function publicChildEnvironment(projectRoot: string): NodeJS.ProcessEnv {
	const environment = { ...process.env };
	delete environment.DEEPSEEK_API_KEY;
	delete environment.EVALUATION_SERVICE_CREDENTIAL_FILE;
	environment.PI_RUNTIME_ROOT = resolve(projectRoot, ".runs", "v0-a", "pi");
	return environment;
}

function parseResultTail(value: string): Record<string, unknown> | null {
	const lines = value.trim().split(/\r?\n/).reverse();
	for (const line of lines) {
		if (!line.startsWith("{")) continue;
		try {
			const parsed = JSON.parse(line) as unknown;
			if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
		} catch { /* keep looking for the canonical JSON line */ }
	}
	return null;
}

async function runFake(control: EvaluationLaunchControl, stdout: ReturnType<typeof createBoundedLogSink>, credentialSecret: string): Promise<Record<string, unknown>> {
	if (control.spec.executor.kind !== "fake") throw new Error("fake executor expected");
	const executor = control.spec.executor;
	let remaining = executor.stdout_bytes;
	const chunk = Buffer.from("fake-evaluator-output\n", "utf8");
	while (remaining > 0) {
		const next = chunk.subarray(0, Math.min(chunk.length, remaining));
		stdout.write(next);
		remaining -= next.length;
	}
	if (executor.behavior === "credential_echo") stdout.write(`redaction-probe=${credentialSecret}\n`);
	if (executor.behavior === "nested_timeout") {
		const nested = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)", control.launch_token], { stdio: "ignore", windowsHide: true, detached: process.platform !== "win32" });
		const record: ProcessTreeRecord = { schema_version: 1, launch_token: control.launch_token, processes: [
			{ pid: process.pid, role: "runner", identity_fragment: control.launch_token },
			{ pid: nested.pid!, role: "evaluator", identity_fragment: control.launch_token },
		] };
		writeMutable(resolve(control.launch_root, "process-tree.json"), record);
		await new Promise(() => undefined);
	}
	if (executor.behavior === "timeout") await new Promise(() => { setInterval(() => undefined, 1_000); });
	await delay(executor.delay_ms);
	if (executor.behavior === "execution_failure") throw new Error("registered fake execution failure");
	const output = resolve(control.launch_root, "evaluation-output");
	mkdirSync(output, { recursive: false });
	const taskOutcome = executor.behavior === "task_failure" ? "TASK_FAILURE" : "PASS";
	const manifest = resolve(output, "fake-run-manifest.json");
	const mapping = resolve(output, "fake-mapping.json");
	const analysis = resolve(output, "fake-analysis.json");
	const report = resolve(output, "fake-report.md");
	writeOnce(manifest, { schema_version: 1, job_id: control.job_id, execution_status: "completed", verification_status: taskOutcome === "PASS" ? "passed" : "failed", task_outcome: taskOutcome });
	writeOnce(mapping, { schema_version: 1, job_id: control.job_id, run_refs: ["fake-run-manifest.json"] });
	writeOnce(analysis, { schema_version: 1, job_id: control.job_id, phase: "human_review_ready", task_outcome: taskOutcome });
	writeFileSync(report, `# Fake Evaluation\n\nTask outcome: ${taskOutcome}\n`, { encoding: "utf8", flag: "wx" });
	return { status: "human_review_ready", evaluation_id: `fake-${control.spec.id}`, planned_runs: 1, completed_runs: 1, task_outcome: taskOutcome, mapping, analysis_state: analysis, report_markdown: report, fake_manifest: manifest };
}

async function runFormal(control: EvaluationLaunchControl, stdout: ReturnType<typeof createBoundedLogSink>, stderr: ReturnType<typeof createBoundedLogSink>, credentialFile: string | undefined): Promise<{ exitCode: number | null; result: Record<string, unknown> | null }> {
	if (control.spec.executor.kind === "fake") throw new Error("formal executor expected");
	const output = resolve(control.launch_root, "evaluation-output");
	const common = ["--project-root", control.project_root, "--plan", safeProjectPath(control.project_root, control.spec.executor.plan_path)];
	for (const binding of control.spec.executor.bindings) common.push("--bind", `${binding.plan_id}=${safeProjectPath(control.project_root, binding.config_path)}`);
	common.push("--output", output, "--json");
	const args = control.spec.executor.kind === "formal_cli"
		? [resolve(control.project_root, "workbench/scripts/workbench.mjs"), "evaluation", "run", ...common.slice(0, -3), "--credential-file", credentialFile!, "--analysis-request-timeout-ms", String(control.spec.executor.analysis_request_timeout_ms), ...common.slice(-3)]
		: ["--experimental-loader", pathToFileURL(resolve(control.project_root, "workbench/scripts/v35g2-public-pi-loader.mjs")).href, resolve(control.project_root, "workbench/scripts/run-faux-evaluation-service.ts"), ...common];
	const child = spawn(process.execPath, args, { cwd: control.project_root, env: publicChildEnvironment(control.project_root), windowsHide: true, detached: false, stdio: ["ignore", "pipe", "pipe"] });
	const tree: ProcessTreeRecord = { schema_version: 1, launch_token: control.launch_token, processes: [
		{ pid: process.pid, role: "runner", identity_fragment: control.launch_token },
		{ pid: child.pid!, role: "evaluator", identity_fragment: output },
	] };
	writeMutable(resolve(control.launch_root, "process-tree.json"), tree);
	let tail = "";
	child.stdout.on("data", (chunk: Buffer) => {
		stdout.write(chunk);
		tail = `${tail}${chunk.toString("utf8")}`.slice(-1_048_576);
	});
	child.stderr.on("data", (chunk: Buffer) => stderr.write(chunk));
	const exitCode = await new Promise<number | null>((resolveExit, reject) => {
		child.once("error", reject);
		child.once("exit", (code) => resolveExit(code));
	});
	return { exitCode, result: parseResultTail(tail) };
}

export async function runEvaluationJobChild(controlPath: string, token: string): Promise<void> {
	const control = loadControl(controlPath, token);
	const launchRoot = resolve(control.launch_root);
	const processTree: ProcessTreeRecord = { schema_version: 1, launch_token: token, processes: [{ pid: process.pid, role: "runner", identity_fragment: token }] };
	writeOnce(resolve(launchRoot, "dispatch.json"), { schema_version: 1, job_id: control.job_id, launch_token: token, dispatched_at: new Date().toISOString(), executor_kind: control.spec.executor.kind });
	writeMutable(resolve(launchRoot, "process-tree.json"), processTree);
	const credentialFile = process.env.EVALUATION_SERVICE_CREDENTIAL_FILE;
	delete process.env.EVALUATION_SERVICE_CREDENTIAL_FILE;
	let secret = "";
	if (control.spec.executor.credential_profile_id !== null) {
		if (!credentialFile) throw new Error("registered Credential profile was not supplied to the runner");
		secret = readCredentialSecret(credentialFile);
	}
	const stdout = createBoundedLogSink(resolve(launchRoot, "stdout.log"), control.spec.log_limit_bytes, secret ? [secret] : []);
	const stderr = createBoundedLogSink(resolve(launchRoot, "stderr.log"), control.spec.log_limit_bytes, secret ? [secret] : []);
	let childTerminal: EvaluationChildTerminal;
	try {
		let result: Record<string, unknown>;
		let exitCode = 0;
		if (control.spec.executor.kind === "fake") result = await runFake(control, stdout, secret);
		else {
			const formal = await runFormal(control, stdout, stderr, credentialFile);
			exitCode = formal.exitCode ?? 1;
			result = formal.result ?? { status: "error", message: "formal evaluator did not emit a JSON result" };
			if (exitCode !== 0) throw new Error(typeof result.message === "string" ? result.message : `formal evaluator exited ${exitCode}`);
		}
		childTerminal = { schema_version: 1, job_id: control.job_id, launch_token: token, reason: "completed", finished_at: new Date().toISOString(), exit_code: exitCode, evaluation_result: result, message: "evaluator process completed" };
	} catch (error) {
		childTerminal = { schema_version: 1, job_id: control.job_id, launch_token: token, reason: "execution_failed", finished_at: new Date().toISOString(), exit_code: 1, evaluation_result: null, message: error instanceof Error ? error.message : String(error) };
	}
	const stdoutMeta = stdout.close();
	const stderrMeta = stderr.close();
	writeOnce(resolve(launchRoot, "log-metadata.json"), { schema_version: 1, stdout: stdoutMeta, stderr: stderrMeta });
	writeOnce(resolve(launchRoot, "child-terminal.json"), childTerminal);
}

async function main(): Promise<void> {
	const [controlPath, token] = process.argv.slice(2);
	if (!controlPath || !token) throw new Error("usage: evaluation-job-child <control-path> <launch-token>");
	await runEvaluationJobChild(controlPath, token);
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === entry) {
	try { await main(); }
	catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }
}
