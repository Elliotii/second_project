import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createModels, type AssistantMessage, type Model, type ToolCall } from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";
import {
	AgentHarness,
	type AgentHarnessEvent,
	Session,
	type SessionTreeEntry,
} from "@earendil-works/pi-agent-core";
import { DEEPSEEK_MODEL, MODEL_PRICE_PROVENANCE } from "./model.ts";
import { type ReasoningRecord, RedactingJsonlSessionStorage } from "./session-storage.ts";
import { appendJsonl, canonical, sha256, treeDigest, treeInventory, writeJson } from "./runtime-utils.ts";
import { G005_TOOL_NAMES, createG005Tools, type G005ToolContext, type ToolAuditRecord } from "./tools.ts";
import { type VerificationResult, verifyWorkspace } from "./verifier.ts";

const PROJECT_COMMIT = "33c7e534b2d0f13201384ab754c7f3c9351635a0";
const PI_COMMIT = "027a5847901b5dde30270abaa1041046cd2b4b55";
const ARTIFACT = {
	name: "@earendil-works/pi-ai",
	version: "0.82.1",
	integrity: "sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A==",
	shasum: "02ebdfc2997fd88ca1f51a7b5c01f337a9462f34",
	gitHead: "b4f293684bba718d59cc1157679bcf6157b3a7f5",
	selectedFiles: 38,
	restoredManifestSha256: "c2d89b03ccb2c095c59ead0437592b21e9676d049ad8e92ea90a466adf10b24d",
};
const SYSTEM_PROMPT = [
	"You are a coding-task agent inside a restricted workspace.",
	"Use read_task_and_source to inspect the complete task, current source, and public tests.",
	"Edit only through write_source and validate only through run_public_tests.",
	"Implement the complete stated contract, including boundaries not necessarily covered by visible tests.",
	"Do not merely describe a solution. Finish after the code is correct and public tests pass.",
].join("\n");
const INITIAL_PROMPT = "Complete the parseDuration task now. Use the provided tools and leave the workspace in a correct final state.";
const STREAM_OPTIONS = { timeoutMs: 120_000, maxRetries: 0, maxRetryDelayMs: 0, cacheRetention: "none" as const };
const MAX_PROVIDER_REQUESTS_PER_CYCLE = 8;
const MAX_TOOL_CALLS_PER_CYCLE = 12;
const MAX_CYCLE_MS = 5 * 60_000;
const MAX_GOAL_MS = 20 * 60_000;
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const evidenceRoot = resolve(projectRoot, ".runs/g005/evidence");
const secret = process.env.DEEPSEEK_API_KEY ?? "";

type Variant = "baseline" | "candidate";
type Cycle = "initial" | "verification_recovery";

class G005ExecutionError extends Error {
	readonly classification: "external_service" | "route" | "evidence";

	constructor(
		classification: "external_service" | "route" | "evidence",
		message: string,
	) {
		super(message);
		this.classification = classification;
	}
}

type JournalEntry = {
	seq: number;
	timestamp: string;
	type: string;
	runId: string;
	sessionId: string;
	cycle?: Cycle;
	[key: string]: unknown;
};

type CycleCounters = {
	providerRequests: number;
	providerResponses: number;
	toolStarts: number;
	toolEnds: number;
	settled: number;
	startedAt: number;
};

function safeErrorText(value: unknown): string {
	const raw = value instanceof Error ? value.message : String(value);
	return secret.length > 0 ? raw.replaceAll(secret, "[REDACTED]") : raw;
}

function resetWorkspace(source: string, target: string): void {
	if (existsSync(target)) throw new Error(`workspace already exists: ${target}`);
	mkdirSync(target, { recursive: true });
	cpSync(source, target, { recursive: true, errorOnExist: true, force: false });
}

