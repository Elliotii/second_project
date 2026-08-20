import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import type { ArtifactRefV0B } from "./contracts/v0b-types.ts";
import type { CandidateModeV2A, CandidatePathV2A, CandidatePreVerifierCheckpointV2A, ProviderReservationLedgerV2A } from "./contracts/v2-types.ts";
import type { ControlledSeedProvenanceV2 } from "./run-v2.ts";
import {
	V2B_ATTEMPT_CAPS,
	V2B_CONTROL_BASELINE_COMMIT,
	V2B_CONTROL_BASELINE_TREE,
	V2B_CREDENTIAL_PROFILE,
	V2B_FROZEN_CASES,
	V2B_GROUP_CAPS,
	V2B_MODEL_PROFILE_ID,
	V2B_PINNED_PI_COMMIT,
	V2B_POLICY_ID,
	V2B_SEQUENCE_CAPS,
	V2B_SKILL_ID,
	V2B_TOOL_PROFILE_ID,
	type AttemptRuntimeEvidenceV2B,
	type CasePauseV2B,
	type CaseIdV2B,
	type ExecutionManifestV2B,
	type PlannedCaseV2B,
	type RealCallCountersV2B,
	type RunManifestV2B,
	type RunTerminalV2B,
	type SequenceLedgerEntryV2B,
	type SequenceTerminalV2B,
	type Stage2PreflightV2B,
	type UsageV2B,
} from "./contracts/v2b-types.ts";
import { artifactRef, writeOnceBytes, writeOnceJson } from "./evidence/artifacts.ts";
import { digestObject, stableJson, treeInventory } from "./hash.ts";
import {
	assertZeroRealAccessV2B,
	createStage1ExecutionAuthorityV2B,
	createStage1RealShapedExecutionPortV2B,
} from "./pi/pi-run-handle-v2b.ts";
import { executeRunV2A } from "./run-v2.ts";
import type { ExecutionPortV2 } from "./run-v2.ts";

export interface Stage1ScenarioV2B {
	caseId: CaseIdV2B;
	primaryMode: "pass" | "fail";
	candidateModes?: readonly [CandidateModeV2A, CandidateModeV2A];
	usageInvalidRole?: "primary" | "continue_failed_session" | "fresh_session_from_failure_seed";
	usageOverflow?: { role: "primary" | "continue_failed_session" | "fresh_session_from_failure_seed"; kind: "tokens" | "cost" };
	toolCapRole?: "primary" | "continue_failed_session" | "fresh_session_from_failure_seed";
	controlledSeed?: true;
}

export const V2B_STAGE1_SCENARIOS: Readonly<Record<string, Stage1ScenarioV2B>> = Object.freeze({
	negative_initial_pass: { caseId: "negative", primaryMode: "pass" },
	positive_a_selected: { caseId: "primary_positive", primaryMode: "fail", candidateModes: ["pass", "fail"] },
	positive_b_selected: { caseId: "primary_positive", primaryMode: "fail", candidateModes: ["fail", "pass"] },
	positive_none: { caseId: "primary_positive", primaryMode: "fail", candidateModes: ["fail", "fail"] },
	positive_a_budget_b_selected: { caseId: "primary_positive", primaryMode: "fail", candidateModes: ["budget_stop", "pass"] },
	positive_a_usage_invalid_b_selected: { caseId: "primary_positive", primaryMode: "fail", candidateModes: ["pass", "pass"], usageInvalidRole: "continue_failed_session" },
	positive_a_token_overflow_b_selected: { caseId: "primary_positive", primaryMode: "fail", candidateModes: ["pass", "pass"], usageOverflow: { role: "continue_failed_session", kind: "tokens" } },
	positive_a_cost_overflow_b_selected: { caseId: "primary_positive", primaryMode: "fail", candidateModes: ["pass", "pass"], usageOverflow: { role: "continue_failed_session", kind: "cost" } },
	positive_a_tool_cap_b_selected: { caseId: "primary_positive", primaryMode: "fail", candidateModes: ["pass", "pass"], toolCapRole: "continue_failed_session" },
	r2_controlled_a_selected: { caseId: "primary_positive", primaryMode: "pass", candidateModes: ["pass", "fail"], controlledSeed: true },
	r2_controlled_b_selected: { caseId: "primary_positive", primaryMode: "pass", candidateModes: ["fail", "pass"], controlledSeed: true },
	r2_controlled_both_selected: { caseId: "primary_positive", primaryMode: "pass", candidateModes: ["pass", "pass"], controlledSeed: true },
	r2_controlled_none: { caseId: "primary_positive", primaryMode: "pass", candidateModes: ["fail", "fail"], controlledSeed: true },
	r2_controlled_a_budget_b_selected: { caseId: "primary_positive", primaryMode: "pass", candidateModes: ["budget_stop", "pass"], controlledSeed: true },
});

export interface PriorCaseTerminalV2B {
	caseId: CaseIdV2B;
	outcome: "initial_pass" | "recovery_selected" | "recovery_none" | "pre_dispatch_stop" | "post_dispatch_invalid";
	evidenceIdentityValid: boolean;
	providerRequests: number;
}

export function assertCaseActivationV2B(caseId: CaseIdV2B, prior: readonly PriorCaseTerminalV2B[]): void {
	if (prior.some((entry) => entry.caseId === caseId)) throw new Error("V2-B Case repetition/replacement rejected");
	if (caseId !== "contingency_positive") return;
	const primary = prior.find((entry) => entry.caseId === "primary_positive");
	const allowed = primary?.evidenceIdentityValid === true && (
		primary.outcome === "initial_pass" ||
		(primary.outcome === "pre_dispatch_stop" && primary.providerRequests === 0)
	);
	if (!allowed) throw new Error("V2-B Contingency activation rejected");
}

