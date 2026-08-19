import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { ArtifactRefV0B } from "../contracts/v0b-types.ts";
import type { RunManifestV2A } from "../contracts/v2-types.ts";
import type {
	EvidenceConfirmationReceiptV37,
	RecoveryComparisonArmV37,
	RecoveryEvidenceSubmissionRequestV37,
	RegisteredRecoveryAdmissionV37,
	RegisteredRecoveryComparisonV37,
	RegisteredRecoveryEvidenceBodyV37,
} from "../contracts/v37-types.ts";
import { artifactRef, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, fileSha256, stableJson } from "../hash.ts";
import { inspectRunV2A } from "../inspect-v2.ts";
import { V2A_STRATEGY_ORDER } from "../contracts/v2-types.ts";
import { v37G3ADataRootPath, loadPrimaryRunBindingV37G3A, loadWorkflowRegistrationV37G3A } from "./workflow-registration-v37g3a.ts";

const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;

function without<T extends Record<string, unknown>, K extends keyof T>(value: T, key: K): Omit<T, K> {
	const clone = { ...value };
	delete clone[key];
	return clone;
}

function ordinaryJson<T>(path: string, label: string): T {
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`${label} must be an ordinary singly linked file`);
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

const FORMAL_RECOVERY_FILES = new Set(["comparison.json", "evidence.json", "confirmation.json", "request.json", "admission.json"]);

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function formalRecoveryPath(root: string, workflowId: string, fileName: string, requireFile: boolean): string {
	if (!ID.test(workflowId) || !FORMAL_RECOVERY_FILES.has(fileName)) throw new Error("formal Recovery artifact identity invalid");
	const trustedRoot = resolve(root);
	const recoveryRoot = resolve(trustedRoot, "workflows", workflowId, "recovery");
	const target = resolve(recoveryRoot, fileName);
	if (!contained(trustedRoot, target)) throw new Error("formal Recovery artifact escapes trusted data root");
	const rootStats = lstatSync(trustedRoot);
	if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) throw new Error("formal Recovery trusted root must be an ordinary directory");
	let cursor = trustedRoot;
	for (const segment of relative(trustedRoot, recoveryRoot).split(sep).filter(Boolean)) {
		cursor = resolve(cursor, segment);
		if (!existsSync(cursor)) {
			if (!requireFile && cursor === recoveryRoot) break;
			throw new Error("formal Recovery path component is missing");
		}
		const stats = lstatSync(cursor);
		if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error("formal Recovery path contains a symlink, junction, reparse point or non-directory");
	}
	if (existsSync(recoveryRoot) && !contained(realpathSync.native(trustedRoot), realpathSync.native(recoveryRoot))) throw new Error("formal Recovery real path escapes trusted data root");
	if (existsSync(target)) {
		const stats = lstatSync(target);
		if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("formal Recovery artifact must be an ordinary singly linked file");
		if (!contained(realpathSync.native(trustedRoot), realpathSync.native(target))) throw new Error("formal Recovery artifact real path escapes trusted data root");
	} else if (requireFile) {
		throw new Error("formal Recovery artifact is missing");
	}
	return target;
}

function readFormalRecoveryJson<T>(root: string, workflowId: string, fileName: string, _label: string): T {
	return JSON.parse(readFileSync(formalRecoveryPath(root, workflowId, fileName, true), "utf8")) as T;
}

function persistFormalRecoveryJson(root: string, workflowId: string, fileName: string, value: unknown): void {
	const target = formalRecoveryPath(root, workflowId, fileName, false);
	const expected = `${stableJson(value)}\n`;
	if (existsSync(target)) {
		if (readFileSync(target, "utf8") !== expected) throw new Error("write-once V3.7 artifact identity conflict");
		return;
	}
	writeOnceJson(root, `workflows/${workflowId}/recovery/${fileName}`, value);
	formalRecoveryPath(root, workflowId, fileName, true);
}