function createManifest(variant: Variant, workspace: string, fixtureDigest: string, checkedAt: string) {
	return {
		schemaVersion: 1,
		goal: "G005",
		attempt: "g005-paired-attempt-001",
		runIdentity: { runId: `g005-${variant}`, policyVariant: variant, workspace },
		projectCommit: PROJECT_COMMIT,
		piCommit: PI_COMMIT,
		modelDataArtifact: ARTIFACT,
		runtime: {
			os: "windows-native",
			node: process.version,
			publicPackageBoundary: "emitted @earendil-works/pi-agent-core + @earendil-works/pi-ai/providers/deepseek",
		},
		credential: { allowedKeyName: "DEEPSEEK_API_KEY", credential_configured: secret.trim().length > 0 },
		model: DEEPSEEK_MODEL,
		pricing: { ...MODEL_PRICE_PROVENANCE, checkedAt },
		providerPolicy: STREAM_OPTIONS,
		thinkingLevel: "high",
		fixture: {
			id: "parse-duration-prefix-parser-v1",
			treeDigest: fixtureDigest,
			mutablePath: "src/parse-duration.ts",
			hiddenAcceptanceOutsideWorkspace: true,
		},
		prompts: { systemSha256: sha256(SYSTEM_PROMPT), initialSha256: sha256(INITIAL_PROMPT) },
		tools: G005_TOOL_NAMES,
		verifier: { id: "g005-parse-duration-verifier-v1", timeoutMs: 30_000, feedbackCapBytes: 8_192 },
		budgets: {
			providerRequestsPerCycle: MAX_PROVIDER_REQUESTS_PER_CYCLE,
			toolCallsPerCycle: MAX_TOOL_CALLS_PER_CYCLE,
			cycleTimeoutMs: MAX_CYCLE_MS,
			goalTimeoutAfterFirstProviderMs: MAX_GOAL_MS,
			baseline: { cycles: 1, verifiers: 1 },
			candidate: { cycles: 2, recoveryCycles: 1, verifiers: 2 },
		},
	};
}

function payloadSummary(payload: unknown) {
	if (!payload || typeof payload !== "object") throw new G005ExecutionError("route", "provider payload is not an object");
	const body = payload as Record<string, unknown>;
	const forbiddenKeys: string[] = [];
	const visit = (value: unknown) => {
		if (!value || typeof value !== "object") return;
		for (const [key, child] of Object.entries(value)) {
			if (["authorization", "api_key", "apikey"].includes(key.toLowerCase())) forbiddenKeys.push(key);
			visit(child);
		}
	};
	visit(body);
	assert.deepEqual(forbiddenKeys, [], "provider payload captured an auth field");
	assert.equal(body.model, "deepseek-v4-flash");
	assert.deepEqual(body.thinking, { type: "enabled" });
	assert.equal(body.reasoning_effort, "high");
	assert.equal(body.max_tokens, 8_192);
	assert.equal("temperature" in body, false);
	const tools = Array.isArray(body.tools) ? body.tools : [];
	const toolNames = tools.map((tool) => {
		const value = tool as { function?: { name?: unknown } };
		return typeof value.function?.name === "string" ? value.function.name : null;
	});
	assert.deepEqual(toolNames, [...G005_TOOL_NAMES]);
	const messages = Array.isArray(body.messages) ? body.messages : [];
	return {
		model: body.model,
		thinking: body.thinking,
		reasoning_effort: body.reasoning_effort,
		max_tokens: body.max_tokens,
		toolNames,
		messageRoles: messages.map((message) => (message as { role?: unknown }).role ?? null),
		reasoningReplay: messages.flatMap((message, messageIndex) => {
			const record = message as { role?: unknown; reasoning_content?: unknown };
			return record.role === "assistant" && typeof record.reasoning_content === "string"
				? [{ messageIndex, present: true, characterLength: record.reasoning_content.length, utf8Bytes: Buffer.byteLength(record.reasoning_content) }]
				: [];
		}),
	};
}

function assistantSummary(message: AssistantMessage) {
	return {
		stopReason: message.stopReason,
		responseIdPresent: typeof message.responseId === "string" && message.responseId.length > 0,
		responseModel: message.responseModel,
		contentTypes: message.content.map((block) => block.type),
		thinking: message.content.flatMap((block, contentIndex) =>
			block.type === "thinking"
				? [{ contentIndex, present: true, characterLength: block.thinking.length, utf8Bytes: Buffer.byteLength(block.thinking) }]
				: [],
		),
		toolCalls: message.content.flatMap((block) =>
			block.type === "toolCall" ? [{ id: block.id, name: block.name, argumentKeys: Object.keys(block.arguments).sort() }] : [],
		),
		usage: message.usage,
		error: message.errorMessage ? safeErrorText(message.errorMessage) : undefined,
	};
}