function emptyUsage(): UsageV2B {
	return {
		provider_requests: 0,
		tool_calls: 0,
		input_tokens: 0,
		output_tokens: 0,
		cache_read_tokens: 0,
		cache_write_tokens: 0,
		conservative_charged_tokens: 0,
		tokens: 0,
		active_execution_time_ms: 0,
		verifier_runs: 0,
		real_cost_usd: 0,
		conservative_charged_cost_usd: 0,
	};
}

function addUsage(target: UsageV2B, source: UsageV2B): void {
	for (const key of Object.keys(target) as Array<keyof UsageV2B>) target[key] += source[key];
}

function zeroCounters(): RealCallCountersV2B {
	return { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 };
}

function sourceInventoryRef(projectRoot: string, runRoot: string): { ref: ArtifactRefV0B; digest: string } {
	const inventory = treeInventory(resolve(projectRoot, "workbench/src"));
	const value = {
		schema_version: "v2b-source-inventory-v1",
		scope: "workbench/src",
		digest: digestObject(inventory),
		inventory,
	};
	return { ref: writeOnceJson(runRoot, "config/workbench-source.json", value), digest: value.digest };
}

function manifestFor(options: {
	runId: string;
	caseId: CaseIdV2B;
	workbenchSourceRef: ArtifactRefV0B;
	workbenchSourceDigest: string;
	stage: "stage1_zero_real_access" | "stage2_deterministic_proof" | "stage2_real";
	executionManifest?: ExecutionManifestV2B;
}): RunManifestV2B {
	const selectedCase = V2B_FROZEN_CASES.find((candidate) => candidate.case_id === options.caseId);
	if (!selectedCase) throw new Error("V2-B frozen Case is unavailable");
	const body = {
		schema_version: "v2b-run-manifest-v3" as const,
		run_id: options.runId,
		case: structuredClone(selectedCase),
		stage: options.stage,
		control_baseline_commit: V2B_CONTROL_BASELINE_COMMIT,
		control_baseline_tree: V2B_CONTROL_BASELINE_TREE,
		pi_commit: V2B_PINNED_PI_COMMIT,
		provider_profile_id: V2B_MODEL_PROFILE_ID,
		credential_profile_name: V2B_CREDENTIAL_PROFILE,
		skill_id: V2B_SKILL_ID,
		tool_profile_id: V2B_TOOL_PROFILE_ID,
		policy_id: V2B_POLICY_ID,
		workbench_source_ref: options.workbenchSourceRef,
		workbench_source_digest: options.workbenchSourceDigest,
		execution_manifest_id: options.executionManifest?.manifest_id ?? null,
		execution_baseline_commit: options.executionManifest?.execution_baseline_commit ?? null,
		execution_baseline_tree: options.executionManifest?.execution_baseline_tree ?? null,
		all_cases: structuredClone(V2B_FROZEN_CASES),
		budgets: {
			attempt: structuredClone(V2B_ATTEMPT_CAPS),
			group: structuredClone(V2B_GROUP_CAPS),
			sequence: structuredClone(V2B_SEQUENCE_CAPS),
		},
		real_execution_authorized: options.stage === "stage2_real",
		deterministic_stub_required: options.stage !== "stage2_real",
		retry: false as const,
		fallback: false as const,
		replacement: false as const,
	};
	return { ...body, manifest_id: digestObject(body) };
}

