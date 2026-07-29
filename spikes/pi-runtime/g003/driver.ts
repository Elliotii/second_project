import { createHash } from "node:crypto";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	createModels,
	fauxAssistantMessage,
	fauxProvider,
	fauxToolCall,
	Type,
} from "@earendil-works/pi-ai";
import {
	AgentHarness,
	type AgentHarnessEvent,
	type AgentHarnessTool,
	JsonlSessionRepo,
	type SessionTreeEntry,
} from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";

const PROJECT_COMMIT = "3723626a63bae69b3932f2ef48f54de2235b5460";
const PI_COMMIT = "027a5847901b5dde30270abaa1041046cd2b4b55";
const ARTIFACT_INTEGRITY =
	"sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A==";
const SYSTEM_PROMPT = "Use only the active write_result tool. Follow the user request, then finish.";
const INITIAL_PROMPT = "Write the requested task value to answer.txt, then finish.";
const EXPECTED_OUTPUT = "verified\n";
const RECOVERY_PROMPT = JSON.stringify({
	type: "verifier_failure",
	verifier: "g003-exact-answer-v1",
	assertion: "answer.txt bytes must equal UTF-8 verified\\n",
	observed: "mismatch",
	instruction: "Repair answer.txt using write_result, then finish.",
});
const STREAM_OPTIONS = { timeoutMs: 15_000, maxRetries: 0, maxRetryDelayMs: 0, cacheRetention: "none" as const };
const SCRIPT = [
	{ kind: "tool", toolCallId: "g003-initial-write", value: "incorrect\n" },
	{ kind: "final", text: "Initial task complete." },
	{ kind: "tool", toolCallId: "g003-recovery-write", value: EXPECTED_OUTPUT },
	{ kind: "final", text: "Recovery task complete." },
] as const;
const WRITE_PARAMETERS = Type.Object({ value: Type.String() }, { additionalProperties: false });
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

type Variant = "baseline" | "candidate";
type ToolContext = { env: NodeExecutionEnv };
type JournalEntry = {
	seq: number;
	type: string;
	runId: string;
	sessionId: string;
	cycle?: "initial" | "verification_recovery";
	toolCallId?: string;
	toolName?: string;
	status?: "failed" | "passed";
	decision?: string;
	isError?: boolean;
};
type SessionProjectionEntry = {
	entryId: string;
	parentId: string | null;
	role: string;
	toolCallIds?: string[];
	toolCallId?: string;
};

function sha256(value: string | Uint8Array): string {
	return createHash("sha256").update(value).digest("hex");
}