type SessionProjectionEntry = {
	entryId: string;
	parentId: string | null;
	role: string;
	toolCallIds?: string[];
	toolCallId?: string;
	thinkingBlockCount?: number;
};

function projectSession(entries: SessionTreeEntry[]): SessionProjectionEntry[] {
	const projected: SessionProjectionEntry[] = [];
	for (const entry of entries) {
		if (entry.type !== "message") continue;
		const message = entry.message;
		if (message.role === "assistant") {
			projected.push({
				entryId: entry.id,
				parentId: entry.parentId,
				role: message.role,
				toolCallIds: message.content.flatMap((block) => (block.type === "toolCall" ? [block.id] : [])),
				thinkingBlockCount: message.content.filter((block) => block.type === "thinking").length,
			});
			continue;
		}
		if (message.role === "toolResult") {
			projected.push({ entryId: entry.id, parentId: entry.parentId, role: message.role, toolCallId: message.toolCallId });
			continue;
		}
		projected.push({ entryId: entry.id, parentId: entry.parentId, role: message.role });
	}
	return projected;
}

async function runCycle(harness: AgentHarness<G005ToolContext>, prompt: string, label: string): Promise<void> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		await Promise.race([
			harness.prompt(prompt),
			new Promise<never>((_resolvePromise, reject) => {
				timer = setTimeout(() => reject(new G005ExecutionError("route", `${label} exceeded ${MAX_CYCLE_MS} ms`)), MAX_CYCLE_MS);
			}),
		]);
	} catch (error) {
		await harness.abort().catch(() => undefined);
		throw error;
	} finally {
		if (timer) clearTimeout(timer);
	}
}

