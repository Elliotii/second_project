import { lstatSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AgentHarness } from "@earendil-works/pi-agent-core";
import {
	createModels,
	InMemoryCredentialStore,
	type AssistantMessage,
} from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";
import type { TaskSpecV0B } from "../contracts/v0b-types.ts";
import type { PostV35RealSmokeAuthority, PostV35SmokeTurnAuthority } from "../contracts/post-v35-real-types.ts";
import { artifactRef, writeOnceBytes, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, fileSha256, sha256, stableJson, treeDigest } from "../hash.ts";
import { GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3 } from "../pi/runtime-profile-v3.ts";
import { createBoundedToolProfile } from "../pi/tool-profile.ts";
import { assertKnownUsageV1B, type OpaqueCredentialResolverV1 } from "../provider/fixed-provider-v1.ts";
import { runExternalVerifierV0B } from "../verifier/runner.ts";
import type { PersistentRealTurnExecutionV35, PersistentTurnExecutionInputV35, PersistentTurnExecutorV35 } from "./persistent-session-v35.ts";

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const REQUIRED_WRITABLE_PATHS = ["src/**", "test/**"];
const REQUIRED_BUDGET = Object.freeze({
	provider_requests_total_max: 16,
	tool_calls_total_max: 24,
	combined_tokens_total_max: 131_072,
	cost_usd_total_max: 0.2,
	wall_time_total_ms_max: 1_800_000,
});

type ModelsV35 = ReturnType<typeof createModels>;
type ModelV35 = NonNullable<ReturnType<ModelsV35["getModel"]>>;

export interface PostV35RealModelRuntime {
	models: ModelsV35;
	model: ModelV35;
	close(): Promise<void>;
}

export interface PostV35RealModelFactory {
	create(credential: string): Promise<PostV35RealModelRuntime> | PostV35RealModelRuntime;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
	if (stableJson(Object.keys(value).sort()) !== stableJson([...expected].sort())) throw new Error(`${label} fields are invalid`);
}

function safeRelativePath(value: string, label: string): void {
	if (value.length === 0 || value.includes("\0") || /^[A-Za-z]:/.test(value) || value.startsWith("/") || value.startsWith("\\") || value.replaceAll("\\", "/").split("/").includes("..")) throw new Error(`${label} is invalid`);
}

function parseTurn(value: unknown, ordinal: 1 | 2): PostV35SmokeTurnAuthority {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("real-smoke turn authority is invalid");
	const turn = value as Record<string, unknown>;
	exactKeys(turn, ["ordinal", "prompt_sha256", "verifier_id", "verifier_source_path", "verifier_sha256", "verifier_timeout_ms", "verifier_output_limit_bytes"], "real-smoke turn authority");
	if (turn.ordinal !== ordinal || typeof turn.prompt_sha256 !== "string" || !SHA256.test(turn.prompt_sha256) || typeof turn.verifier_id !== "string" || !ID.test(turn.verifier_id) || typeof turn.verifier_source_path !== "string" || typeof turn.verifier_sha256 !== "string" || !SHA256.test(turn.verifier_sha256) || !Number.isSafeInteger(turn.verifier_timeout_ms) || Number(turn.verifier_timeout_ms) < 1 || Number(turn.verifier_timeout_ms) > 120_000 || !Number.isSafeInteger(turn.verifier_output_limit_bytes) || Number(turn.verifier_output_limit_bytes) < 1 || Number(turn.verifier_output_limit_bytes) > 1_048_576) throw new Error("real-smoke turn authority values are invalid");
	const verifierPath = resolve(turn.verifier_source_path);
	const stats = lstatSync(verifierPath);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1 || fileSha256(verifierPath) !== turn.verifier_sha256) throw new Error("real-smoke Verifier source identity is invalid");
	return turn as unknown as PostV35SmokeTurnAuthority;
}

