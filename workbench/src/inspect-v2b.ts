import { existsSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import type { ArtifactRefV0B } from "./contracts/v0b-types.ts";
import type { CandidatePreVerifierCheckpointV2A, ProviderReservationLedgerV2A } from "./contracts/v2-types.ts";
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
	type InspectResultV2B,
	type RealCallCountersV2B,
	type RunManifestV2B,
	type RunTerminalV2B,
	type SequenceInspectResultV2B,
	type SequenceLedgerEntryV2B,
	type SequenceTerminalV2B,
	type UsageV2B,
} from "./contracts/v2b-types.ts";
import {
	readJsonArtifact,
	resolveRunRelative,
	validateArtifactRef,
	validateRunRootBoundary,
} from "./evidence/artifacts.ts";
import { digestObject, stableJson, treeInventory } from "./hash.ts";
import { inspectRunV2A, scanEvidenceBytesV2 } from "./inspect-v2.ts";
const ZERO_COUNTERS_V2B: RealCallCountersV2B = Object.freeze({ credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 });

function portable(path: string): string {
	return path.split(sep).join("/");
}

function safeRead<T>(runRoot: string, path: string, errors: string[]): T | null {
	try {
		return readJsonArtifact<T>(runRoot, path);
	} catch (error) {
		errors.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
		return null;
	}
}