function strategyDigest(manifest: ReturnType<typeof loadWorkflowRegistrationV37G3A>["loadedCase"]["manifest"], strategyId: string): string {
	if (strategyId === V2A_STRATEGY_ORDER[0]) return manifest.recovery_a_strategy_spec.spec_digest;
	if (strategyId === V2A_STRATEGY_ORDER[1]) return manifest.recovery_b_strategy_spec.spec_digest;
	throw new Error("unregistered Recovery strategy");
}

function uniqueRefs(refs: ArtifactRefV0B[]): ArtifactRefV0B[] {
	const byPath = new Map<string, ArtifactRefV0B>();
	for (const ref of refs) {
		const prior = byPath.get(ref.path);
		if (prior && stableJson(prior) !== stableJson(ref)) throw new Error("source Artifact path identity conflict");
		byPath.set(ref.path, structuredClone(ref));
	}
	return [...byPath.values()].sort((left, right) => left.path.localeCompare(right.path));
}

function inspectorFingerprint(projectRoot: string): string {
	return digestObject([
		"workbench/src/v37/host-registry-v37g3a.ts",
		"workbench/src/v37/workflow-registration-v37g3a.ts",
		"workbench/src/v37/registered-recovery-v37g3a.ts",
		"workbench/src/inspect-v37g3a.ts",
	].map((path) => ({ path, sha256: fileSha256(resolve(projectRoot, path)) })));
}

function requireRegisteredV2Execution(manifest: RunManifestV2A, registered: ReturnType<typeof loadWorkflowRegistrationV37G3A>): void {
	const registeredManifest = registered.loadedCase.manifest;
	const task = registeredManifest.primary_task_spec.body as Record<string, unknown>;
	const verifier = registeredManifest.primary_verifier_spec.body as Record<string, unknown>;
	const provider = registeredManifest.provider_profile_spec.body as Record<string, unknown>;
	const tool = registeredManifest.tool_profile_spec.body as Record<string, unknown>;
	const budget = registeredManifest.budget_profile_spec.body as Record<string, unknown>;
	const recoveryA = registeredManifest.recovery_a_strategy_spec.body as Record<string, unknown>;
	const recoveryB = registeredManifest.recovery_b_strategy_spec.body as Record<string, unknown>;
	if (manifest.task_id !== task.task_id || manifest.task_instruction_sha256 !== task.instruction_sha256) throw new Error("V2 Primary task does not match registered task identity");
	if (manifest.verifier_id !== verifier.verifier_id || manifest.verifier_sha256 !== verifier.source_sha256) throw new Error("V2 Primary Verifier does not match registered Verifier identity");
	if (manifest.model_id !== provider.model_id || manifest.execution_port_kind !== "internal_deterministic" || manifest.real_execution_authorized !== false || provider.real_access !== false) throw new Error("V2 Provider profile does not match registered deterministic profile");
	if (manifest.tool_profile_id !== tool.tool_profile_id || manifest.tool_profile_digest !== tool.v2_tool_profile_digest) throw new Error("V2 Tool profile does not match registered profile");
	if (stableJson(manifest.strategy_ids) !== stableJson([recoveryA.strategy_id, recoveryB.strategy_id]) || manifest.recovery_candidate_count_on_valid_failure !== 2) throw new Error("V2 Recovery strategies do not match registered Comparison membership");
	const expectedGroupBudget = { candidate_paths_exact_on_valid_failure: budget.candidate_paths_exact, faux_provider_dispatches_max: budget.provider_dispatches_max, tool_calls_max: budget.tool_calls_max, verifier_runs_max: budget.verifier_runs_max, real_cost_usd: budget.real_cost_usd };
	if (stableJson(manifest.per_group_budget) !== stableJson(expectedGroupBudget)) throw new Error("V2 Recovery budget does not match registered budget profile");
	if (manifest.base_prompt_sha256 !== registeredManifest.state_store_scope_spec.runtime_base_prompt_digest) throw new Error("V2 Base Prompt does not match registered runtime Base identity");
}