async function executeCaseRunV2B(options: {
	projectRoot: string;
	runRoot: string;
	runId: string;
	scenario: Stage1ScenarioV2B;
	stage: "stage1_zero_real_access" | "stage2_deterministic_proof" | "stage2_real";
	executionManifest?: ExecutionManifestV2B;
	executionPort?: ExecutionPortV2;
	realCounters?: RealCallCountersV2B;
	attemptEvidence?: AttemptRuntimeEvidenceV2B[];
	onAttemptStarted?: (input: { attemptId: string; role: AttemptRuntimeEvidenceV2B["role"] }) => void;
}): Promise<RunTerminalV2B> {
	if (existsSync(options.runRoot)) throw new Error("V2-B Run root already exists");
	mkdirSync(resolve(options.runRoot, "config"), { recursive: true });
	const source = sourceInventoryRef(options.projectRoot, options.runRoot);
	const manifest = manifestFor({ runId: options.runId, caseId: options.scenario.caseId, workbenchSourceRef: source.ref, workbenchSourceDigest: source.digest, stage: options.stage, ...(options.executionManifest ? { executionManifest: options.executionManifest } : {}) });
	writeOnceJson(options.runRoot, "config/manifest.json", manifest);
	const attempts: AttemptRuntimeEvidenceV2B[] = options.attemptEvidence ?? [];
	const counters = options.realCounters ?? zeroCounters();
	const port = options.executionPort ?? createStage1RealShapedExecutionPortV2B({
		authority: createStage1ExecutionAuthorityV2B({ runId: options.runId, caseId: options.scenario.caseId, authorized: true }),
		onAttemptEvidence: (evidence) => attempts.push(structuredClone(evidence)),
		...(options.scenario.usageInvalidRole ? { usageInvalidRole: options.scenario.usageInvalidRole } : {}),
		...(options.scenario.usageOverflow ? { usageOverflow: options.scenario.usageOverflow } : {}),
		...(options.scenario.toolCapRole ? { toolCapRole: options.scenario.toolCapRole } : {}),
		...(options.onAttemptStarted ? { onAttemptStarted: options.onAttemptStarted } : {}),
	});
	let controlledPrimaryPort: ExecutionPortV2 | null = null;
	let controlledSeedProvenance: ControlledSeedProvenanceV2 | undefined;
	let controlledSeedPatch: string | undefined;
	if (options.scenario.controlledSeed) {
		const provenancePath = resolve(options.projectRoot, "fixtures/recovery/v2b-r2/provenance.json");
		controlledSeedProvenance = JSON.parse(readFileSync(provenancePath, "utf8")) as ControlledSeedProvenanceV2;
		controlledSeedPatch = readFileSync(resolve(options.projectRoot, controlledSeedProvenance.fixture_ref), "utf8");
		controlledPrimaryPort = createStage1RealShapedExecutionPortV2B({
			authority: createStage1ExecutionAuthorityV2B({ runId: options.runId, caseId: options.scenario.caseId, authorized: true }),
			onAttemptEvidence: (evidence) => attempts.push(structuredClone(evidence)),
			...(options.onAttemptStarted ? { onAttemptStarted: options.onAttemptStarted } : {}),
		});
	}
	const substrateRoot = resolve(options.runRoot, "substrate");
	let substrate;
	try {
		substrate = await executeRunV2A({
			projectRoot: options.projectRoot,
			runRoot: substrateRoot,
			runId: options.runId,
			taskId: manifest.case.task_id,
			primaryMode: options.scenario.primaryMode,
			...(options.scenario.candidateModes ? { candidateModes: options.scenario.candidateModes } : {}),
			executionPort: port,
			...(controlledPrimaryPort ? { primaryExecutionPort: controlledPrimaryPort, candidateExecutionPort: port } : {}),
			...(controlledSeedPatch ? { primaryPatch: controlledSeedPatch } : {}),
			...(controlledSeedProvenance ? { controlledSeedProvenance } : {}),
		realExecutionAuthorized: options.stage === "stage2_real",
			realCallCounters: counters,
		});
	} finally {
		await controlledPrimaryPort?.close?.();
		await port.close?.();
	}
	const expectedAttempts = substrate.outcome === "initial_pass" ? 1 : 3;
	if (attempts.length !== expectedAttempts) throw new Error("V2-B runtime evidence Attempt count mismatch");
	const attemptRefs: ArtifactRefV0B[] = [];
	const usage = emptyUsage();
	const substrateCandidates = substrate.candidate_refs.map((ref) => JSON.parse(readFileSync(resolve(substrateRoot, ref.path), "utf8")) as CandidatePathV2A);
	for (const [index, attempt] of attempts.entries()) {
		attempt.usage.verifier_runs = 1;
		if (attempt.agent_completion === "pre_dispatch_budget_terminal") {
			const candidate = substrateCandidates.find((entry) => entry.attempt_id === attempt.attempt_id);
			if (!candidate?.pre_verifier_checkpoint_ref || candidate.quiescent_budget_terminal !== true || !attempt.runtime_budget_stop_observation) {
				throw new Error("V2-B budget terminal lacks Controller-derived pre-Verifier checkpoint");
			}
			const checkpoint = JSON.parse(readFileSync(resolve(substrateRoot, candidate.pre_verifier_checkpoint_ref.path), "utf8")) as CandidatePreVerifierCheckpointV2A;
			const reservationLedger = JSON.parse(readFileSync(resolve(substrateRoot, checkpoint.reservation_ledger_ref.path), "utf8")) as ProviderReservationLedgerV2A;
			if (stableJson(reservationLedger.reservations) !== stableJson(attempt.reservations)) throw new Error("V2-B Attempt reservation evidence differs from pre-Verifier ledger");
			attempt.quiescence = {
				pre_dispatch_refusal: true,
				pending_provider_responses: 0,
				pending_tool_calls: 0,
				pending_side_effects: 0,
				prior_usage_known: true,
				session_persisted: true,
				workspace_persisted: true,
				evidence_closed: true,
			};
		}
		if (options.stage === "stage1_zero_real_access") {
			assertZeroRealAccessV2B(attempt.counters_before);
			assertZeroRealAccessV2B(attempt.counters_after);
		}
		addUsage(usage, attempt.usage);
		attemptRefs.push(writeOnceJson(options.runRoot, `attempts/${String(index + 1).padStart(2, "0")}-${attempt.role}.json`, attempt));
	}
	if (
		usage.provider_requests > (substrate.outcome === "initial_pass" ? V2B_ATTEMPT_CAPS.provider_requests : V2B_GROUP_CAPS.provider_requests) ||
		usage.tool_calls > (substrate.outcome === "initial_pass" ? V2B_ATTEMPT_CAPS.tool_calls : V2B_GROUP_CAPS.tool_calls) ||
		usage.tokens > (substrate.outcome === "initial_pass" ? V2B_ATTEMPT_CAPS.tokens : V2B_GROUP_CAPS.tokens) ||
		usage.real_cost_usd > (substrate.outcome === "initial_pass" ? V2B_ATTEMPT_CAPS.real_cost_usd : V2B_GROUP_CAPS.real_cost_usd)
	) throw new Error("V2-B aggregate budget exceeded");
	const terminal: RunTerminalV2B = {
		schema_version: "v2b-run-terminal-v2",
		manifest_id: manifest.manifest_id,
		run_id: options.runId,
		case_id: manifest.case.case_id,
		substrate_root: "substrate",
		substrate_terminal_ref: artifactRef(options.runRoot, "substrate/terminal.json", "application/json", false),
		outcome: substrate.outcome,
		selected_candidate_id: substrate.selected_candidate_id,
		attempt_evidence_refs: attemptRefs,
		usage,
		real_call_counters: structuredClone(counters),
		terminal_reason: options.stage === "stage2_real" ? "stage2_real_completed" : options.stage === "stage2_deterministic_proof" ? "stage2_stub_completed" : "stage1_stub_completed",
	};
	writeOnceJson(options.runRoot, "terminal.json", terminal);
	return terminal;
}

export async function executeStage1RunV2B(options: {
	projectRoot: string;
	runRoot: string;
	runId: string;
	scenario: Stage1ScenarioV2B;
}): Promise<RunTerminalV2B> {
	return await executeCaseRunV2B({ ...options, stage: "stage1_zero_real_access" });
}