function addRefErrors(runRoot: string, label: string, ref: unknown, errors: string[]): boolean {
	const found = validateArtifactRef(runRoot, ref);
	errors.push(...found.map((error) => `${label}: ${error}`));
	return found.length === 0;
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

function addUsage(target: UsageV2B, value: UsageV2B): void {
	for (const key of Object.keys(target) as Array<keyof UsageV2B>) target[key] += value[key];
}

function scanEvidence(runRoot: string, errors: string[]): void {
	for (const entry of treeInventory(runRoot)) {
		if (entry.path.includes("/workspace/") || entry.path.endsWith("/workspace")) continue;
		scanEvidenceBytesV2(readFileSync(resolve(runRoot, entry.path)), entry.path, errors);
	}
}

function validateManifest(projectRoot: string, runRoot: string, manifest: RunManifestV2B, terminal: RunTerminalV2B, errors: string[], executionManifest?: ExecutionManifestV2B): void {
	const { manifest_id: manifestId, ...body } = manifest;
	if (digestObject(body) !== manifestId || terminal.manifest_id !== manifestId) errors.push("V2-B Manifest identity mismatch");
	if (
		manifest.schema_version !== "v2b-run-manifest-v2" || !["stage1_zero_real_access", "stage2_deterministic_proof", "stage2_real"].includes(manifest.stage) ||
		manifest.control_baseline_commit !== V2B_CONTROL_BASELINE_COMMIT || manifest.control_baseline_tree !== V2B_CONTROL_BASELINE_TREE ||
		manifest.pi_commit !== V2B_PINNED_PI_COMMIT || manifest.provider_profile_id !== V2B_MODEL_PROFILE_ID ||
		manifest.credential_profile_name !== V2B_CREDENTIAL_PROFILE || manifest.skill_id !== V2B_SKILL_ID ||
		manifest.tool_profile_id !== V2B_TOOL_PROFILE_ID || manifest.policy_id !== V2B_POLICY_ID ||
		manifest.retry !== false || manifest.fallback !== false || manifest.replacement !== false ||
		stableJson(manifest.all_cases) !== stableJson(V2B_FROZEN_CASES) ||
		stableJson(manifest.budgets) !== stableJson({ attempt: V2B_ATTEMPT_CAPS, group: V2B_GROUP_CAPS, sequence: V2B_SEQUENCE_CAPS }) ||
		!V2B_FROZEN_CASES.some((candidate) => stableJson(candidate) === stableJson(manifest.case))
	) errors.push("V2-B Manifest frozen contract mismatch");
	if (manifest.stage === "stage1_zero_real_access") {
		if (manifest.real_execution_authorized !== false || manifest.deterministic_stub_required !== true || manifest.execution_manifest_id !== null || manifest.execution_baseline_commit !== null || manifest.execution_baseline_tree !== null) errors.push("V2-B Stage 1 Manifest authority mismatch");
	} else if (!executionManifest || manifest.real_execution_authorized !== (manifest.stage === "stage2_real") || manifest.deterministic_stub_required !== (manifest.stage !== "stage2_real") || manifest.execution_manifest_id !== executionManifest.manifest_id || manifest.execution_baseline_commit !== executionManifest.execution_baseline_commit || manifest.execution_baseline_tree !== executionManifest.execution_baseline_tree || manifest.workbench_source_digest !== executionManifest.workbench_source_digest || manifest.stage !== executionManifest.stage) {
		errors.push("V2-B Stage 2 Manifest/Execution Baseline binding mismatch");
	}
	if (!addRefErrors(runRoot, "V2-B source", manifest.workbench_source_ref, errors)) return;
	if (manifest.workbench_source_ref.path !== "config/workbench-source.json") errors.push("V2-B source Artifact path mismatch");
	const source = safeRead<{ schema_version: string; scope: string; digest: string; inventory: unknown[] }>(runRoot, manifest.workbench_source_ref.path, errors);
	if (!source) return;
	if (
		source.schema_version !== "v2b-source-inventory-v1" || source.scope !== "workbench/src" ||
		digestObject(source.inventory) !== source.digest || source.digest !== manifest.workbench_source_digest
	) errors.push("V2-B source inventory envelope mismatch");
	try {
		const live = treeInventory(resolve(projectRoot, "workbench/src"));
		if (stableJson(live) !== stableJson(source.inventory) || digestObject(live) !== source.digest) errors.push("V2-B source inventory is stale");
	} catch (error) {
		errors.push(`V2-B source recomputation failed: ${error instanceof Error ? error.message : String(error)}`);
	}
}

function validateAttempt(attempt: AttemptRuntimeEvidenceV2B, expectedRole: AttemptRuntimeEvidenceV2B["role"], errors: string[], requireZeroCounters: boolean): void {
	const label = attempt.attempt_id || expectedRole;
	if (
		attempt.schema_version !== "v2b-attempt-runtime-evidence-v1" || attempt.role !== expectedRole ||
		attempt.composition.provider !== "deepseek" || attempt.composition.model_id !== "deepseek-v4-flash" ||
		attempt.composition.api !== "openai-completions" ||
		attempt.composition.endpoint !== "https://api.deepseek.com/chat/completions" || attempt.composition.thinking_level !== "off" ||
		attempt.composition.retry !== false || attempt.composition.fallback !== false ||
		attempt.composition.skill_id !== V2B_SKILL_ID || attempt.composition.tool_profile_id !== V2B_TOOL_PROFILE_ID ||
		!/^([a-f0-9]{64})$/.test(attempt.composition.system_prompt_sha256) ||
		!/^([a-f0-9]{64})$/.test(attempt.composition.prompt_sha256) ||
		!/^([a-f0-9]{64})$/.test(attempt.composition.provider_payload_sha256) ||
		!/^([a-f0-9]{64})$/.test(attempt.composition.common_input_sha256) ||
		!Number.isSafeInteger(attempt.composition.context_message_count) || attempt.composition.context_message_count < 0 ||
		stableJson(attempt.composition.tool_names) !== stableJson(["run_command", "workspace_edit", "workspace_list", "workspace_read", "workspace_search", "workspace_write"]) ||
		attempt.no_retry_fallback !== true
	) errors.push(`${label}: composition shape mismatch`);
	const quiescenceValid = attempt.quiescence !== null && stableJson(attempt.quiescence) === stableJson({
		pre_dispatch_refusal: true,
		pending_provider_responses: 0,
		pending_tool_calls: 0,
		pending_side_effects: 0,
		prior_usage_known: true,
		session_persisted: true,
		workspace_persisted: true,
		evidence_closed: true,
	});
	const runtimeStop = attempt.runtime_budget_stop_observation;
	const runtimeStopClosed = runtimeStop !== null && runtimeStop.pre_dispatch_refusal === true && runtimeStop.pending_provider_responses === 0 &&
		runtimeStop.pending_provider_reservation === false && runtimeStop.pending_tool_calls === 0 && runtimeStop.prior_usage_known === true && runtimeStop.reservations_reconciled === true;
	if (
		(attempt.agent_completion === "settled" && (!attempt.settled || attempt.terminal_reason !== "settled" || attempt.quiescence !== null || runtimeStop !== null)) ||
		(attempt.agent_completion === "pre_dispatch_budget_terminal" && (attempt.settled || attempt.terminal_reason !== "budget_stopped" || !quiescenceValid || !runtimeStopClosed)) ||
		(attempt.agent_completion === "invalid" && attempt.settled)
	) errors.push(`${label}: Agent completion/quiescence mismatch`);
	if (requireZeroCounters && (stableJson(attempt.counters_before) !== stableJson(ZERO_COUNTERS_V2B) || stableJson(attempt.counters_after) !== stableJson(ZERO_COUNTERS_V2B))) {
		errors.push(`${label}: Stage 1 real-access counters are not zero`);
	}
	if (Object.values(attempt.counters_before).some((value) => !Number.isSafeInteger(value) || value < 0) || Object.values(attempt.counters_after).some((value) => !Number.isSafeInteger(value) || value < 0)) errors.push(`${label}: counter envelope invalid`);
	const usage = attempt.usage;
	const integerKeys = ["provider_requests", "tool_calls", "input_tokens", "output_tokens", "cache_read_tokens", "cache_write_tokens", "conservative_charged_tokens", "tokens", "active_execution_time_ms", "verifier_runs"] as const;
	if (integerKeys.some((key) => !Number.isSafeInteger(usage[key]) || usage[key] < 0) || !Number.isFinite(usage.real_cost_usd) || usage.real_cost_usd < 0 || !Number.isFinite(usage.conservative_charged_cost_usd) || usage.conservative_charged_cost_usd < 0) {
		errors.push(`${label}: usage envelope invalid`);
	}
	if (
		usage.tokens !== usage.input_tokens + usage.output_tokens + usage.cache_read_tokens + usage.cache_write_tokens + usage.conservative_charged_tokens ||
		usage.provider_requests > V2B_ATTEMPT_CAPS.provider_requests || usage.tool_calls > V2B_ATTEMPT_CAPS.tool_calls ||
		usage.tokens > V2B_ATTEMPT_CAPS.tokens || usage.active_execution_time_ms > V2B_ATTEMPT_CAPS.active_execution_time_ms ||
		usage.verifier_runs !== 1 || usage.real_cost_usd > V2B_ATTEMPT_CAPS.real_cost_usd
	) errors.push(`${label}: usage exceeds or disagrees with frozen Attempt budget`);
	if (attempt.reservations.length !== usage.provider_requests) errors.push(`${label}: reservation/request count mismatch`);
	let committedTokens = 0;
	let committedCost = 0;
	let conservativeTokens = 0;
	let conservativeCost = 0;
	for (const [index, reservation] of attempt.reservations.entries()) {
		if (
			reservation.attempt_id !== attempt.attempt_id || reservation.request_ordinal !== index + 1 ||
			reservation.provider_requests_before !== index || reservation.provider_requests_after !== index + 1 ||
			reservation.reserved_tokens < 0 || reservation.reserved_cost_usd < 0
		) errors.push(`${label}: reservation lineage invalid`);
		if (reservation.phase === "known_usage_committed") {
			if (typeof reservation.actual_tokens !== "number" || typeof reservation.actual_cost_usd !== "number") errors.push(`${label}: known usage commitment is incomplete`);
			else {
				committedTokens += reservation.actual_tokens;
				committedCost += reservation.actual_cost_usd;
			}
		} else if (reservation.phase === "conservative_unknown_usage_charge" || reservation.phase === "conservative_overflow_charge") {
			conservativeTokens += reservation.reserved_tokens;
			conservativeCost += reservation.reserved_cost_usd;
		} else {
			errors.push(`${label}: uncommitted provider reservation persisted`);
		}
	}
	if ((attempt.terminal_reason === "settled" || attempt.terminal_reason === "budget_stopped") && (committedTokens + conservativeTokens !== usage.tokens || Math.abs(committedCost + conservativeCost - usage.real_cost_usd) > Number.EPSILON)) {
		errors.push(`${label}: committed usage does not reconcile`);
	}
	if (conservativeTokens !== usage.conservative_charged_tokens || Math.abs(conservativeCost - usage.conservative_charged_cost_usd) > Number.EPSILON) {
		errors.push(`${label}: conservative unknown-usage charge does not reconcile`);
	}
	if (Math.abs(committedCost + conservativeCost - usage.real_cost_usd) > Number.EPSILON) errors.push(`${label}: total cost does not reconcile`);
}

export function inspectStage1RunV2B(options: { projectRoot: string; runRoot: string; executionManifest?: ExecutionManifestV2B }): InspectResultV2B {
	const errors = validateRunRootBoundary(options.runRoot);
	const manifest = safeRead<RunManifestV2B>(options.runRoot, "config/manifest.json", errors);
	const terminal = safeRead<RunTerminalV2B>(options.runRoot, "terminal.json", errors);
	const attempts: AttemptRuntimeEvidenceV2B[] = [];
	const result = (): InspectResultV2B => ({
		schema_version: "v2b-stage1-inspection-v1",
		run_id: terminal?.run_id ?? null,
		integrity_valid: errors.length === 0,
		terminal_valid: errors.length === 0,
		errors,
		manifest,
		terminal,
		attempts,
	});
	if (!manifest || !terminal) return result();
	validateManifest(options.projectRoot, options.runRoot, manifest, terminal, errors, options.executionManifest);
	if (
		terminal.schema_version !== "v2b-run-terminal-v2" || terminal.run_id !== manifest.run_id ||
		terminal.case_id !== manifest.case.case_id || terminal.substrate_root !== "substrate" ||
		terminal.terminal_reason !== (manifest.stage === "stage2_real" ? "stage2_real_completed" : manifest.stage === "stage2_deterministic_proof" ? "stage2_stub_completed" : "stage1_stub_completed") ||
		(manifest.stage !== "stage2_real" && stableJson(terminal.real_call_counters) !== stableJson(ZERO_COUNTERS_V2B))
	) errors.push("V2-B terminal identity/counter mismatch");
	addRefErrors(options.runRoot, "V2-B substrate terminal", terminal.substrate_terminal_ref, errors);
	if (terminal.substrate_terminal_ref.path !== "substrate/terminal.json") errors.push("V2-B substrate terminal path mismatch");
	const substrate = inspectRunV2A({
		projectRoot: options.projectRoot,
		runRoot: resolve(options.runRoot, "substrate"),
		expectedTaskId: manifest.case.task_id,
		expectedRealExecutionAuthorized: manifest.stage === "stage2_real",
		expectedExecutionPortKind: "injected",
		expectedRealCallCounters: terminal.real_call_counters,
	});
	if (!substrate.integrity_valid) errors.push(...substrate.errors.map((error) => `substrate: ${error}`));
	if (
		substrate.terminal?.run_id !== terminal.run_id || substrate.terminal?.outcome !== terminal.outcome ||
		substrate.terminal?.selected_candidate_id !== terminal.selected_candidate_id
	) errors.push("V2-B terminal does not bind the substrate terminal");
	const expectedRoles: AttemptRuntimeEvidenceV2B["role"][] = terminal.outcome === "initial_pass"
		? ["primary"]
		: ["primary", "continue_failed_session", "fresh_session_from_failure_seed"];
	if (terminal.attempt_evidence_refs.length !== expectedRoles.length) errors.push("V2-B Attempt evidence count mismatch");
	for (const [index, ref] of terminal.attempt_evidence_refs.entries()) {
		if (!addRefErrors(options.runRoot, `V2-B Attempt ${index + 1}`, ref, errors)) continue;
		if (ref.path !== `attempts/${String(index + 1).padStart(2, "0")}-${expectedRoles[index]}.json`) errors.push(`V2-B Attempt ${index + 1} path mismatch`);
		const attempt = safeRead<AttemptRuntimeEvidenceV2B>(options.runRoot, ref.path, errors);
		if (!attempt) continue;
		attempts.push(attempt);
		validateAttempt(attempt, expectedRoles[index]!, errors, manifest.stage !== "stage2_real");
	}
	if (attempts.length === expectedRoles.length) {
		const primarySessionPath = resolveRunRelative(resolve(options.runRoot, "substrate"), substrate.terminal!.primary_session_ref.path);
		if (resolve(attempts[0]!.composition.session_path) !== resolve(primarySessionPath)) errors.push("V2-B primary public Session path mismatch");
		if (attempts.length === 3) {
			const [primary, continued, fresh] = attempts;
			if (continued!.composition.parent_session_path === null || resolve(continued!.composition.parent_session_path) !== resolve(primary!.composition.session_path)) {
				errors.push("V2-B continued Session parent lineage mismatch");
			}
			if (fresh!.composition.parent_session_path !== null) errors.push("V2-B fresh Session retained a parent");
			for (const key of ["provider", "model_id", "endpoint", "thinking_level", "retry", "fallback", "task_id", "skill_id", "tool_profile_id", "system_prompt_sha256", "prompt_sha256"] as const) {
				if (continued!.composition[key] !== fresh!.composition[key]) errors.push(`V2-B A/B common composition drift: ${key}`);
			}
			if (continued!.composition.common_input_sha256 !== fresh!.composition.common_input_sha256) errors.push("V2-B A/B common input identity drift");
			const [candidateA, candidateB] = substrate.candidates;
			if (!substrate.recovery_seed || !candidateA || !candidateB || candidateA.initial_workspace_digest !== substrate.recovery_seed.failed_workspace_snapshot_digest || candidateB.initial_workspace_digest !== substrate.recovery_seed.failed_workspace_snapshot_digest || candidateA.common_artifact_digest !== candidateB.common_artifact_digest || candidateA.immediate_recovery_prompt_sha256 !== candidateB.immediate_recovery_prompt_sha256 || stableJson(candidateA.budget_caps) !== stableJson(candidateB.budget_caps)) {
				 errors.push("V2-B A/B Seed/Failure Packet/recovery instruction/Skill/Tool/Verifier/budget/Pi/Workbench fairness mismatch");
			}
			for (const attempt of [continued!, fresh!]) {
				if (attempt.agent_completion !== "pre_dispatch_budget_terminal") continue;
				const candidate = substrate.candidates.find((entry) => entry.attempt_id === attempt.attempt_id);
				const checkpoint = candidate?.pre_verifier_checkpoint_ref
					? safeRead<CandidatePreVerifierCheckpointV2A>(resolve(options.runRoot, "substrate"), candidate.pre_verifier_checkpoint_ref.path, errors)
					: null;
				const ledger = checkpoint
					? safeRead<ProviderReservationLedgerV2A>(resolve(options.runRoot, "substrate"), checkpoint.reservation_ledger_ref.path, errors)
					: null;
				if (!candidate?.pre_verifier_checkpoint_ref || candidate.quiescent_budget_terminal !== true || !checkpoint || !ledger ||
					stableJson(attempt.runtime_budget_stop_observation) !== stableJson(checkpoint.runtime_observation) ||
					stableJson(attempt.reservations) !== stableJson(ledger.reservations) || attempt.reservations.some((reservation) => reservation.phase === "reserved_before_dispatch")) {
					errors.push(`${attempt.attempt_id}: Attempt evidence is not bound to the raw-derived pre-Verifier checkpoint`);
				}
			}
		}
	}
	const usage = emptyUsage();
	for (const attempt of attempts) addUsage(usage, attempt.usage);
	if (stableJson(usage) !== stableJson(terminal.usage)) errors.push("V2-B terminal usage reconciliation mismatch");
	const cap = terminal.outcome === "initial_pass" ? V2B_ATTEMPT_CAPS : V2B_GROUP_CAPS;
	if (
		usage.provider_requests > cap.provider_requests || usage.tool_calls > cap.tool_calls || usage.tokens > cap.tokens ||
		usage.active_execution_time_ms > cap.active_execution_time_ms || usage.verifier_runs > cap.verifier_runs || usage.real_cost_usd > cap.real_cost_usd
	) errors.push("V2-B aggregate usage exceeds frozen budget");
	scanEvidence(options.runRoot, errors);
	return result();
}

export function inspectionFingerprintV2B(runRoot: string): string {
	return digestObject(treeInventory(runRoot).map((entry) => ({ ...entry, path: portable(entry.path) })));
}

function readSequenceLedger(sequenceRoot: string, errors: string[]): SequenceLedgerEntryV2B[] {
	try {
		const text = readFileSync(resolve(sequenceRoot, "ledger.jsonl"), "utf8");
		if (text === "") return [];
		if (!text.endsWith("\n") || text.includes("\r")) throw new Error("ledger must be LF-terminated JSONL");
		return text.trim().split("\n").map((line) => JSON.parse(line) as SequenceLedgerEntryV2B);
	} catch (error) {
		errors.push(`sequence ledger: ${error instanceof Error ? error.message : String(error)}`);
		return [];
	}
}

export function inspectSequenceV2B(options: { projectRoot: string; sequenceRoot: string }): SequenceInspectResultV2B {
	const errors = validateRunRootBoundary(options.sequenceRoot);
	const manifest = safeRead<ExecutionManifestV2B>(options.sequenceRoot, "manifest.json", errors);
	const terminal = existsSync(resolve(options.sequenceRoot, "terminal.json")) ? safeRead<SequenceTerminalV2B>(options.sequenceRoot, "terminal.json", errors) : null;
	const ledger = readSequenceLedger(options.sequenceRoot, errors);
	const result = (): SequenceInspectResultV2B => ({ schema_version: "v2b-sequence-inspection-v1", sequence_id: manifest?.sequence_id ?? null, integrity_valid: errors.length === 0, terminal_valid: terminal !== null && errors.length === 0, errors, manifest, ledger, terminal });
	if (!manifest) return result();
	const { manifest_id: manifestId, ...body } = manifest;
	const expectedCases = V2B_FROZEN_CASES.map((entry, index) => ({ ...entry, ordinal: index + 1, planned_run_id: `${manifest.sequence_id}-${entry.case_id}-run` }));
	if (
		manifest.schema_version !== "v2b-execution-manifest-v1" || digestObject(body) !== manifestId ||
		!["stage2_deterministic_proof", "stage2_real"].includes(manifest.stage) || manifest.pi_commit !== V2B_PINNED_PI_COMMIT || manifest.provider_profile_id !== V2B_MODEL_PROFILE_ID ||
		manifest.credential_profile_name !== V2B_CREDENTIAL_PROFILE || manifest.skill_id !== V2B_SKILL_ID || manifest.tool_profile_id !== V2B_TOOL_PROFILE_ID || manifest.policy_id !== V2B_POLICY_ID ||
		stableJson(manifest.planned_cases) !== stableJson(expectedCases) || stableJson(manifest.budgets) !== stableJson({ attempt: V2B_ATTEMPT_CAPS, group: V2B_GROUP_CAPS, sequence: V2B_SEQUENCE_CAPS }) ||
		manifest.real_execution_authorized !== (manifest.stage === "stage2_real") || manifest.retry !== false || manifest.fallback !== false || manifest.replacement !== false
	) errors.push("V2-B Sequence Manifest frozen identity mismatch");
	const live = treeInventory(resolve(options.projectRoot, "workbench/src"));
	if (stableJson(live) !== stableJson(manifest.workbench_source_inventory) || digestObject(live) !== manifest.workbench_source_digest) errors.push("V2-B Sequence source drift");
	if (terminal) {
		if (terminal.schema_version !== "v2b-sequence-terminal-v1" || terminal.manifest_id !== manifest.manifest_id || terminal.sequence_id !== manifest.sequence_id) errors.push("V2-B Sequence terminal identity mismatch");
		addRefErrors(options.sequenceRoot, "V2-B Sequence ledger", terminal.ledger_ref, errors);
		if (terminal.ledger_ref.path !== "ledger.jsonl") errors.push("V2-B Sequence ledger path mismatch");
	}
	const planned = ledger.slice(0, 3);
	if (planned.length !== 3 || planned.some((entry, index) => entry.state !== "planned" || entry.case_id !== manifest.planned_cases[index]!.case_id || entry.planned_run_id !== manifest.planned_cases[index]!.planned_run_id)) errors.push("V2-B Sequence did not predeclare the frozen three Cases");
	const seenAttempts = new Set<string>();
	const runTerminals = new Map<CaseIdV2B, RunTerminalV2B>();
	const casePauses = new Map<CaseIdV2B, CasePauseV2B>();
	const terminalLedgerRefs: ArtifactRefV0B[] = [];
	const pauseLedgerRefs: ArtifactRefV0B[] = [];
	const expectedReservation = { ...emptyUsage(), provider_requests: V2B_ATTEMPT_CAPS.provider_requests, tool_calls: V2B_ATTEMPT_CAPS.tool_calls, tokens: V2B_ATTEMPT_CAPS.tokens, active_execution_time_ms: V2B_ATTEMPT_CAPS.active_execution_time_ms, verifier_runs: V2B_ATTEMPT_CAPS.verifier_runs, real_cost_usd: V2B_ATTEMPT_CAPS.real_cost_usd };
	for (const [index, entry] of ledger.entries()) {
		if (entry.schema_version !== "v2b-sequence-ledger-v1" || entry.seq !== index + 1 || entry.manifest_id !== manifest.manifest_id || entry.sequence_id !== manifest.sequence_id) errors.push(`V2-B Sequence ledger identity/sequence mismatch at ${index + 1}`);
		const declared = manifest.planned_cases.find((value) => value.case_id === entry.case_id);
		if (!declared || entry.planned_run_id !== declared.planned_run_id) errors.push(`V2-B Sequence foreign Case/Run at ${index + 1}`);
		if (entry.attempt_id) {
			if (seenAttempts.has(entry.attempt_id)) errors.push("V2-B Sequence duplicate Attempt start");
			seenAttempts.add(entry.attempt_id);
			if (entry.state !== "started" || entry.attempt_role === null || entry.run_terminal_ref || entry.case_pause_ref || stableJson(entry.reserved_usage) !== stableJson(expectedReservation) || stableJson(entry.actual_usage) !== stableJson(emptyUsage()) || stableJson(entry.real_call_counters) !== stableJson(ZERO_COUNTERS_V2B)) errors.push("V2-B Sequence Attempt reservation mismatch");
		}
		if (entry.state === "terminal") {
			if (!entry.run_terminal_ref || entry.case_pause_ref || !addRefErrors(options.sequenceRoot, `V2-B ${entry.case_id} terminal`, entry.run_terminal_ref, errors)) continue;
			terminalLedgerRefs.push(entry.run_terminal_ref);
			const run = safeRead<RunTerminalV2B>(options.sequenceRoot, entry.run_terminal_ref.path, errors);
			if (!run) continue;
			runTerminals.set(entry.case_id, run);
			const runRoot = resolve(options.sequenceRoot, "runs", entry.planned_run_id);
			const runInspection = inspectStage1RunV2B({ projectRoot: options.projectRoot, runRoot, executionManifest: manifest });
			if (!runInspection.integrity_valid) errors.push(...runInspection.errors.map((value) => `${entry.case_id}: ${value}`));
			if (run.case_id !== entry.case_id || run.run_id !== entry.planned_run_id || stableJson(run.usage) !== stableJson(entry.actual_usage) || stableJson(run.real_call_counters) !== stableJson(entry.real_call_counters)) errors.push(`V2-B ${entry.case_id} Run/ledger reconciliation mismatch`);
			if (run.real_call_counters.credential_reads !== (manifest.stage === "stage2_real" ? 1 : 0)) errors.push(`V2-B ${entry.case_id} Credential resolution count mismatch`);
			const attemptStarts = ledger.filter((value) => value.case_id === entry.case_id && value.attempt_id !== null);
			const persistedAttempts: AttemptRuntimeEvidenceV2B[] = [];
			for (const ref of run.attempt_evidence_refs) {
				if (!addRefErrors(runRoot, `V2-B ${entry.case_id} Attempt`, ref, errors)) continue;
				const attempt = safeRead<AttemptRuntimeEvidenceV2B>(runRoot, ref.path, errors);
				if (attempt) persistedAttempts.push(attempt);
			}
			if (persistedAttempts.length !== attemptStarts.length || persistedAttempts.some((attempt, attemptIndex) => attempt.attempt_id !== attemptStarts[attemptIndex]?.attempt_id || attempt.role !== attemptStarts[attemptIndex]?.attempt_role)) errors.push(`V2-B ${entry.case_id} ledger/Attempt one-to-one order mismatch`);
		}
		if (entry.state === "paused") {
			if (!entry.case_pause_ref || entry.run_terminal_ref || !addRefErrors(options.sequenceRoot, `V2-B ${entry.case_id} Pause`, entry.case_pause_ref, errors)) continue;
			pauseLedgerRefs.push(entry.case_pause_ref);
			const pause = safeRead<CasePauseV2B>(options.sequenceRoot, entry.case_pause_ref.path, errors);
			if (!pause) continue;
			casePauses.set(entry.case_id, pause);
			const attemptStarts = ledger.filter((value) => value.case_id === entry.case_id && value.attempt_id !== null).map((value) => ({ attempt_id: value.attempt_id!, role: value.attempt_role! }));
			const providerRequests = Math.max(pause.actual_usage.provider_requests, pause.real_call_counters.external_provider_calls);
			const zeroDispatch = providerRequests === 0 && pause.real_call_counters.network_calls === 0 && pause.real_call_counters.external_provider_calls === 0 && pause.real_call_counters.real_model_calls === 0;
			if (
				pause.schema_version !== "v2b-case-pause-v1" || pause.manifest_id !== manifest.manifest_id || pause.sequence_id !== manifest.sequence_id ||
				pause.execution_baseline_commit !== manifest.execution_baseline_commit || pause.execution_baseline_tree !== manifest.execution_baseline_tree || pause.workbench_source_digest !== manifest.workbench_source_digest ||
				pause.case_id !== entry.case_id || pause.run_id !== entry.planned_run_id || pause.reason !== "execution_boundary" || pause.evidence_valid !== true || pause.provider_requests !== providerRequests ||
				pause.phase !== (zeroDispatch ? "pre_dispatch" : "post_dispatch_or_invalid") || pause.contingency_eligible !== (entry.case_id === "primary_positive" && zeroDispatch) ||
				stableJson(pause.attempts) !== stableJson(attemptStarts) || stableJson(pause.actual_usage) !== stableJson(entry.actual_usage) || stableJson(pause.real_call_counters) !== stableJson(entry.real_call_counters)
			) errors.push(`V2-B ${entry.case_id} Case Pause evidence mismatch`);
		}
	}
	for (const plannedCase of manifest.planned_cases) {
		const entries = ledger.filter((entry) => entry.case_id === plannedCase.case_id);
		if (entries[0]?.state !== "planned" || entries.filter((entry) => entry.state === "planned").length !== 1) { errors.push(`V2-B ${plannedCase.case_id} planned transition mismatch`); continue; }
		const transitions = entries.slice(1);
		if (transitions.length === 0) continue;
		if (transitions.length === 1 && transitions[0]!.state === "skipped") {
			if (plannedCase.case_id !== "contingency_positive" || transitions[0]!.attempt_id || transitions[0]!.run_terminal_ref || transitions[0]!.case_pause_ref) errors.push(`V2-B ${plannedCase.case_id} invalid skipped transition`);
			continue;
		}
		if (transitions[0]!.state !== "started" || transitions[0]!.attempt_id !== null || transitions[0]!.reason !== null || transitions[0]!.run_terminal_ref || transitions[0]!.case_pause_ref) errors.push(`V2-B ${plannedCase.case_id} Case start transition mismatch`);
		const final = transitions.at(-1)!;
		if (!['terminal', 'paused'].includes(final.state) || final.attempt_id !== null) errors.push(`V2-B ${plannedCase.case_id} missing terminal/Pause transition`);
		if (transitions.slice(1, -1).some((entry) => entry.state !== "started" || entry.attempt_id === null)) errors.push(`V2-B ${plannedCase.case_id} invalid Attempt transition order`);
		if (transitions.slice(0, -1).some((entry) => entry.state === "terminal" || entry.state === "paused" || entry.state === "skipped")) errors.push(`V2-B ${plannedCase.case_id} entry after terminal transition`);
		const attemptStarts = entries.filter((entry) => entry.attempt_id !== null).map((entry) => ({ attempt_id: entry.attempt_id!, role: entry.attempt_role! }));
		const expectedAttempts = [
			{ attempt_id: `${plannedCase.planned_run_id}-primary-attempt-01`, role: "primary" as const },
			{ attempt_id: `${plannedCase.planned_run_id}-recovery-group-01-candidate-a-attempt-01`, role: "continue_failed_session" as const },
			{ attempt_id: `${plannedCase.planned_run_id}-recovery-group-01-candidate-b-attempt-01`, role: "fresh_session_from_failure_seed" as const },
		].slice(0, attemptStarts.length);
		if (stableJson(attemptStarts) !== stableJson(expectedAttempts)) errors.push(`V2-B ${plannedCase.case_id} foreign/wrong-role Attempt start`);
	}
	const primaryRun = runTerminals.get("primary_positive");
	const contingencyRun = runTerminals.get("contingency_positive");
	const primaryPause = casePauses.get("primary_positive");
	const contingencySkip = ledger.find((entry) => entry.case_id === "contingency_positive" && entry.state === "skipped");
	const contingencyStarted = ledger.some((entry) => entry.case_id === "contingency_positive" && entry.state === "started" && entry.attempt_id === null);
	const contingencyAuthorized = primaryRun?.outcome === "initial_pass" || primaryPause?.contingency_eligible === true;
	if (contingencyStarted && !contingencyAuthorized) errors.push("V2-B Contingency activated outside the frozen rule");
	if (contingencySkip && contingencyAuthorized) errors.push("V2-B Contingency skipped despite activation");
	const positiveTriggered = [primaryRun, contingencyRun].some((run) => run && run.outcome !== "initial_pass");
	const negativeRun = runTerminals.get("negative");
	const negativeStarted = ledger.some((entry) => entry.case_id === "negative" && entry.state === "started" && entry.attempt_id === null);
	if (negativeStarted && !positiveTriggered) errors.push("V2-B Negative started without a valid Positive");
	const reserved = sumUsageForInspection(ledger.map((entry) => entry.reserved_usage));
	const actual = sumUsageForInspection(ledger.map((entry) => entry.actual_usage));
	const counters = ledger.filter((entry) => entry.attempt_id === null && (entry.state === "terminal" || entry.state === "paused")).reduce((acc, entry) => { for (const key of Object.keys(acc) as Array<keyof RealCallCountersV2B>) acc[key] += entry.real_call_counters[key]; return acc; }, { ...ZERO_COUNTERS_V2B });
	if (seenAttempts.size > V2B_SEQUENCE_CAPS.started_attempts || reserved.provider_requests > V2B_SEQUENCE_CAPS.provider_requests || reserved.tool_calls > V2B_SEQUENCE_CAPS.tool_calls || reserved.tokens > V2B_SEQUENCE_CAPS.tokens || reserved.active_execution_time_ms > V2B_SEQUENCE_CAPS.active_execution_time_ms || reserved.verifier_runs > V2B_SEQUENCE_CAPS.verifier_runs || reserved.real_cost_usd > V2B_SEQUENCE_CAPS.real_cost_usd + Number.EPSILON || counters.credential_reads > V2B_SEQUENCE_CAPS.credential_reads) errors.push("V2-B whole-sequence cap exceeded");
	for (const caseId of V2B_FROZEN_CASES.map((entry) => entry.case_id)) if (ledger.filter((entry) => entry.case_id === caseId && entry.attempt_id).length > V2B_GROUP_CAPS.attempts_exact_on_valid_failure) errors.push(`V2-B ${caseId} Group Attempt cap exceeded`);
	if (terminal) {
		if (stableJson(terminal.case_terminal_refs) !== stableJson(terminalLedgerRefs) || stableJson(terminal.case_pause_refs) !== stableJson(pauseLedgerRefs)) errors.push("V2-B Sequence terminal Case refs mismatch");
		if (seenAttempts.size !== terminal.started_attempts || stableJson(reserved) !== stableJson(terminal.reserved_usage) || stableJson(actual) !== stableJson(terminal.actual_usage) || stableJson(counters) !== stableJson(terminal.real_call_counters)) errors.push("V2-B Sequence terminal aggregate mismatch");
		let expectedStatus: SequenceTerminalV2B["status"] = "paused";
		let expectedReason: SequenceTerminalV2B["reason"] = "run_invalid";
		if (positiveTriggered && negativeRun?.outcome === "initial_pass") { expectedStatus = "completed"; expectedReason = "sequence_completed"; }
		else if (!positiveTriggered && (contingencyRun?.outcome === "initial_pass" || casePauses.has("contingency_positive"))) expectedReason = "positive_not_triggered";
		else if (positiveTriggered && (casePauses.has("negative") || negativeRun && negativeRun.outcome !== "initial_pass")) expectedReason = "negative_not_valid";
		if (terminal.status !== expectedStatus || terminal.reason !== expectedReason) errors.push("V2-B Sequence terminal status/reason mismatch");
	}
	scanEvidence(options.sequenceRoot, errors);
	return result();
}

function sumUsageForInspection(values: readonly UsageV2B[]): UsageV2B {
	const result = emptyUsage();
	for (const value of values) addUsage(result, value);
	return result;
}
