import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { AgentHarness, JsonlSessionRepo, type AgentHarnessEvent, type AgentMessage } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import type { AssistantMessage } from "@earendil-works/pi-ai";
import type { TaskSpecV0B } from "../contracts/v0b-types.ts";
import { artifactRef, writeOnceBytes } from "../evidence/artifacts.ts";
import { fileSha256 } from "../hash.ts";
import { createBoundedToolProfile } from "../pi/tool-profile.ts";
import { isPathInScope } from "../workspace/path-policy.ts";
import { runExternalVerifierV0B } from "../verifier/runner.ts";
import { portableArtifactPath, renderReport, writeJson, writeText } from "./artifacts.ts";
import type { CodingTaskModelRuntime, CodingTaskRunManifest, CodingTaskSpec, CodingTaskUsage, ExecutionStatus, FailureReason, VerificationStatus } from "./contracts.ts";
import { PINNED_PI_COMMIT } from "./contracts.ts";
import { assertSourceUnchanged, createIsolatedWorkspace, createWorkspaceDiff, snapshotWorkspace } from "./workspace.ts";

const SYSTEM_PROMPT = `You are working inside one isolated Workspace. Use only the provided tools. Read the task and relevant files, modify only writable paths, do not modify protected paths, run the declared check, and state what you changed and whether that check passed. Your statement is not the External Verifier result.`;
const MESSAGE_LIMIT = 16 * 1024;
const TOOL_TEXT_LIMIT = 8 * 1024;

interface TraceEvent {
	sequence: number;
	type: string;
	[key: string]: unknown;
}

function boundedText(value: string, maximum: number): { text: string; truncated: boolean } {
	const bytes = Buffer.from(value, "utf8");
	if (bytes.length <= maximum) return { text: value, truncated: false };
	return { text: bytes.subarray(0, maximum).toString("utf8"), truncated: true };
}

function assistantText(message: AssistantMessage): string {
	return message.content.flatMap((part) => part.type === "text" ? [part.text] : []).join("\n");
}

function projectMessage(message: AgentMessage): Record<string, unknown> {
	if (message.role === "user") {
		const raw = typeof message.content === "string" ? message.content : message.content.flatMap((part) => part.type === "text" ? [part.text] : []).join("\n");
		return { role: "user", ...boundedText(raw, MESSAGE_LIMIT) };
	}
	if (message.role === "assistant") {
		const raw = message.content.flatMap((part) => part.type === "text" ? [part.text] : []).join("\n");
		return { role: "assistant", ...boundedText(raw, MESSAGE_LIMIT), stop_reason: message.stopReason };
	}
	if (message.role === "toolResult") {
		const raw = message.content.flatMap((part) => part.type === "text" ? [part.text] : []).join("\n");
		return { role: "toolResult", tool_name: message.toolName, is_error: message.isError, ...boundedText(raw, TOOL_TEXT_LIMIT) };
	}
	return { role: message.role, text: "", truncated: false };
}

function projectInput(value: Record<string, unknown>): { text: string; truncated: boolean } {
	return boundedText(JSON.stringify(value), TOOL_TEXT_LIMIT);
}

function projectUnknown(value: unknown): { text: string; truncated: boolean } {
	let serialized: string;
	try { serialized = JSON.stringify(value); } catch { serialized = "[unserializable tool result]"; }
	return boundedText(serialized ?? "null", TOOL_TEXT_LIMIT);
}

function commandCategory(commandId: string): "test" | "command" {
	return /test|check|typecheck|lint|build/i.test(commandId) ? "test" : "command";
}

function classifyTool(toolName: string, input: Record<string, unknown>): string {
	if (toolName === "workspace_read" || toolName === "workspace_list" || toolName === "workspace_search") return "file_read";
	if (toolName === "workspace_write" || toolName === "workspace_edit") return "file_write";
	if (toolName === "run_command") return commandCategory(typeof input.command_id === "string" ? input.command_id : "");
	return "tool_call";
}