export interface ObservedStage2IdentityV2B {
	executionBaselineCommit: string;
	executionBaselineTree: string;
	piCommit: string;
	trackedClean: boolean;
	stagedClean: boolean;
}

export function buildExecutionManifestV2B(options: {
	projectRoot: string;
	sequenceId: string;
	executionBaselineCommit: string;
	executionBaselineTree: string;
	stage?: "stage2_deterministic_proof" | "stage2_real";
}): ExecutionManifestV2B {
	if (!/^[0-9a-f]{40}$/.test(options.executionBaselineCommit) || !/^[0-9a-f]{40}$/.test(options.executionBaselineTree)) throw new Error("V2-B Execution Baseline identity is malformed");
	const inventory = treeInventory(resolve(options.projectRoot, "workbench/src"));
	const plannedCases = V2B_FROZEN_CASES.map((entry, index) => ({
		...structuredClone(entry),
		ordinal: (index + 1) as 1 | 2 | 3,
		planned_run_id: `${options.sequenceId}-${entry.case_id}-run`,
	})) as PlannedCaseV2B[];
	const body = {
		schema_version: "v2b-execution-manifest-v2" as const,
		sequence_id: options.sequenceId,
		stage: options.stage ?? "stage2_real",
		execution_baseline_commit: options.executionBaselineCommit,
		execution_baseline_tree: options.executionBaselineTree,
		pi_commit: V2B_PINNED_PI_COMMIT,
		provider_profile_id: V2B_MODEL_PROFILE_ID,
		credential_profile_name: V2B_CREDENTIAL_PROFILE,
		skill_id: V2B_SKILL_ID,
		tool_profile_id: V2B_TOOL_PROFILE_ID,
		policy_id: V2B_POLICY_ID,
		workbench_source_digest: digestObject(inventory),
		workbench_source_inventory: inventory,
		planned_cases: plannedCases,
		budgets: { attempt: structuredClone(V2B_ATTEMPT_CAPS), group: structuredClone(V2B_GROUP_CAPS), sequence: structuredClone(V2B_SEQUENCE_CAPS) },
		real_execution_authorized: (options.stage ?? "stage2_real") === "stage2_real",
		retry: false as const,
		fallback: false as const,
		replacement: false as const,
	};
	return { ...body, manifest_id: digestObject(body) };
}

function observedIdentity(projectRoot: string): ObservedStage2IdentityV2B {
	const git = (args: string[], cwd = projectRoot): string => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
	return {
		executionBaselineCommit: git(["rev-parse", "HEAD"]),
		executionBaselineTree: git(["show", "-s", "--format=%T", "HEAD"]),
		piCommit: git(["rev-parse", "HEAD"], "D:/AI/AI_Projects/project2/.upstream/pi"),
		trackedClean: git(["status", "--porcelain", "--untracked-files=no"]) === "",
		stagedClean: git(["diff", "--cached", "--name-only"]) === "",
	};
}

export function preflightExecutionManifestV2B(options: {
	projectRoot: string;
	manifest: ExecutionManifestV2B;
	observedIdentity?: ObservedStage2IdentityV2B;
}): Stage2PreflightV2B {
	const manifest = options.manifest;
	const { manifest_id: manifestId, ...body } = manifest;
	const expectedCases = V2B_FROZEN_CASES.map((entry, index) => ({ ...entry, ordinal: index + 1, planned_run_id: `${manifest.sequence_id}-${entry.case_id}-run` }));
	if (
		manifest.schema_version !== "v2b-execution-manifest-v2" || digestObject(body) !== manifestId ||
		!["stage2_deterministic_proof", "stage2_real"].includes(manifest.stage) || manifest.pi_commit !== V2B_PINNED_PI_COMMIT ||
		manifest.provider_profile_id !== V2B_MODEL_PROFILE_ID || manifest.credential_profile_name !== V2B_CREDENTIAL_PROFILE ||
		manifest.skill_id !== V2B_SKILL_ID || manifest.tool_profile_id !== V2B_TOOL_PROFILE_ID || manifest.policy_id !== V2B_POLICY_ID ||
		stableJson(manifest.planned_cases) !== stableJson(expectedCases) ||
		stableJson(manifest.budgets) !== stableJson({ attempt: V2B_ATTEMPT_CAPS, group: V2B_GROUP_CAPS, sequence: V2B_SEQUENCE_CAPS }) ||
		manifest.real_execution_authorized !== (manifest.stage === "stage2_real") || manifest.retry !== false || manifest.fallback !== false || manifest.replacement !== false
	) throw new Error("V2-B Execution Manifest frozen identity mismatch");
	const liveInventory = treeInventory(resolve(options.projectRoot, "workbench/src"));
	if (stableJson(liveInventory) !== stableJson(manifest.workbench_source_inventory) || digestObject(liveInventory) !== manifest.workbench_source_digest) throw new Error("V2-B Execution Manifest source drift");
	const observed = options.observedIdentity ?? observedIdentity(options.projectRoot);
	if (
		observed.executionBaselineCommit !== manifest.execution_baseline_commit || observed.executionBaselineTree !== manifest.execution_baseline_tree ||
		observed.piCommit !== manifest.pi_commit || !observed.trackedClean || !observed.stagedClean
	) throw new Error("V2-B Gate H identity or cleanliness mismatch");
	return {
		schema_version: "v2b-stage2-preflight-v1",
		manifest_id: manifest.manifest_id,
		sequence_id: manifest.sequence_id,
		valid: true,
		execution_baseline_commit: manifest.execution_baseline_commit,
		execution_baseline_tree: manifest.execution_baseline_tree,
		workbench_source_digest: manifest.workbench_source_digest,
		pi_commit: V2B_PINNED_PI_COMMIT,
		real_call_counters: zeroCounters(),
	};
}