async function runVariant(options: {
	variant: Variant;
	workspace: string;
	manifest: ReturnType<typeof createManifest>;
	goalClock: { firstProviderAt: number | null };
}) {
	const runId = `g005-${options.variant}`;
	const sessionId = `${runId}-session`;
	const journalPath = resolve(evidenceRoot, "events", `${options.variant}.jsonl`);
	let seq = 0;
	let cycle: Cycle = "initial";
	const counters: Record<Cycle, CycleCounters> = {
		initial: { providerRequests: 0, providerResponses: 0, toolStarts: 0, toolEnds: 0, settled: 0, startedAt: Date.now() },
		verification_recovery: { providerRequests: 0, providerResponses: 0, toolStarts: 0, toolEnds: 0, settled: 0, startedAt: 0 },
	};
	const journal = (type: string, fields: Record<string, unknown> = {}) => {
		const entry: JournalEntry = { seq: ++seq, timestamp: new Date().toISOString(), type, runId, sessionId, cycle, ...fields };
		appendJsonl(journalPath, entry);
	};
	const reasoningRecords: ReasoningRecord[] = [];
	const sessionPath = resolve(evidenceRoot, "sessions", `${options.variant}.jsonl`);
	const storage = RedactingJsonlSessionStorage.create({
		filePath: sessionPath,
		id: sessionId,
		cwd: options.workspace,
		metadata: { goal: "G005", run_id: runId, policy_variant: options.variant },
		onReasoning: (record) => {
			reasoningRecords.push(record);
			journal("reasoning_metadata", record);
		},
	});
	const session = new Session(storage);
	const models = createModels();
	models.setProvider(deepseekProvider());
	const toolMutations: ToolAuditRecord[] = [];
	const toolContext: G005ToolContext = {
		workspace: options.workspace,
		record: (record) => {
			toolMutations.push(record);
			journal("tool_side_effect", record);
		},
	};
	const harness = new AgentHarness({
		models,
		session,
		model: DEEPSEEK_MODEL as Model<any>,
		thinkingLevel: "high",
		systemPrompt: SYSTEM_PROMPT,
		tools: createG005Tools(),
		activeToolNames: [...G005_TOOL_NAMES],
		toolContext,
		streamOptions: STREAM_OPTIONS,
	});

	harness.on("before_provider_request", (event) => {
		if (options.goalClock.firstProviderAt === null) options.goalClock.firstProviderAt = Date.now();
		if (Date.now() - options.goalClock.firstProviderAt > MAX_GOAL_MS) {
			throw new G005ExecutionError("route", "goal provider-call window exceeded 20 minutes");
		}
		const count = ++counters[cycle].providerRequests;
		if (count > MAX_PROVIDER_REQUESTS_PER_CYCLE) throw new G005ExecutionError("route", `${cycle} provider budget exceeded`);
		assert.equal(event.model.id, DEEPSEEK_MODEL.id);
		assert.equal(event.streamOptions.timeoutMs, 120_000);
		assert.equal(event.streamOptions.maxRetries, 0);
		journal("provider_request_start", {
			requestIndex: count,
			model: event.model.id,
			thinkingLevel: harness.getThinkingLevel(),
			timeoutMs: event.streamOptions.timeoutMs,
			maxRetries: event.streamOptions.maxRetries,
		});
		return undefined;
	});
	harness.on("before_provider_payload", (event) => {
		journal("provider_payload_shape", payloadSummary(event.payload));
		return undefined;
	});
	harness.on("after_provider_response", (event) => {
		counters[cycle].providerResponses += 1;
		journal("provider_response", { status: event.status });
		return undefined;
	});
	harness.subscribe((event: AgentHarnessEvent) => {
		if (event.type === "tool_execution_start") {
			const count = ++counters[cycle].toolStarts;
			if (count > MAX_TOOL_CALLS_PER_CYCLE) throw new G005ExecutionError("route", `${cycle} tool budget exceeded`);
			journal("tool_execution_start", { toolCallId: event.toolCallId, toolName: event.toolName, argumentKeys: Object.keys(event.args ?? {}).sort() });
		} else if (event.type === "tool_execution_end") {
			counters[cycle].toolEnds += 1;
			journal("tool_execution_end", { toolCallId: event.toolCallId, toolName: event.toolName, isError: event.isError });
		} else if (event.type === "message_end" && event.message.role === "assistant") {
			journal("assistant_message", assistantSummary(event.message));
		} else if (event.type === "settled") {
			counters[cycle].settled += 1;
			journal("agent_settled", { nextTurnCount: event.nextTurnCount });
		}
	});

	const assertCycleRoute = async (target: Cycle) => {
		const count = counters[target];
		if (count.providerResponses < 1 || count.toolStarts < 1 || count.toolEnds < 1 || count.settled !== 1) {
			throw new G005ExecutionError("route", `${options.variant}/${target} did not produce provider+tool+result+settled`);
		}
		const entries = await session.getEntries();
		const assistants = entries.flatMap((entry) =>
			entry.type === "message" && entry.message.role === "assistant" ? [entry.message] : [],
		);
		const last = assistants.at(-1);
		if (!last) throw new G005ExecutionError("route", `${options.variant}/${target} has no assistant message`);
		if (last.stopReason === "error" || last.stopReason === "aborted") {
			const message = safeErrorText(last.errorMessage ?? `assistant stopped: ${last.stopReason}`);
			const external = /401|402|403|408|429|5\d\d|timeout|network|rate|quota|balance|service/i.test(message);
			throw new G005ExecutionError(external ? "external_service" : "route", message);
		}
	};

	journal("run_started", { manifestSha256: sha256(canonical(options.manifest)) });
	journal("session_linked", { sessionPath: relative(projectRoot, sessionPath).replaceAll("\\", "/") });
	journal("agent_cycle_started");
	await runCycle(harness, INITIAL_PROMPT, `${options.variant} initial cycle`);
	await assertCycleRoute("initial");
	journal("verifier_started");
	let verification = await verifyWorkspace({
		projectRoot,
		workspace: options.workspace,
		evidencePath: resolve(evidenceRoot, "verifier", `${options.variant}-initial.json`),
	});
	journal("verifier_completed", { status: verification.status, outputSha256: verification.fullOutputSha256 });
	const initialVerification = verification;

	if (options.variant === "baseline") {
		journal("policy_decision", { decision: "stop_after_initial_verification", verifierStatus: verification.status });
	} else if (verification.status === "failed") {
		journal("policy_decision", { decision: "queue_one_verifier_triggered_recovery" });
		cycle = "verification_recovery";
		counters[cycle].startedAt = Date.now();
		const recoveryPrompt = JSON.stringify({
			type: "verifier_failure",
			verifier: verification.id,
			instruction: "Repair only src/parse-duration.ts, run public tests, and finish. This is the sole recovery cycle.",
			feedback: verification.feedback,
		});
		journal("continuation_queued", { recoveryPromptSha256: sha256(recoveryPrompt), feedbackBytes: Buffer.byteLength(verification.feedback) });
		journal("agent_cycle_started");
		await runCycle(harness, recoveryPrompt, "candidate recovery cycle");
		await assertCycleRoute("verification_recovery");
		journal("verifier_started");
		verification = await verifyWorkspace({
			projectRoot,
			workspace: options.workspace,
			evidencePath: resolve(evidenceRoot, "verifier", "candidate-recovery.json"),
		});
		journal("verifier_completed", { status: verification.status, outputSha256: verification.fullOutputSha256 });
	} else {
		journal("policy_decision", { decision: "no_recovery_initial_verifier_passed" });
	}

	const sessionProjection = projectSession(await session.getEntries());
	for (let index = 1; index < sessionProjection.length; index += 1) {
		assert.equal(sessionProjection[index]?.parentId, sessionProjection[index - 1]?.entryId, "session must be one parent-linked chain");
	}
	const assistantCalls = sessionProjection.flatMap((entry) => entry.toolCallIds ?? []);
	const toolResults = sessionProjection.flatMap((entry) => entry.toolCallId ? [entry.toolCallId] : []);
	assert.deepEqual(toolResults, assistantCalls, "tool call/result IDs must correlate in session order");
	assert.equal(readFileSync(sessionPath, "utf8").includes("reasoning_content\":\""), false, "redacted session must not persist reasoning_content text");
	journal("run_completed", { status: verification.status });
	const outcome = {
		variant: options.variant,
		runId,
		sessionId,
		initialVerification,
		finalVerification: verification,
		recoveryTriggered: options.variant === "candidate" && initialVerification.status === "failed",
		counters,
		toolMutations,
		reasoningRecords,
		sessionProjection,
		finalWorkspaceDigest: treeDigest(options.workspace),
		finalSourceSha256: sha256(readFileSync(resolve(options.workspace, "src/parse-duration.ts"))),
	};
	writeJson(resolve(evidenceRoot, "outcomes", `${options.variant}.json`), outcome);
	return outcome;
}