type RecoveryPackageOptionsV37 = { projectRoot: string; dataRoot: string; workflowId: string; runRoot: string; confirmedAt: string; requestedAt: string };

function deriveRegisteredRecoveryPackageCoreV37G3A(options: RecoveryPackageOptionsV37, allowHistoricalReadOnly: boolean): {
	comparison: RegisteredRecoveryComparisonV37;
	evidence: RegisteredRecoveryEvidenceBodyV37;
	confirmation: EvidenceConfirmationReceiptV37;
	request: RecoveryEvidenceSubmissionRequestV37;
} {
	if (!ID.test(options.workflowId) || Number.isNaN(Date.parse(options.confirmedAt)) || Number.isNaN(Date.parse(options.requestedAt))) throw new Error("Recovery package workflow/timestamp invalid");
	const registered = loadWorkflowRegistrationV37G3A({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId, allowHistoricalReadOnly });
	const primaryRunBinding = loadPrimaryRunBindingV37G3A({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId, runRoot: options.runRoot, allowHistoricalReadOnly });
	const inspected = inspectRunV2A({ projectRoot: options.projectRoot, runRoot: options.runRoot });
	if (!inspected.integrity_valid || !inspected.terminal_valid || !inspected.terminal || !inspected.recovery_seed || inspected.candidates.length !== 2 || !inspected.selection) throw new Error(`V2 Recovery truth rejected: ${inspected.errors.join("; ") || "incomplete recovery episode"}`);
	if (!(["recovery_selected", "recovery_none"] as const).includes(inspected.terminal.outcome as "recovery_selected" | "recovery_none") || inspected.terminal.primary_verifier_status !== "failed") throw new Error("registered recovery evidence requires a terminal comparison after Primary verifier failure");
	const v2Manifest = ordinaryJson<RunManifestV2A>(resolve(options.runRoot, "config/manifest.json"), "V2 Run Manifest");
	if (primaryRunBinding.primary_run_id !== v2Manifest.run_id || primaryRunBinding.primary_run_id !== inspected.terminal.run_id) throw new Error("Primary Run binding ID mismatch");
	requireRegisteredV2Execution(v2Manifest, registered);
	if (inspected.recovery_seed.task_id !== v2Manifest.task_id || inspected.recovery_seed.tool_profile_digest !== v2Manifest.tool_profile_digest) throw new Error("V2 Recovery Seed/Manifest identity mismatch");
	const ordered = [...inspected.candidates].sort((left, right) => V2A_STRATEGY_ORDER.indexOf(left.strategy_id) - V2A_STRATEGY_ORDER.indexOf(right.strategy_id));
	if (ordered[0]!.strategy_id !== V2A_STRATEGY_ORDER[0] || ordered[1]!.strategy_id !== V2A_STRATEGY_ORDER[1] || ordered.some((candidate) => !candidate.evidence_valid || !candidate.hard_gates.lineage_complete || !candidate.hard_gates.identity_complete) || ordered[0]!.initial_workspace_digest !== inspected.recovery_seed.failed_workspace_snapshot_digest || ordered[1]!.initial_workspace_digest !== inspected.recovery_seed.failed_workspace_snapshot_digest || ordered[0]!.common_artifact_digest !== ordered[1]!.common_artifact_digest) throw new Error("Recovery arms fail registered isolation/common-evidence gates");
	const arms = ordered.map((candidate): RecoveryComparisonArmV37 => ({
		candidate_path_id: candidate.candidate_path_id,
		strategy_id: candidate.strategy_id,
		strategy_digest: strategyDigest(registered.loadedCase.manifest, candidate.strategy_id),
		workspace_digest: candidate.final_workspace_digest,
		terminal_artifact_digest: digestObject(candidate),
		verifier_artifact_digest: candidate.verifier_result_ref.sha256,
	})) as [RecoveryComparisonArmV37, RecoveryComparisonArmV37];
	const selected = ordered.find((candidate) => candidate.candidate_path_id === inspected.selection!.selected_candidate_id);
	if (inspected.terminal.outcome === "recovery_selected" && (!selected || selected.verifier_status !== "passed" || !selected.hard_gates.verifier_passed)) throw new Error("registered Comparison selected no valid improvement arm");
	if (inspected.terminal.outcome === "recovery_none" && (selected || inspected.selection.selected_candidate_id !== null || inspected.selection.eligible_candidate_ids.length !== 0)) throw new Error("registered no-valid-recovery Comparison is inconsistent");
	const decisionResult = selected ? "selected" as const : "no_valid_recovery" as const;
	const comparisonSeed = {
		workflow_registration_digest: registered.workflow.workflow_registration_digest,
		primary_run_id: inspected.terminal.run_id,
		recovery_group_id: inspected.recovery_seed.recovery_group_id,
		recovery_seed_id: inspected.recovery_seed.recovery_seed_id,
		arms,
		comparison_profile_digest: registered.loadedCase.manifest.comparison_profile_spec.spec_digest,
	};
	const comparisonId = `comparison-${digestObject(comparisonSeed).slice(0, 32)}`;
	const comparisonBody: Omit<RegisteredRecoveryComparisonV37, "comparison_decision_digest"> = {
		schema_version: 1,
		kind: "v37_registered_recovery_comparison",
		comparison_decision_id: comparisonId,
		workflow_id: registered.workflow.workflow_id,
		workflow_registration_digest: registered.workflow.workflow_registration_digest,
		primary_run_id: inspected.terminal.run_id,
		recovery_group_id: inspected.recovery_seed.recovery_group_id,
		recovery_seed_id: inspected.recovery_seed.recovery_seed_id,
		arms,
		comparison_profile_digest: registered.loadedCase.manifest.comparison_profile_spec.spec_digest,
		selector_implementation_version: "v2a-selector-derived-v1",
		decision_result: decisionResult,
		selected_candidate_path_id: selected?.candidate_path_id ?? null,
		decision_reason: [...inspected.selection.comparison_reason],
	};
	const comparison = { ...comparisonBody, comparison_decision_digest: digestObject(comparisonBody) };
	const refs = uniqueRefs([
		artifactRef(options.runRoot, "config/manifest.json", "application/json", false),
		v2Manifest.task_instruction_ref,
		v2Manifest.verifier_ref,
		artifactRef(options.runRoot, "terminal.json", "application/json", false),
		inspected.terminal.recovery_seed_ref!,
		...inspected.terminal.candidate_refs,
		inspected.terminal.selection_ref!,
		inspected.terminal.primary_verifier_result_ref,
		...ordered.map((candidate) => candidate.verifier_result_ref),
	]);
	const problemBody = registered.loadedCase.manifest.problem_trigger_spec.body as { failure_family?: unknown };
	if (problemBody.failure_family !== "verifier-failure") throw new Error("registered Primary problem trigger is invalid");
	const evidenceBody: Omit<RegisteredRecoveryEvidenceBodyV37, "evidence_body_digest"> = {
		schema_version: 1,
		family: "v37_registered_recovery_learning_episode",
		case_id: registered.workflow.case_id,
		manifest_body_digest: registered.workflow.manifest_body_digest,
		case_registration_digest: registered.workflow.registration_digest,
		workflow_id: registered.workflow.workflow_id,
		workflow_registration_digest: registered.workflow.workflow_registration_digest,
		primary_task_instance_digest: registered.primary.task_instance_digest,
		primary_run_id: inspected.terminal.run_id,
		primary_source_workspace_digest: inspected.recovery_seed.failed_workspace_snapshot_digest,
		primary_terminal_artifact_digest: artifactRef(options.runRoot, "terminal.json", "application/json", false).sha256,
		primary_verifier_artifact_digest: inspected.terminal.primary_verifier_result_ref.sha256,
		primary_problem_class: problemBody.failure_family,
		recovery_group_id: inspected.recovery_seed.recovery_group_id,
		recovery_seed_id: inspected.recovery_seed.recovery_seed_id,
		common_verifier_digest: registered.loadedCase.manifest.primary_verifier_spec.spec_digest,
		arms,
		comparison_decision_id: comparison.comparison_decision_id,
		comparison_decision_digest: comparison.comparison_decision_digest,
		provider_profile_digest: registered.workflow.provider_profile_digest,
		tool_profile_digest: registered.workflow.tool_profile_digest,
		command_profile_digest: registered.workflow.command_profile_digest,
		budget_profile_digest: registered.workflow.budget_profile_digest,
		stop_condition_profile_digest: registered.workflow.stop_condition_profile_digest,
		source_artifact_refs: refs,
	};
	const evidence = { ...evidenceBody, evidence_body_digest: digestObject(evidenceBody) };
	const confirmationSeed = { workflow_id: registered.workflow.workflow_id, workflow_registration_digest: registered.workflow.workflow_registration_digest, evidence_body_digest: evidence.evidence_body_digest, action_id: "confirm_registered_recovery_evidence" as const, confirmed_at: options.confirmedAt };
	const confirmationId = `confirmation-${digestObject(confirmationSeed).slice(0, 32)}`;
	const confirmationBody: Omit<EvidenceConfirmationReceiptV37, "confirmation_receipt_digest"> = { schema_version: 1, kind: "v37_recovery_evidence_confirmation_receipt", ...confirmationSeed, confirmation_receipt_id: confirmationId };
	const confirmation: EvidenceConfirmationReceiptV37 = { ...confirmationBody, confirmation_receipt_digest: digestObject(confirmationBody) };
	const requestBody: Omit<RecoveryEvidenceSubmissionRequestV37, "submission_request_digest"> = { schema_version: 1, kind: "v37_recovery_evidence_submission_request", workflow_id: registered.workflow.workflow_id, workflow_registration_digest: registered.workflow.workflow_registration_digest, evidence_body_digest: evidence.evidence_body_digest, confirmation_receipt_id: confirmation.confirmation_receipt_id, confirmation_receipt_digest: confirmation.confirmation_receipt_digest, requested_at: options.requestedAt };
	const request = { ...requestBody, submission_request_digest: digestObject(requestBody) };
	return { comparison, evidence, confirmation, request };
}