function reservedAttemptUsage(): UsageV2B {
	return {
		...emptyUsage(),
		provider_requests: V2B_ATTEMPT_CAPS.provider_requests,
		tool_calls: V2B_ATTEMPT_CAPS.tool_calls,
		tokens: V2B_ATTEMPT_CAPS.tokens,
		active_execution_time_ms: V2B_ATTEMPT_CAPS.active_execution_time_ms,
		verifier_runs: V2B_ATTEMPT_CAPS.verifier_runs,
		real_cost_usd: V2B_ATTEMPT_CAPS.real_cost_usd,
	};
}

function readLedger(sequenceRoot: string): SequenceLedgerEntryV2B[] {
	const path = resolve(sequenceRoot, "ledger.jsonl");
	if (!existsSync(path)) return [];
	const text = readFileSync(path, "utf8").trim();
	return text === "" ? [] : text.split(/\r?\n/).map((line) => JSON.parse(line) as SequenceLedgerEntryV2B);
}

function appendLedger(sequenceRoot: string, entry: Omit<SequenceLedgerEntryV2B, "schema_version" | "seq" | "timestamp" | "case_pause_ref"> & { case_pause_ref?: ArtifactRefV0B | null }): SequenceLedgerEntryV2B {
	const ledger = readLedger(sequenceRoot);
	const value: SequenceLedgerEntryV2B = { schema_version: "v2b-sequence-ledger-v1", seq: ledger.length + 1, timestamp: new Date().toISOString(), ...entry, case_pause_ref: entry.case_pause_ref ?? null };
	appendFileSync(resolve(sequenceRoot, "ledger.jsonl"), `${stableJson(value)}\n`, "utf8");
	return value;
}

function initializeSequence(sequenceRoot: string, manifest: ExecutionManifestV2B): void {
	if (existsSync(sequenceRoot)) throw new Error("V2-B Sequence root already exists");
	mkdirSync(sequenceRoot, { recursive: true });
	writeOnceJson(sequenceRoot, "manifest.json", manifest);
	writeOnceBytes(sequenceRoot, "ledger.jsonl", "");
	for (const planned of manifest.planned_cases) appendLedger(sequenceRoot, {
		manifest_id: manifest.manifest_id, sequence_id: manifest.sequence_id, case_id: planned.case_id,
		planned_run_id: planned.planned_run_id, state: "planned", reason: null, run_terminal_ref: null,
		attempt_id: null, attempt_role: null, reserved_usage: emptyUsage(), actual_usage: emptyUsage(), real_call_counters: zeroCounters(),
	});
}

function latestCaseStates(ledger: readonly SequenceLedgerEntryV2B[]): Map<CaseIdV2B, SequenceLedgerEntryV2B> {
	const result = new Map<CaseIdV2B, SequenceLedgerEntryV2B>();
	for (const entry of ledger) if (entry.attempt_id === null) result.set(entry.case_id, entry);
	return result;
}

function sumLedgerUsage(ledger: readonly SequenceLedgerEntryV2B[], field: "reserved_usage" | "actual_usage"): UsageV2B {
	const result = emptyUsage();
	for (const entry of ledger) addUsage(result, entry[field]);
	return result;
}

function sumTerminalCounters(ledger: readonly SequenceLedgerEntryV2B[]): RealCallCountersV2B {
	const result = zeroCounters();
	for (const entry of ledger) if (entry.attempt_id === null && (entry.state === "terminal" || entry.state === "paused")) for (const key of Object.keys(result) as Array<keyof RealCallCountersV2B>) result[key] += entry.real_call_counters[key];
	return result;
}

export function assertSequenceBudgetCapacityV2B(options: { reservedUsage: UsageV2B; startedAttempts: number; groupAttempts: number }): void {
	const delta = reservedAttemptUsage();
	if (options.groupAttempts + 1 > V2B_GROUP_CAPS.attempts_exact_on_valid_failure || options.startedAttempts + 1 > V2B_SEQUENCE_CAPS.started_attempts) throw new Error("V2-B sequence Attempt cap exhausted");
	if (
		options.reservedUsage.provider_requests + delta.provider_requests > V2B_SEQUENCE_CAPS.provider_requests ||
		options.reservedUsage.tool_calls + delta.tool_calls > V2B_SEQUENCE_CAPS.tool_calls || options.reservedUsage.tokens + delta.tokens > V2B_SEQUENCE_CAPS.tokens ||
		options.reservedUsage.active_execution_time_ms + delta.active_execution_time_ms > V2B_SEQUENCE_CAPS.active_execution_time_ms ||
		options.reservedUsage.verifier_runs + delta.verifier_runs > V2B_SEQUENCE_CAPS.verifier_runs || options.reservedUsage.real_cost_usd + delta.real_cost_usd > V2B_SEQUENCE_CAPS.real_cost_usd + Number.EPSILON
	) throw new Error("V2-B sequence budget exhausted");
}

function assertSequenceCapacity(ledger: readonly SequenceLedgerEntryV2B[], caseId: CaseIdV2B): void {
	const attemptStarts = ledger.filter((entry) => entry.attempt_id !== null);
	const groupStarts = attemptStarts.filter((entry) => entry.case_id === caseId);
	const reserved = sumLedgerUsage(ledger, "reserved_usage");
	assertSequenceBudgetCapacityV2B({ reservedUsage: reserved, startedAttempts: attemptStarts.length, groupAttempts: groupStarts.length });
}

export interface SequencePortFactoryV2B {
	create(options: {
		runId: string;
		caseId: CaseIdV2B;
		realCounters: RealCallCountersV2B;
		onAttemptEvidence: (evidence: AttemptRuntimeEvidenceV2B) => void;
		onAttemptStarted: (input: { attemptId: string; role: AttemptRuntimeEvidenceV2B["role"] }) => void;
	}): ExecutionPortV2;
}