function scanForSecret(roots: string[]) {
	if (secret.length === 0) throw new G005ExecutionError("evidence", "credential disappeared before secret scan");
	const needle = Buffer.from(secret, "utf8");
	let filesScanned = 0;
	const matches: string[] = [];
	const visit = (root: string, current = root) => {
		for (const entry of readdirSync(current, { withFileTypes: true })) {
			const path = resolve(current, entry.name);
			if (entry.isDirectory()) visit(root, path);
			else if (entry.isFile()) {
				filesScanned += 1;
				if (readFileSync(path).includes(needle)) matches.push(relative(projectRoot, path).replaceAll("\\", "/"));
			}
		}
	};
	for (const root of roots) if (existsSync(root)) visit(root);
	return { filesScanned, matchCount: matches.length, matches };
}

async function main() {
	if (secret.trim().length === 0) throw new G005ExecutionError("external_service", "credential_configured=false");
	const fixture = resolve(projectRoot, "spikes/pi-runtime/g005/fixtures/parse-duration");
	const baselineWorkspace = resolve(projectRoot, ".runs/g005/workspaces/baseline");
	const candidateWorkspace = resolve(projectRoot, ".runs/g005/workspaces/candidate");
	resetWorkspace(fixture, baselineWorkspace);
	resetWorkspace(fixture, candidateWorkspace);
	const baselineDigest = treeDigest(baselineWorkspace);
	const candidateDigest = treeDigest(candidateWorkspace);
	assert.equal(baselineDigest, candidateDigest, "paired workspaces are not byte-equivalent");
	const checkedAt = new Date().toISOString();
	const baselineManifest = createManifest("baseline", baselineWorkspace, baselineDigest, checkedAt);
	const candidateManifest = createManifest("candidate", candidateWorkspace, candidateDigest, checkedAt);
	const normalize = (manifest: ReturnType<typeof createManifest>) => ({
		...manifest,
		runIdentity: { runId: "<run>", policyVariant: "<variant>", workspace: "<workspace>" },
	});
	assert.equal(canonical(normalize(baselineManifest)), canonical(normalize(candidateManifest)), "paired manifests differ outside identity fields");
	writeJson(resolve(evidenceRoot, "manifests", "baseline-initial.json"), baselineManifest);
	writeJson(resolve(evidenceRoot, "manifests", "candidate-initial.json"), candidateManifest);
	writeJson(resolve(evidenceRoot, "manifests", "pair.json"), {
		attempt: "g005-paired-attempt-001",
		baselineDigest,
		candidateDigest,
		configurationEquivalent: true,
		providerCallsAtWrite: 0,
	});

	const goalClock = { firstProviderAt: null as number | null };
	const baseline = await runVariant({ variant: "baseline", workspace: baselineWorkspace, manifest: baselineManifest, goalClock });
	const candidate = await runVariant({ variant: "candidate", workspace: candidateWorkspace, manifest: candidateManifest, goalClock });
	const scan = scanForSecret([
		resolve(projectRoot, "spikes/pi-runtime/g005"),
		resolve(projectRoot, ".runs/g005/evidence"),
		resolve(projectRoot, ".runs/g005/workspaces"),
	]);
	assert.equal(scan.matchCount, 0, "secret scan found credential bytes in G005 artifacts");
	writeJson(resolve(evidenceRoot, "security", "secret-scan.json"), scan);
	const totalProviderRequests = baseline.counters.initial.providerRequests + candidate.counters.initial.providerRequests + candidate.counters.verification_recovery.providerRequests;
	const gateSummary = {
		gateA: "passed",
		gateB: "passed",
		gateC: "passed",
		gateD: "passed",
		gateE: "passed",
		disposition: "PASS_REAL_MODEL_FEASIBILITY",
		attemptCount: 1,
		modelCount: 1,
		totalProviderRequests,
		baselineInitial: baseline.initialVerification.status,
		baselineFinal: baseline.finalVerification.status,
		candidateInitial: candidate.initialVerification.status,
		candidateFinal: candidate.finalVerification.status,
		candidateRecoveryTriggered: candidate.recoveryTriggered,
		goalDurationAfterFirstProviderMs: goalClock.firstProviderAt === null ? 0 : Date.now() - goalClock.firstProviderAt,
		secretScanMatches: scan.matchCount,
	};
	writeJson(resolve(evidenceRoot, "gates", "gate-summary.json"), gateSummary);
	writeJson(resolve(evidenceRoot, "outcomes", "pair.json"), { baseline, candidate, gateSummary });
	console.log(JSON.stringify(gateSummary));
}

main().catch((error) => {
	const classified = error instanceof G005ExecutionError ? error : new G005ExecutionError("evidence", safeErrorText(error));
	const disposition = classified.classification === "external_service"
		? "BLOCKED_G005_SETUP_OR_EXTERNAL_SERVICE"
		: classified.classification === "route"
			? "FAIL_REAL_MODEL_ROUTE"
			: "INVALID_G005_EVIDENCE";
	writeJson(resolve(evidenceRoot, "outcomes", "execution-failure.json"), {
		timestamp: new Date().toISOString(),
		disposition,
		classification: classified.classification,
		message: safeErrorText(classified),
	});
	console.error(JSON.stringify({ disposition, classification: classified.classification, message: safeErrorText(classified) }));
	process.exitCode = 1;
});