export function deriveRegisteredRecoveryPackageV37G3A(options: RecoveryPackageOptionsV37): ReturnType<typeof deriveRegisteredRecoveryPackageCoreV37G3A> {
	return deriveRegisteredRecoveryPackageCoreV37G3A(options, false);
}

export function persistRegisteredRecoveryPackageV37G3A(options: { projectRoot: string; dataRoot: string; workflowId: string; runRoot: string; confirmedAt: string; requestedAt: string }): ReturnType<typeof deriveRegisteredRecoveryPackageV37G3A> {
	const packageValue = deriveRegisteredRecoveryPackageV37G3A(options);
	const root = v37G3ADataRootPath(options.projectRoot, options.dataRoot);
	persistFormalRecoveryJson(root, options.workflowId, "comparison.json", packageValue.comparison);
	persistFormalRecoveryJson(root, options.workflowId, "evidence.json", packageValue.evidence);
	persistFormalRecoveryJson(root, options.workflowId, "confirmation.json", packageValue.confirmation);
	persistFormalRecoveryJson(root, options.workflowId, "request.json", packageValue.request);
	return packageValue;
}

function buildOpportunity(evidence: RegisteredRecoveryEvidenceBodyV37, comparison: RegisteredRecoveryComparisonV37, taskKind: string): import("../contracts/v3-types.ts").ImprovementOpportunityV3 {
	const base = {
		schema_version: 1 as const,
		trigger: "hard_failure" as const,
		source_run_ids: [evidence.primary_run_id],
		evidence_identity: { evidence_id: `evidence-${evidence.evidence_body_digest.slice(0, 32)}`, evidence_digest: evidence.evidence_body_digest },
		evidence_refs: structuredClone(evidence.source_artifact_refs),
		observations: {
			primary_problem_class: evidence.primary_problem_class,
			recovery_a_candidate_path_id: comparison.arms[0].candidate_path_id,
			recovery_a_strategy_id: comparison.arms[0].strategy_id,
			recovery_b_candidate_path_id: comparison.arms[1].candidate_path_id,
			recovery_b_strategy_id: comparison.arms[1].strategy_id,
			selected_candidate_path_id: comparison.selected_candidate_path_id!,
		},
		derivation: "deterministic_projection" as const,
		task_context: { task_kind: taskKind, failure_family: evidence.primary_problem_class },
	};
	return { ...base, opportunity_id: `opp-${digestObject(base).slice(0, 32)}` };
}