function sequenceScenario(caseId: CaseIdV2B): Stage1ScenarioV2B {
	return caseId === "primary_positive"
		? { caseId, primaryMode: "pass", candidateModes: ["pass", "pass"], controlledSeed: true }
		: { caseId, primaryMode: "pass" };
}

function writeSequenceTerminal(sequenceRoot: string, manifest: ExecutionManifestV2B, status: SequenceTerminalV2B["status"], reason: SequenceTerminalV2B["reason"]): SequenceTerminalV2B {
	const ledger = readLedger(sequenceRoot);
	const caseRefs = ledger.filter((entry) => entry.state === "terminal" && entry.run_terminal_ref).map((entry) => entry.run_terminal_ref!);
	const pauseRefs = ledger.filter((entry) => entry.state === "paused" && entry.case_pause_ref).map((entry) => entry.case_pause_ref!);
	const ledgerRef = artifactRef(sequenceRoot, "ledger.jsonl", "application/x-ndjson", false);
	const terminal: SequenceTerminalV2B = {
		schema_version: "v2b-sequence-terminal-v1", manifest_id: manifest.manifest_id, sequence_id: manifest.sequence_id,
		status, reason, case_terminal_refs: caseRefs, case_pause_refs: pauseRefs, ledger_ref: ledgerRef,
		started_attempts: ledger.filter((entry) => entry.attempt_id !== null).length,
		reserved_usage: sumLedgerUsage(ledger, "reserved_usage"), actual_usage: sumLedgerUsage(ledger, "actual_usage"),
		real_call_counters: sumTerminalCounters(ledger),
	};
	writeOnceJson(sequenceRoot, "terminal.json", terminal);
	return terminal;
}

function writeCasePause(sequenceRoot: string, manifest: ExecutionManifestV2B, planned: PlannedCaseV2B, attempts: readonly AttemptRuntimeEvidenceV2B[], counters: RealCallCountersV2B): CasePauseV2B {
	const ledger = readLedger(sequenceRoot);
	const attemptStarts = ledger.filter((entry) => entry.case_id === planned.case_id && entry.attempt_id !== null);
	const actualUsage = emptyUsage();
	for (const attempt of attempts) addUsage(actualUsage, attempt.usage);
	const providerRequests = Math.max(actualUsage.provider_requests, counters.external_provider_calls);
	const zeroDispatch = providerRequests === 0 && counters.network_calls === 0 && counters.external_provider_calls === 0 && counters.real_model_calls === 0;
	const pause: CasePauseV2B = {
		schema_version: "v2b-case-pause-v1",
		manifest_id: manifest.manifest_id,
		sequence_id: manifest.sequence_id,
		execution_baseline_commit: manifest.execution_baseline_commit,
		execution_baseline_tree: manifest.execution_baseline_tree,
		workbench_source_digest: manifest.workbench_source_digest,
		case_id: planned.case_id,
		run_id: planned.planned_run_id,
		phase: zeroDispatch ? "pre_dispatch" : "post_dispatch_or_invalid",
		reason: "execution_boundary",
		evidence_valid: true,
		contingency_eligible: planned.case_id === "primary_positive" && zeroDispatch,
		provider_requests: providerRequests,
		attempts: attemptStarts.map((entry) => ({ attempt_id: entry.attempt_id!, role: entry.attempt_role! })),
		actual_usage: actualUsage,
		real_call_counters: structuredClone(counters),
	};
	writeOnceJson(sequenceRoot, `pauses/${planned.case_id}.json`, pause);
	return pause;
}