export function parsePostV35RealSmokeAuthority(value: unknown): PostV35RealSmokeAuthority {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("real-smoke authority is invalid");
	const authority = value as Record<string, unknown>;
	exactKeys(authority, ["schema_version", "mode", "project_id", "workspace_id", "initial_workspace_sha256", "system_prompt", "task_policy", "provider_profile", "binding_status", "budget", "turns", "authority_digest"], "real-smoke authority");
	if (authority.schema_version !== 1 || authority.mode !== "real_product_smoke" || typeof authority.project_id !== "string" || !ID.test(authority.project_id) || typeof authority.workspace_id !== "string" || !ID.test(authority.workspace_id) || typeof authority.initial_workspace_sha256 !== "string" || !SHA256.test(authority.initial_workspace_sha256) || typeof authority.system_prompt !== "string" || Buffer.byteLength(authority.system_prompt, "utf8") < 1 || Buffer.byteLength(authority.system_prompt, "utf8") > 16_384 || authority.provider_profile !== "deepseek-v4-flash" || authority.binding_status !== "not_applicable" || typeof authority.authority_digest !== "string" || !SHA256.test(authority.authority_digest)) throw new Error("real-smoke authority values are invalid");
	if (!authority.task_policy || typeof authority.task_policy !== "object" || Array.isArray(authority.task_policy)) throw new Error("real-smoke Tool policy is invalid");
	const policy = authority.task_policy as Record<string, unknown>;
	exactKeys(policy, ["writable_paths", "protected_paths", "command_descriptors"], "real-smoke Tool policy");
	if (!Array.isArray(policy.writable_paths) || stableJson(policy.writable_paths) !== stableJson(REQUIRED_WRITABLE_PATHS) || !Array.isArray(policy.protected_paths) || policy.protected_paths.some((entry) => typeof entry !== "string") || !Array.isArray(policy.command_descriptors) || policy.command_descriptors.length !== 1) throw new Error("real-smoke Tool policy values are invalid");
	for (const path of policy.protected_paths as string[]) safeRelativePath(path, "protected path");
	const descriptor = policy.command_descriptors[0];
	if (!descriptor || typeof descriptor !== "object" || Array.isArray(descriptor)) throw new Error("real-smoke command descriptor is invalid");
	const command = descriptor as Record<string, unknown>;
	exactKeys(command, ["command_id", "executable", "argv", "cwd", "timeout_seconds", "max_combined_output_bytes"], "real-smoke command descriptor");
	if (command.command_id !== "public_test" || command.executable !== "current_node_executable" || stableJson(command.argv) !== stableJson(["--test"]) || command.cwd !== "workspace" || !Number.isSafeInteger(command.timeout_seconds) || Number(command.timeout_seconds) < 1 || Number(command.timeout_seconds) > 120 || !Number.isSafeInteger(command.max_combined_output_bytes) || Number(command.max_combined_output_bytes) < 1 || Number(command.max_combined_output_bytes) > 1_048_576) throw new Error("real-smoke command descriptor values are invalid");
	if (!authority.budget || typeof authority.budget !== "object" || Array.isArray(authority.budget) || stableJson(authority.budget) !== stableJson(REQUIRED_BUDGET)) throw new Error("real-smoke budget is not the frozen envelope");
	if (!Array.isArray(authority.turns) || authority.turns.length !== 2) throw new Error("real-smoke turn list is invalid");
	parseTurn(authority.turns[0], 1);
	parseTurn(authority.turns[1], 2);
	const body = { ...authority };
	delete body.authority_digest;
	if (digestObject(body) !== authority.authority_digest) throw new Error("real-smoke authority digest is invalid");
	return authority as unknown as PostV35RealSmokeAuthority;
}

export function loadPostV35RealSmokeAuthority(pathValue: string): PostV35RealSmokeAuthority {
	const path = resolve(pathValue);
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("real-smoke authority must be one ordinary file");
	return parsePostV35RealSmokeAuthority(JSON.parse(readFileSync(path, "utf8")) as unknown);
}

export function createPostV35DeepSeekModelFactory(): PostV35RealModelFactory {
	return {
		async create(credential: string): Promise<PostV35RealModelRuntime> {
			const credentials = new InMemoryCredentialStore();
			await credentials.modify(GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.provider_id, async () => ({ type: "api_key", key: credential }));
			const models = createModels({ credentials });
			models.setProvider(deepseekProvider());
			const model = models.getModel(GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.provider_id, GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.model_id);
			if (!model) throw new Error("fixed DeepSeek model is unavailable");
			return { models, model, async close(): Promise<void> {} };
		},
	};
}