export function admitRegisteredRecoveryV37G3A(options: { projectRoot: string; dataRoot: string; workflowId: string; runRoot: string; confirmedAt: string; requestedAt: string }): RegisteredRecoveryAdmissionV37 {
	const expected = deriveRegisteredRecoveryPackageV37G3A(options);
	const root = v37G3ADataRootPath(options.projectRoot, options.dataRoot);
	const comparison = readFormalRecoveryJson<RegisteredRecoveryComparisonV37>(root, options.workflowId, "comparison.json", "registered Comparison");
	const evidence = readFormalRecoveryJson<RegisteredRecoveryEvidenceBodyV37>(root, options.workflowId, "evidence.json", "Recovery Evidence Body");
	const confirmation = readFormalRecoveryJson<EvidenceConfirmationReceiptV37>(root, options.workflowId, "confirmation.json", "Recovery confirmation");
	const request = readFormalRecoveryJson<RecoveryEvidenceSubmissionRequestV37>(root, options.workflowId, "request.json", "Recovery submission request");
	if (stableJson({ comparison, evidence, confirmation, request }) !== stableJson(expected)) throw new Error("Recovery package recomputation mismatch");
	if (digestObject(without(comparison as unknown as Record<string, unknown>, "comparison_decision_digest")) !== comparison.comparison_decision_digest || digestObject(without(evidence as unknown as Record<string, unknown>, "evidence_body_digest")) !== evidence.evidence_body_digest || digestObject(without(confirmation as unknown as Record<string, unknown>, "confirmation_receipt_digest")) !== confirmation.confirmation_receipt_digest || digestObject(without(request as unknown as Record<string, unknown>, "submission_request_digest")) !== request.submission_request_digest) throw new Error("Recovery package digest invalid");
	const registered = loadWorkflowRegistrationV37G3A({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId });
	const policy = registered.loadedCase.manifest.candidate_policy_spec.body;
	if (policy.candidate_type !== "prompt_addendum") throw new Error("registered Candidate policy is not prompt-only");
	const opportunity = comparison.decision_result === "selected" ? buildOpportunity(evidence, comparison, registered.loadedCase.manifest.state_applicability.task_kinds[0]!) : null;
	const result = comparison.decision_result === "selected" ? "admitted" as const : "rejected" as const;
	const reasons = result === "admitted" ? [] : ["no_valid_recovery"];
	const inventoryDigest = digestObject(evidence.source_artifact_refs);
	const seed = { workflow_registration_digest: registered.workflow.workflow_registration_digest, evidence_body_digest: evidence.evidence_body_digest, submission_request_digest: request.submission_request_digest };
	const body: Omit<RegisteredRecoveryAdmissionV37, "admission_digest"> = {
		schema_version: 1,
		kind: "v37_registered_recovery_admission",
		admission_id: `admission-${digestObject(seed).slice(0, 32)}`,
		workflow_id: registered.workflow.workflow_id,
		workflow_registration_digest: registered.workflow.workflow_registration_digest,
		manifest_body_digest: registered.workflow.manifest_body_digest,
		case_registration_digest: registered.workflow.registration_digest,
		registry_trust_root_digest: registered.workflow.registry_trust_root_digest,
		evidence_body_digest: evidence.evidence_body_digest,
		submission_request_digest: request.submission_request_digest,
		comparison_decision_digest: comparison.comparison_decision_digest,
		inspector_id: "inspect-v37g1-registered-recovery-v1",
		inspector_fingerprint: inspectorFingerprint(options.projectRoot),
		result,
		reasons,
		source_inventory_digest: inventoryDigest,
		opportunity,
	};
	const admission = { ...body, admission_digest: digestObject(body) };
	persistFormalRecoveryJson(root, options.workflowId, "admission.json", admission);
	return admission;
}