function readValidatedCasePause(sequenceRoot: string, manifest: ExecutionManifestV2B, entry: SequenceLedgerEntryV2B): CasePauseV2B {
	if (entry.state !== "paused" || !entry.case_pause_ref || entry.run_terminal_ref) throw new Error("V2-B Case Pause linkage invalid");
	const ledger = readLedger(sequenceRoot);
	if (ledger.some((value, index) => value.schema_version !== "v2b-sequence-ledger-v1" || value.seq !== index + 1 || value.manifest_id !== manifest.manifest_id || value.sequence_id !== manifest.sequence_id || value.planned_run_id !== manifest.planned_cases.find((planned) => planned.case_id === value.case_id)?.planned_run_id)) throw new Error("V2-B Case Pause ledger identity invalid");
	const plannedPrefix = ledger.slice(0, 3);
	if (plannedPrefix.some((value, index) => value.state !== "planned" || value.case_id !== manifest.planned_cases[index]?.case_id)) throw new Error("V2-B Case Pause planned prefix invalid");
	const caseEntries = ledger.filter((value) => value.case_id === entry.case_id);
	if (caseEntries[0]?.state !== "planned" || caseEntries[1]?.state !== "started" || caseEntries[1]?.attempt_id !== null || caseEntries.at(-1)?.seq !== entry.seq || caseEntries.at(-1)?.state !== "paused" || caseEntries.slice(2, -1).some((value) => value.state !== "started" || value.attempt_id === null)) throw new Error("V2-B Case Pause transition invalid");
	const actualRef = artifactRef(sequenceRoot, entry.case_pause_ref.path, "application/json", false);
	if (stableJson(actualRef) !== stableJson(entry.case_pause_ref)) throw new Error("V2-B Case Pause ArtifactRef mismatch");
	const pause = JSON.parse(readFileSync(resolve(sequenceRoot, entry.case_pause_ref.path), "utf8")) as CasePauseV2B;
	const attemptEntries = caseEntries.filter((value) => value.attempt_id !== null);
	if (attemptEntries.some((value) => stableJson(value.reserved_usage) !== stableJson(reservedAttemptUsage()) || stableJson(value.actual_usage) !== stableJson(emptyUsage()) || value.run_terminal_ref || value.case_pause_ref)) throw new Error("V2-B Case Pause Attempt reservation invalid");
	const attemptStarts = attemptEntries.map((value) => ({ attempt_id: value.attempt_id!, role: value.attempt_role! }));
	const expectedAttempts = [
		{ attempt_id: `${entry.planned_run_id}-primary-attempt-01`, role: "primary" as const },
		{ attempt_id: `${entry.planned_run_id}-recovery-group-01-candidate-a-attempt-01`, role: "continue_failed_session" as const },
		{ attempt_id: `${entry.planned_run_id}-recovery-group-01-candidate-b-attempt-01`, role: "fresh_session_from_failure_seed" as const },
	].slice(0, attemptStarts.length);
	const providerRequests = Math.max(pause.actual_usage.provider_requests, pause.real_call_counters.external_provider_calls);
	const zeroDispatch = providerRequests === 0 && pause.real_call_counters.network_calls === 0 && pause.real_call_counters.external_provider_calls === 0 && pause.real_call_counters.real_model_calls === 0;
	if (
		pause.schema_version !== "v2b-case-pause-v1" || pause.manifest_id !== manifest.manifest_id || pause.sequence_id !== manifest.sequence_id ||
		pause.execution_baseline_commit !== manifest.execution_baseline_commit || pause.execution_baseline_tree !== manifest.execution_baseline_tree ||
		pause.workbench_source_digest !== manifest.workbench_source_digest || pause.case_id !== entry.case_id || pause.run_id !== entry.planned_run_id ||
		pause.reason !== "execution_boundary" || pause.evidence_valid !== true || pause.provider_requests !== providerRequests ||
		pause.phase !== (zeroDispatch ? "pre_dispatch" : "post_dispatch_or_invalid") || pause.contingency_eligible !== (entry.case_id === "primary_positive" && zeroDispatch) ||
		stableJson(attemptStarts) !== stableJson(expectedAttempts) || stableJson(pause.attempts) !== stableJson(attemptStarts) || stableJson(pause.actual_usage) !== stableJson(entry.actual_usage) || stableJson(pause.real_call_counters) !== stableJson(entry.real_call_counters)
	) throw new Error("V2-B Case Pause evidence invalid");
	return pause;
}