export function createPostV35RealSmokeTurnExecutor(options: {
	authorized: boolean;
	authority: PostV35RealSmokeAuthority;
	credentialResolver?: OpaqueCredentialResolverV1;
	modelFactory?: PostV35RealModelFactory;
}): PersistentTurnExecutorV35 {
	if (!options.authorized || !options.credentialResolver) throw new Error("real-smoke host authority and opaque Credential resolver are required");
	const authority = parsePostV35RealSmokeAuthority(options.authority);
	const resolver = options.credentialResolver;
	const modelFactory = options.modelFactory ?? createPostV35DeepSeekModelFactory();
	return Object.freeze({
		mode: "real_product_smoke" as const,
		async execute(input: PersistentTurnExecutionInputV35): Promise<PersistentRealTurnExecutionV35> {
			if (input.priorRunCount > 1 || (input.priorRunCount === 0) !== (input.priorRunId === null)) throw new Error("real-smoke permits exactly two ordered Runs");
			const turn = authority.turns[input.priorRunCount];
			if (!turn || sha256(input.prompt) !== turn.prompt_sha256) throw new Error("browser prompt does not match frozen host authority");
			if (input.priorRunCount === 0 && treeDigest(input.workspaceRoot) !== authority.initial_workspace_sha256) throw new Error("real-smoke initial Workspace identity mismatch");
			const budget = authority.budget;
			if (input.priorUsage.provider_requests >= budget.provider_requests_total_max || input.priorUsage.tool_calls >= budget.tool_calls_total_max || input.priorUsage.input_tokens + input.priorUsage.output_tokens >= budget.combined_tokens_total_max || input.priorUsage.cost_usd >= budget.cost_usd_total_max || input.priorUsage.wall_time_ms >= budget.wall_time_total_ms_max) throw new Error("real-smoke whole-session budget is exhausted");
			const verifierSource = readFileSync(resolve(turn.verifier_source_path));
			const verifierSnapshotPath = writeOnceBytes(input.runRoot, "verifier/source.mjs", verifierSource);
			const verifierSnapshotRef = artifactRef(input.runRoot, verifierSnapshotPath, "text/javascript; charset=utf-8", false);
			if (verifierSnapshotRef.sha256 !== turn.verifier_sha256) throw new Error("real-smoke Verifier snapshot identity mismatch");
			let credentialReads = 0;
			const credential = await resolver.resolve();
			credentialReads++;
			if (typeof credential !== "string" || credential.length === 0) throw new Error("opaque Credential resolution failed");
			const runtime = await modelFactory.create(credential);
			const tools = createBoundedToolProfile(input.workspaceRoot, authority.task_policy, {
				allowed_tool_names: ["workspace_read", "workspace_list", "workspace_search", "workspace_edit", "workspace_write", "run_command"],
				allow_repository_commands: false,
				expose_task_command_ids: true,
				terminate_on_successful_command_ids: ["public_test"],
			});
			const harness = new AgentHarness({ models: runtime.models, session: input.session, model: runtime.model, tools: tools.tools, toolContext: tools.context, systemPrompt: authority.system_prompt, thinkingLevel: "off", streamOptions: { maxRetries: 0, timeoutMs: budget.wall_time_total_ms_max - input.priorUsage.wall_time_ms } });
			let settledEvents = 0;
			let providerRequests = 0;
			let inputTokens = 0;
			let outputTokens = 0;
			let costUsd = 0;
			let toolCallAttempts = 0;
			let observedPriorDigest = "";
			const started = Date.now();
			const unsubscribe = harness.subscribe((event) => {
				if (event.type === "settled") settledEvents++;
				if (event.type === "message_end" && event.message.role === "assistant") {
					const message = event.message as AssistantMessage;
					assertKnownUsageV1B({ input_tokens: message.usage.input + message.usage.cacheRead + message.usage.cacheWrite, output_tokens: message.usage.output, cost_usd: message.usage.cost.total });
					inputTokens += message.usage.input + message.usage.cacheRead + message.usage.cacheWrite;
					outputTokens += message.usage.output;
					costUsd += message.usage.cost.total;
				}
			});
			const offContext = harness.on("context", (event) => {
				const digest = digestObject(event.messages.slice(0, input.priorMessages.length));
				if (digest !== input.priorContextSha256) throw new Error("provider-bound context does not contain the authenticated Session prefix");
				observedPriorDigest = digest;
				return { messages: event.messages };
			});
			const offRequest = harness.on("before_provider_request", () => {
				if (input.priorUsage.provider_requests + ++providerRequests > budget.provider_requests_total_max) throw new Error("real-smoke Provider request budget exceeded before dispatch");
				return undefined;
			});
			const offTool = harness.on("tool_call", () => {
				if (input.priorUsage.tool_calls + ++toolCallAttempts > budget.tool_calls_total_max) throw new Error("real-smoke Tool-call budget exceeded");
				return undefined;
			});
			try {
				await harness.prompt(input.prompt);
				await harness.waitForIdle();
			} finally {
				unsubscribe(); offContext(); offRequest(); offTool(); await harness.abort(); await runtime.close();
			}
			const wallTimeMs = Math.max(0, Date.now() - started);
			if (settledEvents !== 1 || observedPriorDigest !== input.priorContextSha256 || tools.pendingSideEffects() !== 0) throw new Error("real-smoke Direct AgentHarness turn did not settle safely");
			if (input.priorUsage.input_tokens + input.priorUsage.output_tokens + inputTokens + outputTokens > budget.combined_tokens_total_max || input.priorUsage.cost_usd + costUsd > budget.cost_usd_total_max || input.priorUsage.wall_time_ms + wallTimeMs > budget.wall_time_total_ms_max) throw new Error("real-smoke usage exceeded the frozen whole-session budget");
			const starts = tools.auditEvents.filter((event) => event.type === "start").map((event) => event.tool_call_id);
			const entries = await input.session.getEntries();
			const results = entries.flatMap((entry) => entry.type === "message" && entry.message.role === "toolResult" ? [entry.message.toolCallId] : []).slice(-starts.length);
			if (starts.length === 0 || stableJson(starts) !== stableJson(results)) throw new Error("real-smoke Tool lifecycle is incomplete");
			const task: TaskSpecV0B = {
				schema_version: 1,
				task_id: `post-v35-smoke-turn-${turn.ordinal}`,
				instruction_ref: "host-authority",
				instruction_sha256: turn.prompt_sha256,
				workspace_source_ref: "host-authority",
				workspace_source_digest: authority.initial_workspace_sha256,
				writable_paths: [...authority.task_policy.writable_paths],
				protected_paths: [...authority.task_policy.protected_paths],
				verifier_id: turn.verifier_id,
				verifier_ref: "verifier/source.mjs",
				verifier_sha256: turn.verifier_sha256,
				acceptance_visibility: "hidden_external",
				tool_profile_id: "post_v35_real_smoke_bounded_local",
				command_descriptors: authority.task_policy.command_descriptors.map((descriptor) => ({ ...descriptor, argv: [...descriptor.argv] })),
				verifier_command: { executable: "current_node_executable", argv: ["<verifier_snapshot>"], cwd: "project", timeout_ms: turn.verifier_timeout_ms, output_limit_bytes: turn.verifier_output_limit_bytes },
			};
			const verifier = await runExternalVerifierV0B({ projectRoot: input.runRoot, runRoot: input.runRoot, workspaceRoot: input.workspaceRoot, attemptId: `${input.runId}-attempt`, task, verifierSnapshotPath, verifierSnapshotRef, outputPath: "verifier/output.txt", workspaceEnvironmentKey: "V35_WORKSPACE" });
			if (verifier.status === "invalid") throw new Error("real-smoke external Verifier result is invalid");
			writeOnceJson(input.runRoot, "verifier/result.json", verifier);
			const outcome = verifier.status;
			writeOnceJson(input.runRoot, "outcome.json", { schema_version: 1, run_id: input.runId, session_id: input.sessionId, verifier_id: turn.verifier_id, verifier_status: verifier.status, outcome, binding_status: "not_applicable", context_reconstructed: true });
			return {
				mode: "real_product_smoke",
				settled_events: 1,
				provider_observed_prior_context_sha256: observedPriorDigest,
				provider_requests: providerRequests,
				credential_reads: credentialReads,
				network_calls: providerRequests,
				external_provider_calls: providerRequests,
				real_model_calls: providerRequests,
				input_tokens: inputTokens,
				output_tokens: outputTokens,
				cost_usd: costUsd,
				wall_time_ms: wallTimeMs,
				tool_call_ids: starts,
				tool_result_ids: results,
				verifier_id: turn.verifier_id,
				verifier_status: verifier.status,
				verifier_ref: "verifier/result.json",
				outcome,
				outcome_ref: "outcome.json",
				binding_status: "not_applicable",
			};
		},
	});
}