export function recomputeRegisteredRecoveryAdmissionV37G3A(options: { projectRoot: string; dataRoot: string; workflowId: string; runRoot: string; confirmedAt: string; requestedAt: string }): RegisteredRecoveryAdmissionV37 {
	const root = v37G3ADataRootPath(options.projectRoot, options.dataRoot);
	const storedComparison = readFormalRecoveryJson<RegisteredRecoveryComparisonV37>(root, options.workflowId, "comparison.json", "registered Comparison");
	const storedEvidence = readFormalRecoveryJson<RegisteredRecoveryEvidenceBodyV37>(root, options.workflowId, "evidence.json", "Recovery Evidence Body");
	const storedConfirmation = readFormalRecoveryJson<EvidenceConfirmationReceiptV37>(root, options.workflowId, "confirmation.json", "Recovery confirmation");
	const storedRequest = readFormalRecoveryJson<RecoveryEvidenceSubmissionRequestV37>(root, options.workflowId, "request.json", "Recovery submission request");
	const stored = readFormalRecoveryJson<RegisteredRecoveryAdmissionV37>(root, options.workflowId, "admission.json", "Recovery admission");
	const expectedPackage = deriveRegisteredRecoveryPackageCoreV37G3A(options, true);
	if (stableJson({ comparison: storedComparison, evidence: storedEvidence, confirmation: storedConfirmation, request: storedRequest }) !== stableJson(expectedPackage)) throw new Error("Recovery package recomputation mismatch");
	const registered = loadWorkflowRegistrationV37G3A({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId, allowHistoricalReadOnly: true });
	const opportunity = expectedPackage.comparison.decision_result === "selected" ? buildOpportunity(expectedPackage.evidence, expectedPackage.comparison, registered.loadedCase.manifest.state_applicability.task_kinds[0]!) : null;
	const result = expectedPackage.comparison.decision_result === "selected" ? "admitted" as const : "rejected" as const;
	const reasons = result === "admitted" ? [] : ["no_valid_recovery"];
	const seed = { workflow_registration_digest: registered.workflow.workflow_registration_digest, evidence_body_digest: expectedPackage.evidence.evidence_body_digest, submission_request_digest: expectedPackage.request.submission_request_digest };
	const body: Omit<RegisteredRecoveryAdmissionV37, "admission_digest"> = {
		schema_version: 1, kind: "v37_registered_recovery_admission", admission_id: `admission-${digestObject(seed).slice(0, 32)}`, workflow_id: registered.workflow.workflow_id,
		workflow_registration_digest: registered.workflow.workflow_registration_digest, manifest_body_digest: registered.workflow.manifest_body_digest, case_registration_digest: registered.workflow.registration_digest,
		registry_trust_root_digest: registered.workflow.registry_trust_root_digest, evidence_body_digest: expectedPackage.evidence.evidence_body_digest, submission_request_digest: expectedPackage.request.submission_request_digest,
		comparison_decision_digest: expectedPackage.comparison.comparison_decision_digest, inspector_id: "inspect-v37g1-registered-recovery-v1", inspector_fingerprint: inspectorFingerprint(options.projectRoot),
		result, reasons, source_inventory_digest: digestObject(expectedPackage.evidence.source_artifact_refs), opportunity,
	};
	const expected = { ...body, admission_digest: digestObject(body) };
	if (stableJson(stored) !== stableJson(expected)) throw new Error("Recovery admission recomputation mismatch");
	return expected;
}