export async function runNextSequenceV2B(options: {
	projectRoot: string;
	sequenceRoot: string;
	manifest: ExecutionManifestV2B;
	portFactory: SequencePortFactoryV2B;
	observedIdentity?: ObservedStage2IdentityV2B;
	scenarioForCase?: (caseId: CaseIdV2B) => Stage1ScenarioV2B;
}): Promise<RunTerminalV2B | CasePauseV2B | SequenceTerminalV2B> {
	preflightExecutionManifestV2B({ projectRoot: options.projectRoot, manifest: options.manifest, ...(options.observedIdentity ? { observedIdentity: options.observedIdentity } : {}) });
	if (!existsSync(options.sequenceRoot)) initializeSequence(options.sequenceRoot, options.manifest);
	const persistedManifest = JSON.parse(readFileSync(resolve(options.sequenceRoot, "manifest.json"), "utf8")) as ExecutionManifestV2B;
	if (stableJson(persistedManifest) !== stableJson(options.manifest)) throw new Error("V2-B persisted Execution Manifest mismatch");
	if (existsSync(resolve(options.sequenceRoot, "terminal.json"))) throw new Error("V2-B Sequence is already terminal");
	let ledger = readLedger(options.sequenceRoot);
	const states = latestCaseStates(ledger);
	if ([...states.values()].some((entry) => entry.state === "started")) throw new Error("V2-B nonterminal started Case requires Pause review");
	let primary = states.get("primary_positive")!;
	let contingency = states.get("contingency_positive")!;
	let negative = states.get("negative")!;
	let next: PlannedCaseV2B | undefined;
	if (primary.state === "planned") next = options.manifest.planned_cases[0];
	else {
		const primaryTerminal = primary.state === "terminal" && primary.run_terminal_ref ? JSON.parse(readFileSync(resolve(options.sequenceRoot, primary.run_terminal_ref.path), "utf8")) as RunTerminalV2B : null;
		let contingencyEligible = primaryTerminal?.outcome === "initial_pass";
		if (primary.state === "paused") {
			try {
				contingencyEligible = readValidatedCasePause(options.sequenceRoot, options.manifest, primary).contingency_eligible;
			} catch {
				return writeSequenceTerminal(options.sequenceRoot, options.manifest, "paused", "run_invalid");
			}
		}
		if (contingency.state === "planned") {
			if (contingencyEligible) next = options.manifest.planned_cases[1];
			else if (primaryTerminal && primaryTerminal.outcome !== "initial_pass") appendLedger(options.sequenceRoot, { manifest_id: options.manifest.manifest_id, sequence_id: options.manifest.sequence_id, case_id: "contingency_positive", planned_run_id: contingency.planned_run_id, state: "skipped", reason: "primary_formed_valid_seed_or_post_dispatch_terminal", run_terminal_ref: null, attempt_id: null, attempt_role: null, reserved_usage: emptyUsage(), actual_usage: emptyUsage(), real_call_counters: zeroCounters() });
			else return writeSequenceTerminal(options.sequenceRoot, options.manifest, "paused", "run_invalid");
		}
		ledger = readLedger(options.sequenceRoot);
		const refreshed = latestCaseStates(ledger);
		primary = refreshed.get("primary_positive")!;
		contingency = refreshed.get("contingency_positive")!;
		negative = refreshed.get("negative")!;
		if (!next && contingency.state === "paused") {
			try { readValidatedCasePause(options.sequenceRoot, options.manifest, contingency); } catch { return writeSequenceTerminal(options.sequenceRoot, options.manifest, "paused", "run_invalid"); }
			return writeSequenceTerminal(options.sequenceRoot, options.manifest, "paused", "positive_not_triggered");
		}
		const contingencyTerminal = contingency.state === "terminal" && contingency.run_terminal_ref ? JSON.parse(readFileSync(resolve(options.sequenceRoot, contingency.run_terminal_ref.path), "utf8")) as RunTerminalV2B : null;
		if (!next && contingencyTerminal?.outcome === "initial_pass") return writeSequenceTerminal(options.sequenceRoot, options.manifest, "paused", "positive_not_triggered");
		const positiveTriggered = Boolean(
			primaryTerminal && primaryTerminal.outcome !== "initial_pass" ||
			contingencyTerminal && contingencyTerminal.outcome !== "initial_pass"
		);
		if (!next && positiveTriggered && negative.state === "planned") next = options.manifest.planned_cases[2];
	}
	if (!next) {
		ledger = readLedger(options.sequenceRoot);
		const terminalRuns = ledger.filter((entry) => entry.state === "terminal" && entry.run_terminal_ref).map((entry) => JSON.parse(readFileSync(resolve(options.sequenceRoot, entry.run_terminal_ref!.path), "utf8")) as RunTerminalV2B);
		const positiveTriggered = terminalRuns.some((entry) => entry.case_id !== "negative" && entry.outcome !== "initial_pass");
		const negativeValid = terminalRuns.some((entry) => entry.case_id === "negative" && entry.outcome === "initial_pass");
		return writeSequenceTerminal(options.sequenceRoot, options.manifest, positiveTriggered && negativeValid ? "completed" : "paused", !positiveTriggered ? "positive_not_triggered" : !negativeValid ? "negative_not_valid" : "sequence_completed");
	}
	const countersBefore = sumTerminalCounters(ledger);
	if (countersBefore.credential_reads + 1 > V2B_SEQUENCE_CAPS.credential_reads) return writeSequenceTerminal(options.sequenceRoot, options.manifest, "paused", "budget_exhausted");
	appendLedger(options.sequenceRoot, { manifest_id: options.manifest.manifest_id, sequence_id: options.manifest.sequence_id, case_id: next.case_id, planned_run_id: next.planned_run_id, state: "started", reason: null, run_terminal_ref: null, attempt_id: null, attempt_role: null, reserved_usage: emptyUsage(), actual_usage: emptyUsage(), real_call_counters: zeroCounters() });
	const attempts: AttemptRuntimeEvidenceV2B[] = [];
	const runCounters = zeroCounters();
	try {
		const recordAttemptStarted = ({ attemptId, role }: { attemptId: string; role: AttemptRuntimeEvidenceV2B["role"] }): void => {
			const current = readLedger(options.sequenceRoot);
			assertSequenceCapacity(current, next!.case_id);
			appendLedger(options.sequenceRoot, { manifest_id: options.manifest.manifest_id, sequence_id: options.manifest.sequence_id, case_id: next!.case_id, planned_run_id: next!.planned_run_id, state: "started", reason: "attempt_started_reserved", run_terminal_ref: null, attempt_id: attemptId, attempt_role: role, reserved_usage: reservedAttemptUsage(), actual_usage: emptyUsage(), real_call_counters: zeroCounters() });
		};
		const port = options.portFactory.create({
			runId: next.planned_run_id, caseId: next.case_id, realCounters: runCounters,
			onAttemptEvidence: (evidence) => attempts.push(structuredClone(evidence)),
			onAttemptStarted: recordAttemptStarted,
		});
		const runRoot = resolve(options.sequenceRoot, "runs", next.planned_run_id);
		const run = await executeCaseRunV2B({ projectRoot: options.projectRoot, runRoot, runId: next.planned_run_id, scenario: options.scenarioForCase?.(next.case_id) ?? sequenceScenario(next.case_id), stage: options.manifest.stage, executionManifest: options.manifest, executionPort: port, realCounters: runCounters, attemptEvidence: attempts, onAttemptStarted: recordAttemptStarted });
		const ref = artifactRef(options.sequenceRoot, `runs/${next.planned_run_id}/terminal.json`, "application/json", false);
		appendLedger(options.sequenceRoot, { manifest_id: options.manifest.manifest_id, sequence_id: options.manifest.sequence_id, case_id: next.case_id, planned_run_id: next.planned_run_id, state: "terminal", reason: run.outcome, run_terminal_ref: ref, attempt_id: null, attempt_role: null, reserved_usage: emptyUsage(), actual_usage: structuredClone(run.usage), real_call_counters: structuredClone(run.real_call_counters) });
		return run;
	} catch {
		const pause = writeCasePause(options.sequenceRoot, options.manifest, next, attempts, runCounters);
		const pauseRef = artifactRef(options.sequenceRoot, `pauses/${next.case_id}.json`, "application/json", false);
		appendLedger(options.sequenceRoot, { manifest_id: options.manifest.manifest_id, sequence_id: options.manifest.sequence_id, case_id: next.case_id, planned_run_id: next.planned_run_id, state: "paused", reason: pause.phase === "pre_dispatch" ? "pre_dispatch_zero_provider_stop" : "post_dispatch_or_invalid_stop", run_terminal_ref: null, case_pause_ref: pauseRef, attempt_id: null, attempt_role: null, reserved_usage: emptyUsage(), actual_usage: structuredClone(pause.actual_usage), real_call_counters: structuredClone(runCounters) });
		if (pause.contingency_eligible) return pause;
		return writeSequenceTerminal(options.sequenceRoot, options.manifest, "paused", next.case_id === "contingency_positive" ? "positive_not_triggered" : next.case_id === "negative" ? "negative_not_valid" : "run_invalid");
	}
}