function canonical(value: unknown): string {
	if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
	if (value && typeof value === "object") {
		return `{${Object.entries(value)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`)
			.join(",")}}`;
	}
	return JSON.stringify(value);
}

function listFiles(root: string, current = root): string[] {
	return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
		const path = resolve(current, entry.name);
		if (entry.isDirectory()) return listFiles(root, path);
		if (!entry.isFile()) throw new Error(`fixture contains non-regular entry: ${path}`);
		return [relative(root, path).replaceAll("\\", "/")];
	});
}

function treeInventory(root: string) {
	return listFiles(root)
		.sort()
		.map((path) => {
			const bytes = readFileSync(resolve(root, path));
			return { path, size: bytes.length, sha256: sha256(bytes) };
		});
}

function resetWorkspace(source: string, target: string): void {
	if (existsSync(target)) throw new Error(`workspace already exists: ${target}`);
	mkdirSync(target, { recursive: true });
	cpSync(source, target, { recursive: true, errorOnExist: true, force: false });
}

function buildResponses() {
	return SCRIPT.map((step) =>
		step.kind === "tool"
			? fauxAssistantMessage(fauxToolCall("write_result", { value: step.value }, { id: step.toolCallId }), {
					stopReason: "toolUse",
				})
			: fauxAssistantMessage(step.text),
	);
}

function createWriteTool(): AgentHarnessTool<ToolContext, typeof WRITE_PARAMETERS, { path: string; sha256: string }> {
	return {
		name: "write_result",
		label: "Write result",
		description: "Write the exact requested UTF-8 value to the sole allowed output file answer.txt.",
		parameters: WRITE_PARAMETERS,
		executionMode: "sequential",
		execute: async (_toolCallId, params, signal, _onUpdate, context) => {
			const result = await context.env.writeFile("answer.txt", params.value, signal);
			if (!result.ok) throw result.error;
			return {
				content: [{ type: "text", text: "answer.txt written" }],
				details: { path: "answer.txt", sha256: sha256(params.value) },
			};
		},
	};
}

function verify(workspace: string) {
	const outputPath = resolve(workspace, "answer.txt");
	const observed = existsSync(outputPath) && statSync(outputPath).isFile() ? readFileSync(outputPath) : Buffer.alloc(0);
	const expected = Buffer.from(EXPECTED_OUTPUT, "utf8");
	return {
		status: observed.equals(expected) ? ("passed" as const) : ("failed" as const),
		observedSha256: sha256(observed),
		expectedSha256: sha256(expected),
	};
}

async function within<T>(label: string, promise: Promise<T>, harness: AgentHarness<ToolContext>): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		return await Promise.race([
			promise,
			new Promise<T>((_resolvePromise, reject) => {
				timer = setTimeout(() => reject(new Error(`${label} timed out after 15000 ms`)), 15_000);
			}),
		]);
	} catch (error) {
		await harness.abort();
		throw error;
	} finally {
		if (timer) clearTimeout(timer);
	}
}

function projectSession(entries: SessionTreeEntry[]): SessionProjectionEntry[] {
	const projected: SessionProjectionEntry[] = [];
	for (const entry of entries) {
		if (entry.type !== "message") continue;
		const message = entry.message;
		if (message.role === "assistant") {
			const toolCalls = message.content.filter((content) => content.type === "toolCall");
			projected.push({
				entryId: entry.id,
				parentId: entry.parentId,
				role: message.role,
				toolCallIds: toolCalls.map((call) => call.id),
			});
			continue;
		}
		if (message.role === "toolResult") {
			projected.push({
				entryId: entry.id,
				parentId: entry.parentId,
				role: message.role,
				toolCallId: message.toolCallId,
			});
			continue;
		}
		projected.push({ entryId: entry.id, parentId: entry.parentId, role: message.role });
	}
	return projected;
}

function assertSessionOrder(variant: Variant, projected: ReturnType<typeof projectSession>): void {
	const expectedRoles =
		variant === "baseline"
			? ["user", "assistant", "toolResult", "assistant"]
			: ["user", "assistant", "toolResult", "assistant", "user", "assistant", "toolResult", "assistant"];
	const actualRoles = projected.map((entry) => entry.role);
	if (canonical(actualRoles) !== canonical(expectedRoles)) {
		throw new Error(`${variant} session order mismatch: ${JSON.stringify(actualRoles)}`);
	}
	for (let index = 1; index < projected.length; index += 1) {
		if (projected[index]?.parentId !== projected[index - 1]?.entryId) {
			throw new Error(`${variant} session branch is not a single parent-linked chain`);
		}
	}
	const expectedCalls = variant === "baseline" ? ["g003-initial-write"] : ["g003-initial-write", "g003-recovery-write"];
	const assistantCalls = projected.flatMap((entry) => ("toolCallIds" in entry ? entry.toolCallIds : []));
	const resultCalls = projected.flatMap((entry) => ("toolCallId" in entry ? [entry.toolCallId] : []));
	if (canonical(assistantCalls) !== canonical(expectedCalls) || canonical(resultCalls) !== canonical(expectedCalls)) {
		throw new Error(`${variant} session tool-call correlation mismatch`);
	}
}

function expectedJournalTypes(variant: Variant): string[] {
	const initial = [
		"run_started",
		"session_linked",
		"agent_cycle_started",
		"tool_execution_start",
		"tool_execution_end",
		"agent_settled",
		"verifier_started",
		"verifier_completed",
		"policy_decision",
	];
	return variant === "baseline"
		? [...initial, "run_completed"]
		: [
				...initial,
				"continuation_queued",
				"agent_cycle_started",
				"tool_execution_start",
				"tool_execution_end",
				"agent_settled",
				"verifier_started",
				"verifier_completed",
				"run_completed",
			];
}

async function runVariant(variant: Variant, workspace: string, manifest: Record<string, unknown>) {
	const runId = `g003-${variant}`;
	const env = new NodeExecutionEnv({ cwd: workspace, shellEnv: {} });
	const repo = new JsonlSessionRepo({
		fs: env,
		sessionsRoot: resolve(projectRoot, ".runs/g003/evidence/sessions", variant),
	});
	const session = await repo.create({
		cwd: workspace,
		id: `g003-${variant}-session`,
		metadata: { run_id: runId, policy_variant: variant },
	});
	const sessionMetadata = await session.getMetadata();
	const models = createModels();
	const faux = fauxProvider({
		api: "faux",
		provider: "g003-faux",
		models: [{ id: "g003-faux-model", name: "G003 Faux", reasoning: false }],
	});
	models.setProvider(faux.provider);
	faux.setResponses(buildResponses());
	const harness = new AgentHarness({
		models,
		session,
		model: faux.getModel(),
		thinkingLevel: "off",
		systemPrompt: SYSTEM_PROMPT,
		tools: [createWriteTool()],
		activeToolNames: ["write_result"],
		toolContext: { env },
		streamOptions: STREAM_OPTIONS,
	});
	const journal: JournalEntry[] = [];
	let cycle: "initial" | "verification_recovery" = "initial";
	const add = (type: string, fields: Partial<JournalEntry> = {}) => {
		journal.push({ seq: journal.length + 1, type, runId, sessionId: sessionMetadata.id, ...fields });
	};
	add("run_started");
	add("session_linked");
	harness.subscribe((event: AgentHarnessEvent) => {
		if (event.type === "tool_execution_start") {
			add("tool_execution_start", { cycle, toolCallId: event.toolCallId, toolName: event.toolName });
		} else if (event.type === "tool_execution_end") {
			add("tool_execution_end", {
				cycle,
				toolCallId: event.toolCallId,
				toolName: event.toolName,
				isError: event.isError,
			});
		} else if (event.type === "settled") {
			add("agent_settled", { cycle });
		}
	});

	let promptCount = 0;
	let verifierCount = 0;
	add("agent_cycle_started", { cycle });
	promptCount += 1;
	await within("initial prompt", harness.prompt(INITIAL_PROMPT), harness);
	add("verifier_started", { cycle });
	verifierCount += 1;
	const initialVerification = verify(workspace);
	add("verifier_completed", { cycle, status: initialVerification.status });
	if (initialVerification.status !== "failed") throw new Error(`${variant} initial verifier unexpectedly passed`);
	add("policy_decision", { cycle, decision: variant === "baseline" ? "stop_after_failure" : "queue_one_recovery" });

	let finalVerification = initialVerification;
	if (variant === "candidate") {
		add("continuation_queued", { cycle: "verification_recovery" });
		cycle = "verification_recovery";
		add("agent_cycle_started", { cycle });
		promptCount += 1;
		await within("recovery prompt", harness.prompt(RECOVERY_PROMPT), harness);
		if ((await session.getMetadata()).id !== sessionMetadata.id) throw new Error("candidate session id changed");
		add("verifier_started", { cycle });
		verifierCount += 1;
		finalVerification = verify(workspace);
		add("verifier_completed", { cycle, status: finalVerification.status });
		if (finalVerification.status !== "passed") throw new Error("candidate recovery verifier did not pass");
	}
	add("run_completed", { status: finalVerification.status });

	const expectedCalls = variant === "baseline" ? 2 : 4;
	const expectedPrompts = variant === "baseline" ? 1 : 2;
	const expectedVerifiers = variant === "baseline" ? 1 : 2;
	if (faux.state.callCount !== expectedCalls) throw new Error(`${variant} provider calls: ${faux.state.callCount}`);
	if (promptCount !== expectedPrompts) throw new Error(`${variant} prompt calls: ${promptCount}`);
	if (verifierCount !== expectedVerifiers) throw new Error(`${variant} verifier calls: ${verifierCount}`);
	if (variant === "baseline" && faux.getPendingResponseCount() !== 2) {
		throw new Error("baseline did not leave exactly two recovery responses unused");
	}
	if (variant === "candidate" && faux.getPendingResponseCount() !== 0) {
		throw new Error("candidate did not consume exactly the complete four-step script");
	}
	const actualTypes = journal.map((entry) => entry.type);
	if (canonical(actualTypes) !== canonical(expectedJournalTypes(variant))) {
		throw new Error(`${variant} journal order mismatch: ${JSON.stringify(actualTypes)}`);
	}
	if (journal.some((entry) => entry.runId !== runId || entry.sessionId !== sessionMetadata.id)) {
		throw new Error(`${variant} journal correlation id drift`);
	}

	const sessionProjection = projectSession(await session.getEntries());
	assertSessionOrder(variant, sessionProjection);
	await env.cleanup();
	return {
		variant,
		runId,
		sessionId: sessionMetadata.id,
		providerCallCount: faux.state.callCount,
		promptCount,
		verifierCount,
		initialVerification,
		finalVerification,
		journal,
		sessionProjection,
		manifest,
	};
}

function createManifest(variant: Variant, workspace: string, fixtureDigest: string) {
	const manifestBytes = readFileSync(resolve(projectRoot, ".runs/g003/evidence/model-data-manifest.json"));
	return {
		schemaVersion: 1,
		runIdentity: { runId: `g003-${variant}`, policyVariant: variant, workspace },
		projectCommit: PROJECT_COMMIT,
		piCommit: PI_COMMIT,
		modelDataArtifact: { version: "0.82.1", integrity: ARTIFACT_INTEGRITY, restoredManifestSha256: sha256(manifestBytes) },
		fixture: { treeDigest: fixtureDigest, allowedOutput: "answer.txt" },
		faux: {
			provider: "g003-faux",
			api: "faux",
			model: "g003-faux-model",
			completeScript: SCRIPT,
			scriptDigest: sha256(canonical(SCRIPT)),
		},
		thinkingLevel: "off",
		systemPromptDigest: sha256(SYSTEM_PROMPT),
		initialPromptDigest: sha256(INITIAL_PROMPT),
		recoveryPromptDigest: sha256(RECOVERY_PROMPT),
		tools: [{ name: "write_result", parameters: WRITE_PARAMETERS, active: true }],
		streamOptions: STREAM_OPTIONS,
		environment: { allowedKeyNames: [], relevantValues: {} },
		verifier: {
			id: "g003-exact-answer-v1",
			assertionDigest: sha256("answer.txt bytes equal UTF-8 verified\\n"),
		},
	};
}

export async function runGates() {
	const fixtureSource = resolve(projectRoot, "fixtures/tasks/g003-completion-recovery/initial");
	const baselineWorkspace = resolve(projectRoot, ".runs/g003/workspaces/baseline");
	const candidateWorkspace = resolve(projectRoot, ".runs/g003/workspaces/candidate");
	resetWorkspace(fixtureSource, baselineWorkspace);
	resetWorkspace(fixtureSource, candidateWorkspace);
	const baselineInventory = treeInventory(baselineWorkspace);
	const candidateInventory = treeInventory(candidateWorkspace);
	const baselineDigest = sha256(canonical(baselineInventory));
	const candidateDigest = sha256(canonical(candidateInventory));
	if (baselineDigest !== candidateDigest) throw new Error("reset workspaces are not byte-equivalent");

	const baselineManifest = createManifest("baseline", baselineWorkspace, baselineDigest);
	const candidateManifest = createManifest("candidate", candidateWorkspace, candidateDigest);
	const normalize = (manifest: ReturnType<typeof createManifest>) => ({
		...manifest,
		runIdentity: { runId: "<run>", policyVariant: "<policy>", workspace: "<workspace>" },
	});
	if (canonical(normalize(baselineManifest)) !== canonical(normalize(candidateManifest))) {
		throw new Error("normalized initial manifests differ outside permitted fields");
	}

	const gateRoot = resolve(projectRoot, ".runs/g003/evidence/gates");
	mkdirSync(gateRoot, { recursive: false });
	writeFileSync(resolve(gateRoot, "baseline-initial-manifest.json"), `${JSON.stringify(baselineManifest, null, 2)}\n`);
	writeFileSync(resolve(gateRoot, "candidate-initial-manifest.json"), `${JSON.stringify(candidateManifest, null, 2)}\n`);
	const baseline = await runVariant("baseline", baselineWorkspace, baselineManifest);
	const candidate = await runVariant("candidate", candidateWorkspace, candidateManifest);
	writeFileSync(resolve(gateRoot, "baseline-run.json"), `${JSON.stringify(baseline, null, 2)}\n`);
	writeFileSync(resolve(gateRoot, "candidate-run.json"), `${JSON.stringify(candidate, null, 2)}\n`);
	writeFileSync(
		resolve(gateRoot, "gate-summary.json"),
		`${JSON.stringify({ gateB: "pass", gateC: "pass", gateD: "pass", gateE: "pass", baselineDigest, candidateDigest }, null, 2)}\n`,
	);
	return { baseline, candidate, baselineDigest, candidateDigest };
}