function validateTask(task: CodingTaskSpec): void {
	if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(task.task_id)) throw new Error("task_id is invalid");
	if (!task.prompt || Buffer.byteLength(task.prompt, "utf8") > 64 * 1024) throw new Error("task prompt is invalid");
	if ((task.source_revision === undefined) === (task.existing_tree_digest === undefined)) throw new Error("exactly one Source identity is required");
	if (!Number.isSafeInteger(task.timeout_ms) || task.timeout_ms < 1 || task.timeout_ms > 900_000) throw new Error("task timeout is invalid");
	if (task.verifier_spec.sha256 !== fileSha256(resolve(task.verifier_spec.source_path))) throw new Error("Verifier source digest mismatch");
	if (task.writable_paths.length === 0 || task.command_descriptors.length === 0) throw new Error("task path or command policy is empty");
	if (task.source_revision) {
		let actual: string;
		try { actual = execFileSync("git", ["-C", resolve(task.source_root), "rev-parse", "HEAD"], { encoding: "utf8", windowsHide: true }).trim(); }
		catch (error) { throw new Error("Source revision could not be verified", { cause: error }); }
		if (actual !== task.source_revision) throw new Error(`Source revision mismatch: expected ${task.source_revision}, received ${actual}`);
	}
}

export async function runCodingTask(options: {
	task: CodingTaskSpec;
	runtime: CodingTaskModelRuntime;
	runId?: string;
	abortSignal?: AbortSignal;
	now?: () => number;
}): Promise<{ manifest: CodingTaskRunManifest; run_root: string }> {
	validateTask(options.task);
	const task = options.task;
	const runId = options.runId ?? `coding-task-${new Date().toISOString().replace(/[-:.TZ]/g, "")}-${randomUUID().slice(0, 8)}`;
	mkdirSync(resolve(task.output_root), { recursive: true });
	const runRoot = resolve(task.output_root, runId);
	const workspaceRoot = resolve(runRoot, "workspace");
	const sessionRoot = resolve(runRoot, "session");
	mkdirSync(runRoot, { recursive: false });
	const startedMs = (options.now ?? Date.now)();
	const startedAt = new Date().toISOString();
	let executionStatus: ExecutionStatus = "infrastructure_failed";
	let verificationStatus: VerificationStatus = "not_run";
	let failureReason: FailureReason = "unknown";
	let finalClaim: string | null = null;
	let executionError: string | null = null;
	let runtimeCloseError: string | null = null;
	let requestCount = 0;
	let providerResponseCount = 0;
	let inputTokens = 0;
	let outputTokens = 0;
	let costUsd = 0;
	let usageObserved = false;
	let settled = false;
	let sequence = 0;
	const events: TraceEvent[] = [];
	const toolInputs = new Map<string, Record<string, unknown>>();
	const isolated = createIsolatedWorkspace(task.source_root, workspaceRoot);
	if (task.existing_tree_digest && isolated.before.tree_digest !== task.existing_tree_digest) throw new Error("Source existing_tree_digest mismatch");
	const profile = createBoundedToolProfile(workspaceRoot, task, { allow_repository_commands: false, expose_task_command_ids: true });
	const repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: runRoot, shellEnv: {} }), sessionsRoot: sessionRoot });
	const session = await repo.create({ cwd: "workspace", id: `${runId}-session`, metadata: { task_id: task.task_id, run_id: runId } });
	const sessionMetadata = await session.getMetadata();
	const harness = new AgentHarness({
		models: options.runtime.models,
		session,
		model: options.runtime.model,
		tools: profile.tools,
		toolContext: profile.context,
		systemPrompt: SYSTEM_PROMPT,
		thinkingLevel: "off",
		streamOptions: { maxRetries: 0, timeoutMs: task.timeout_ms },
	});
	const unsubscribe = harness.subscribe((event: AgentHarnessEvent) => {
		if (event.type === "before_provider_request") requestCount++;
		if (event.type === "settled") settled = true;
		if (event.type === "message_end" && event.message.role === "assistant") {
			providerResponseCount++;
			usageObserved = true;
			inputTokens += event.message.usage.input;
			outputTokens += event.message.usage.output;
			costUsd += event.message.usage.cost.total;
		}
		if (event.type === "tool_execution_start") {
			const args = event.args && typeof event.args === "object" && !Array.isArray(event.args) ? event.args as Record<string, unknown> : {};
			toolInputs.set(event.toolCallId, args);
			events.push({ sequence: ++sequence, type: classifyTool(event.toolName, args), phase: "start", tool_call_id: event.toolCallId, tool_name: event.toolName, ...(typeof args.path === "string" ? { path: args.path } : {}), ...(typeof args.command_id === "string" ? { command_id: args.command_id } : {}), input: projectInput(args) });
		}
		if (event.type === "tool_execution_end") {
			const args = toolInputs.get(event.toolCallId);
			const commandId = args && typeof args.command_id === "string" ? args.command_id : undefined;
			const command = commandId ? profile.commandExecutions.findLast((entry) => entry.command_id === commandId) : undefined;
			events.push({ sequence: ++sequence, type: event.isError ? "tool_error" : "tool_result", phase: "end", tool_call_id: event.toolCallId, tool_name: event.toolName, status: event.isError ? "error" : "ok", ...(command ? { command_id: command.command_id, exit_code: command.exit_code, timed_out: command.timed_out, truncated: command.truncated } : {}), output: projectUnknown(event.result) });
		}
	});
	let timer: ReturnType<typeof setTimeout> | undefined;
	let abortedBySignal = false;
	let timedOut = false;
	const abortListener = (): void => { abortedBySignal = true; void harness.abort(); };
	options.abortSignal?.addEventListener("abort", abortListener, { once: true });
	try {
		const timeout = new Promise<never>((_fulfill, reject) => {
			timer = setTimeout(() => { timedOut = true; void harness.abort(); reject(new Error("coding task timeout")); }, task.timeout_ms);
		});
		const response = await Promise.race([harness.prompt(task.prompt), timeout]);
		await harness.waitForIdle();
		if (!settled) throw new Error("AgentHarness did not emit settled");
		finalClaim = assistantText(response);
		executionStatus = "completed";
		failureReason = null;
	} catch (error) {
		executionStatus = timedOut ? "timeout" : abortedBySignal ? "aborted" : "infrastructure_failed";
		failureReason = timedOut || abortedBySignal ? "unknown" : "provider";
		executionError = error instanceof Error ? error.message : String(error);
		try { await harness.abort(); } catch { /* Preserve the primary execution error. */ }
	} finally {
		if (timer) clearTimeout(timer);
		options.abortSignal?.removeEventListener("abort", abortListener);
		unsubscribe();
		try { await options.runtime.close(); } catch (error) { runtimeCloseError = error instanceof Error ? error.message : String(error); }
	}
	const after = snapshotWorkspace(workspaceRoot);
	const diff = createWorkspaceDiff(isolated.before, after);
	const outsideWritable = [...diff.changes.added, ...diff.changes.modified, ...diff.changes.deleted].filter((path) => !isPathInScope(path, task.writable_paths) || isPathInScope(path, task.protected_paths));
	if (outsideWritable.length > 0) {
		executionStatus = "infrastructure_failed";
		failureReason = "workspace";
		executionError = `Workspace policy violation: ${outsideWritable.join(", ")}`;
	}
	assertSourceUnchanged(task.source_root, isolated.source_before);
	const diffPath = resolve(runRoot, "diff.patch");
	writeText(diffPath, diff.patch);
	const diffMetadataPath = resolve(runRoot, "diff.json");
	writeJson(diffMetadataPath, { schema_version: 1, before_tree_digest: isolated.before.tree_digest, after_tree_digest: after.tree_digest, changes: diff.changes, files: diff.files, patch_path: "diff.patch" });
	let verifierResult: Awaited<ReturnType<typeof runExternalVerifierV0B>> | null = null;
	const verifierResultPath = resolve(runRoot, "verifier/result.json");
	if (executionStatus === "completed") {
		const verifierSourcePath = writeOnceBytes(runRoot, `verifier/${basename(task.verifier_spec.source_path)}`, readFileSync(resolve(task.verifier_spec.source_path)));
		const verifierRef = artifactRef(runRoot, verifierSourcePath, "text/javascript; charset=utf-8", false);
		const verifierTask: TaskSpecV0B = {
			schema_version: 1, task_id: task.task_id, instruction_ref: "not_applicable", instruction_sha256: "0".repeat(64), workspace_source_ref: task.source_root,
			workspace_source_digest: isolated.before.tree_digest, writable_paths: task.writable_paths, protected_paths: task.protected_paths,
			verifier_id: task.verifier_spec.id, verifier_ref: task.verifier_spec.source_path, verifier_sha256: task.verifier_spec.sha256,
			acceptance_visibility: "hidden_external", tool_profile_id: "coding_task_bounded", command_descriptors: task.command_descriptors,
			verifier_command: { executable: "current_node_executable", argv: [task.verifier_spec.source_path], cwd: "project", timeout_ms: task.verifier_spec.timeout_ms, output_limit_bytes: task.verifier_spec.output_limit_bytes },
		};
		verifierResult = await runExternalVerifierV0B({ projectRoot: runRoot, runRoot, workspaceRoot, attemptId: runId, task: verifierTask, verifierSnapshotPath: verifierSourcePath, verifierSnapshotRef: verifierRef, outputPath: "verifier/output.txt", workspaceEnvironmentKey: "V1_WORKSPACE" });
		writeJson(verifierResultPath, verifierResult);
		if (verifierResult.status === "passed" || verifierResult.status === "failed") verificationStatus = verifierResult.status;
		else { verificationStatus = "not_run"; failureReason = "verifier"; }
	}
	if (!verifierResult) writeJson(verifierResultPath, { schema_version: 1, status: "not_run", reason: executionError ?? "execution did not complete" });
	const entries = await session.getEntries();
	const finishedAt = new Date().toISOString();
	const durationMs = Math.max(0, (options.now ?? Date.now)() - startedMs);
	const sessionPath = portableArtifactPath(runRoot, sessionMetadata.path);
	if (!existsSync(resolve(runRoot, sessionPath))) throw new Error("raw Session JSONL was not persisted");
	const tracePath = resolve(runRoot, "trace.json");
	const usage: CodingTaskUsage = { request_count: Math.max(requestCount, providerResponseCount), input_tokens: usageObserved ? inputTokens : "unknown", output_tokens: usageObserved ? outputTokens : "unknown", cost_usd: usageObserved ? costUsd : "unknown", tool_count: profile.auditEvents.filter((event) => event.type === "start").length, duration_ms: durationMs, unknown_fields: usageObserved ? [] : ["input_tokens", "output_tokens", "cost_usd"] };
	const trace = {
		schema_version: 1,
		task: { task_id: task.task_id, prompt: task.prompt, source_revision: task.source_revision ?? null, existing_tree_digest: task.existing_tree_digest ?? null, writable_paths: task.writable_paths, protected_paths: task.protected_paths },
		run: { run_id: runId, started_at: startedAt, finished_at: finishedAt, model: { provider: options.runtime.model.provider, id: options.runtime.model.id }, session_path: sessionPath, workspace_path: "workspace" },
		messages: entries.filter((entry) => entry.type === "message").map((entry) => projectMessage(entry.message)),
		events,
		agent: { status: executionStatus, completed: executionStatus === "completed", timeout: executionStatus === "timeout", aborted: executionStatus === "aborted", failed: executionStatus === "infrastructure_failed", final_claim: finalClaim, end_reason: executionError ?? (settled ? "settled" : "unknown"), runtime_close_error: runtimeCloseError },
		changes: { ...diff.changes, diff_path: "diff.patch", before_tree_digest: isolated.before.tree_digest, after_tree_digest: after.tree_digest },
		usage,
		verification: { verifier_id: task.verifier_spec.id, command: [process.execPath, task.verifier_spec.source_path], exit_code: verifierResult?.exit_code ?? null, status: verificationStatus, result_path: "verifier/result.json" },
		result: { execution_status: executionStatus, verification_status: verificationStatus, failure_reason: failureReason },
	};
	writeJson(tracePath, trace);
	const manifest: CodingTaskRunManifest = {
		schema_version: 1, run_id: runId, task_id: task.task_id, source_revision: task.source_revision ?? null, existing_tree_digest: task.existing_tree_digest ?? null,
		model: { provider: options.runtime.model.provider, id: options.runtime.model.id }, pi_commit: PINNED_PI_COMMIT, execution_status: executionStatus, verification_status: verificationStatus,
		failure_reason: failureReason, agent_final_claim: finalClaim, started_at: startedAt, finished_at: finishedAt, usage: trace.usage, changes: diff.changes,
		artifacts: { session: sessionPath, trace: "trace.json", diff: "diff.patch", verifier_result: "verifier/result.json", report: "report.md" },
		known_limitations: [...(usageObserved ? [] : ["Provider token and cost usage were unavailable."]), ...(runtimeCloseError ? [`Runtime close failed: ${runtimeCloseError}`] : []), ...(executionError ? [`Execution detail: ${executionError}`] : [])],
	};
	writeJson(resolve(runRoot, "run-manifest.json"), manifest);
	writeText(resolve(runRoot, "report.md"), renderReport(manifest));
	return { manifest, run_root: runRoot };
}
