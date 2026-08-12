import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type {
	AssessedRollbackApplicationG2,
	AssessedRollbackAuthorizationG2,
	StateAssessmentG2,
} from "../contracts/final-capstone-g2-types.ts";
import type { ActiveStateIdentityV3, StateDecisionV3 } from "../contracts/v3g2-types.ts";
import { writeOnceBytes } from "../evidence/artifacts.ts";
import { digestObject, stableJson } from "../hash.ts";
import { inspectValidationV3 } from "../refinement/comparator-v3.ts";
import {
	inspectAcceptedStateRegressionComparisonG2,
	loadValidatedAdmissionG2,
} from "../refinement/regression-gate-g2.ts";
import { inspectStateStoreV3, rollbackActiveStateV3 } from "./store-v3.ts";

const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;

export interface StateAssessmentContextG2 {
	projectRoot: string;
	assessmentRoot: string;
	admissionRoot: string;
	registrationPath: string;
	admissionId: string;
	projectId: string;
	stateRoot: string;
	expectedActive: ActiveStateIdentityV3;
	promotionValidationRunRoot: string;
	comparisonRunRoot: string | null;
	requestedRollbackTargetDigest: string | null;
	immutableBasePrompt: string;
	immutableBasePromptSha256: string;
}

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function safeProjectPath(projectRoot: string, path: string, label: string, requireExisting: boolean): string {
	const root = resolve(projectRoot); const target = resolve(path);
	if (!contained(root, target)) throw new Error(`${label} is cross-project or escapes project root`);
	if (!requireExisting) return target;
	let current = root;
	for (const segment of relative(root, target).split(sep).filter(Boolean)) {
		current = resolve(current, segment);
		if (!existsSync(current)) throw new Error(`${label} is missing`);
		if (lstatSync(current).isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
	}
	if (!contained(realpathSync.native(root), realpathSync.native(target))) throw new Error(`${label} real path escapes project root`);
	return target;
}

function readOrdinaryJson<T>(path: string, label: string): T {
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`${label} must be an ordinary singly linked file`);
	const bytes = readFileSync(path, "utf8");
	const value = JSON.parse(bytes) as T;
	if (bytes !== `${stableJson(value)}\n`) throw new Error(`${label} bytes are not canonical`);
	return value;
}

function writeIdempotentJson(root: string, relativePath: string, value: unknown): void {
	const path = resolve(root, relativePath);
	const expected = `${stableJson(value)}\n`;
	if (existsSync(path)) {
		if (readFileSync(path, "utf8") !== expected) throw new Error("write-once Goal 2 artifact identity conflict");
		return;
	}
	mkdirSync(resolve(path, ".."), { recursive: true });
	writeOnceBytes(root, relativePath, expected);
}

function activeIdentity(value: { binding_revision: number; state_version: number; state_digest: string }): ActiveStateIdentityV3 {
	return { binding_revision: value.binding_revision, state_version: value.state_version, state_digest: value.state_digest };
}

function sameActive(left: ActiveStateIdentityV3, right: ActiveStateIdentityV3): boolean { return stableJson(left) === stableJson(right); }

function assessmentBody(record: StateAssessmentG2): Omit<StateAssessmentG2, "assessment_digest"> {
	const { assessment_digest: _digest, ...body } = record; return body;
}

function authorizationBody(record: AssessedRollbackAuthorizationG2): Omit<AssessedRollbackAuthorizationG2, "authorization_digest"> {
	const { authorization_digest: _digest, ...body } = record; return body;
}

function applicationBody(record: AssessedRollbackApplicationG2): Omit<AssessedRollbackApplicationG2, "application_digest"> {
	const { application_digest: _digest, ...body } = record; return body;
}

function promotionDecision(decisions: StateDecisionV3[], decisionId: string): StateDecisionV3 {
	const found = decisions.find((entry) => entry.decision_id === decisionId);
	if (!found || found.kind !== "promotion" || found.result !== "promoted") throw new Error("bound promoted State Decision is missing");
	return found;
}

function provenance(record: Awaited<ReturnType<typeof loadValidatedAdmissionG2>>) {
	if (record.source_family !== "v3g3_bound_state_followup") throw new Error("State assessment requires a Goal 1 bound-State follow-up admission");
	const state = record.provenance.state as Record<string, unknown> | undefined;
	const binding = record.provenance.binding as Record<string, unknown> | undefined;
	const lineage = binding?.lineage as Record<string, unknown> | null | undefined;
	if (!state || !binding || !lineage) throw new Error("bound-State follow-up provenance is incomplete");
	const boundState: ActiveStateIdentityV3 = { binding_revision: Number(state.active_binding_revision), state_version: Number(state.active_state_version), state_digest: String(state.active_state_digest) };
	const boundDecisionId = String(state.active_decision_id);
	const bindingDigest = String(binding.binding_digest);
	if (!Number.isSafeInteger(boundState.binding_revision) || boundState.binding_revision < 1 || !Number.isSafeInteger(boundState.state_version) || boundState.state_version < 1 || !SHA256.test(boundState.state_digest) || !ID.test(boundDecisionId) || !SHA256.test(bindingDigest)) throw new Error("bound-State follow-up identity is invalid");
	if (lineage.decision_id !== boundDecisionId || lineage.version_digest !== boundState.state_digest || !SHA256.test(String(lineage.decision_digest))) throw new Error("bound-State promotion lineage mismatch");
	return { boundState, boundDecisionId, boundDecisionDigest: String(lineage.decision_digest), bindingDigest };
}

async function deriveAssessment(options: StateAssessmentContextG2, enforceCurrent: boolean): Promise<StateAssessmentG2> {
	safeProjectPath(options.projectRoot, options.assessmentRoot, "assessment root", false);
	safeProjectPath(options.projectRoot, options.stateRoot, "State root", true);
	safeProjectPath(options.projectRoot, options.promotionValidationRunRoot, "promotion validation root", true);
	if (options.comparisonRunRoot) safeProjectPath(options.projectRoot, options.comparisonRunRoot, "accepted-State comparison root", true);
	const admission = await loadValidatedAdmissionG2({ projectRoot: options.projectRoot, admissionRoot: options.admissionRoot, registrationPath: options.registrationPath, admissionId: options.admissionId, projectId: options.projectId });
	const bound = provenance(admission);
	const store = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	if (!store.integrity_valid || !store.active) throw new Error(`State store fails closed: ${store.errors.join("; ")}`);
	if (!sameActive(bound.boundState, options.expectedActive)) throw new Error("assessment request active identity does not match admitted bound State");
	if (enforceCurrent && !sameActive(activeIdentity(store.active), options.expectedActive)) throw new Error("stale active identity cannot be assessed");
	const decision = promotionDecision(store.decisions, bound.boundDecisionId);
	if (decision.decision_digest !== bound.boundDecisionDigest || !sameActive(decision.next_active, bound.boundState)) throw new Error("bound promotion Decision identity mismatch");
	const currentVersion = store.versions.find((entry) => entry.state_digest === bound.boundState.state_digest);
	const parentVersion = currentVersion?.parent_state_digest ? store.versions.find((entry) => entry.state_digest === currentVersion.parent_state_digest) : null;
	if (!currentVersion || !parentVersion || currentVersion.state_version !== bound.boundState.state_version) throw new Error("bound current/immediate-parent accepted State lineage is missing");
	const promotion = inspectValidationV3(options.promotionValidationRunRoot);
	if (!promotion.integrity_valid || !promotion.validation || !promotion.seed || !promotion.candidate_arm || !promotion.recomputed_decision) throw new Error(`promotion validation fails closed: ${promotion.errors.join("; ")}`);
	if (decision.validation_id !== promotion.validation.validation_id || decision.validation_digest !== promotion.validation.validation_digest || decision.candidate_id !== promotion.seed.candidate_id || decision.candidate_digest !== promotion.seed.candidate_digest || currentVersion.source_staged_state_digest !== promotion.seed.candidate_state_digest || currentVersion.parent_state_digest !== promotion.seed.base_state_digest || promotion.recomputed_decision.result !== "promote" || promotion.candidate_arm.verifier_status !== "passed" || !promotion.candidate_arm.regression_passed) throw new Error("promotion Candidate/validation/State lineage mismatch");
	const passed = admission.frozen_evidence.outcome.status === "passed" && admission.frozen_evidence.outcome.verifier_status === "passed";
	const negative = admission.frozen_evidence.outcome.status === "failed" && admission.frozen_evidence.outcome.verifier_status === "failed";
	if (!passed && !negative) throw new Error("bound follow-up terminal/Verifier result is not assessable");
	let result: StateAssessmentG2["assessment_result"] = passed ? "retain" : "needs_reassessment";
	let reason: StateAssessmentG2["assessment_reason"] = passed ? "bound_followup_passed" : "ordinary_negative_evidence";
	let comparisonId: string | null = null; let comparisonDigest: string | null = null; let rollbackTarget: string | null = null;
	if (passed && (options.comparisonRunRoot !== null || options.requestedRollbackTargetDigest !== null)) throw new Error("passing follow-up does not accept caller-supplied rollback material");
	if (negative && options.comparisonRunRoot) {
		const compared = await inspectAcceptedStateRegressionComparisonG2({ projectRoot: options.projectRoot, runRoot: options.comparisonRunRoot });
		if (!compared.integrity_valid || !compared.seed || !compared.comparison || !compared.selection) reason = "comparison_missing_or_invalid";
		else {
			comparisonId = compared.comparison.comparison_id; comparisonDigest = compared.comparison.comparison_digest;
			const sameAdmission = compared.selection.admission_id === admission.admission_id && compared.selection.admission_digest === admission.admission_digest && stableJson(compared.selection.trusted_task_context) === stableJson(admission.trusted_task_context);
			const sameFrozenIdentity = stableJson(compared.seed.frozen_identity) === stableJson(promotion.seed.frozen_identity) && compared.seed.source_workspace_digest === promotion.seed.source_workspace_digest;
			const exactStates = compared.seed.current_state_digest === currentVersion.state_digest && compared.seed.parent_state_digest === parentVersion.state_digest;
			const targetIsParent = options.requestedRollbackTargetDigest === parentVersion.state_digest;
			const attributable = sameAdmission && admission.frozen_evidence.validity.attribution === "verifier" && compared.state_regression_observed && sameFrozenIdentity && exactStates && targetIsParent;
			if (attributable) { result = "rollback"; reason = "valid_state_attributable_regression"; rollbackTarget = parentVersion.state_digest; }
			else reason = "comparison_not_state_attributable";
		}
	} else if (negative && options.requestedRollbackTargetDigest !== null) reason = "comparison_missing_or_invalid";
	const seed = { project_id: options.projectId, admission_digest: admission.admission_digest, bound_state: bound.boundState, comparison_digest: comparisonDigest, rollback_target_digest: rollbackTarget };
	const body: Omit<StateAssessmentG2, "assessment_digest"> = {
		schema_version: 1,
		assessment_id: `state-assessment-${digestObject(seed).slice(0, 32)}`,
		project_id: options.projectId,
		admission_id: admission.admission_id,
		admission_digest: admission.admission_digest,
		evidence_id: admission.frozen_evidence.evidence_id,
		evidence_digest: admission.frozen_evidence.evidence_digest,
		trusted_task_context: structuredClone(admission.trusted_task_context),
		bound_state: bound.boundState,
		bound_decision_id: decision.decision_id,
		bound_decision_digest: decision.decision_digest,
		binding_digest: bound.bindingDigest,
		promotion_validation_id: promotion.validation.validation_id,
		promotion_validation_digest: promotion.validation.validation_digest,
		assessment_result: result,
		assessment_reason: reason,
		comparison_id: comparisonId,
		comparison_digest: comparisonDigest,
		rollback_target_digest: rollbackTarget,
	};
	return { ...body, assessment_digest: digestObject(body) };
}

export async function persistStateAssessmentG2(options: StateAssessmentContextG2): Promise<{ assessment: StateAssessmentG2; idempotent_existing: boolean }> {
	const assessment = await deriveAssessment(options, true);
	const root = safeProjectPath(options.projectRoot, options.assessmentRoot, "assessment root", false);
	mkdirSync(root, { recursive: true });
	const path = resolve(root, `assessments/${assessment.assessment_id}.json`);
	const existed = existsSync(path);
	writeIdempotentJson(root, `assessments/${assessment.assessment_id}.json`, assessment);
	return { assessment, idempotent_existing: existed };
}

export async function recomputeStoredAssessmentG2(options: StateAssessmentContextG2 & { assessmentId: string; enforceCurrent?: boolean }): Promise<StateAssessmentG2> {
	if (!ID.test(options.assessmentId)) throw new Error("assessment ID is invalid");
	const root = safeProjectPath(options.projectRoot, options.assessmentRoot, "assessment root", true);
	const stored = readOrdinaryJson<StateAssessmentG2>(resolve(root, `assessments/${options.assessmentId}.json`), "State assessment");
	if (stored.assessment_id !== options.assessmentId || !SHA256.test(stored.assessment_digest) || digestObject(assessmentBody(stored)) !== stored.assessment_digest) throw new Error("State assessment identity mismatch");
	const recomputed = await deriveAssessment(options, options.enforceCurrent ?? false);
	if (stableJson(stored) !== stableJson(recomputed)) throw new Error("State assessment recomputation mismatch");
	return stored;
}

export async function applyAssessedRollbackG2(options: StateAssessmentContextG2 & { assessmentId: string }): Promise<{ authorization: AssessedRollbackAuthorizationG2; application: AssessedRollbackApplicationG2; idempotent_existing: boolean }> {
	const root = safeProjectPath(options.projectRoot, options.assessmentRoot, "assessment root", true);
	const existingPath = resolve(root, `applications/${options.assessmentId}.json`);
	const hasExisting = existsSync(existingPath);
	const assessment = await recomputeStoredAssessmentG2({ ...options, enforceCurrent: !hasExisting });
	if (assessment.assessment_result !== "rollback" || !assessment.rollback_target_digest) throw new Error("only a recomputed rollback assessment may authorize rollback");
	if (existsSync(existingPath)) {
		const application = readOrdinaryJson<AssessedRollbackApplicationG2>(existingPath, "rollback application");
		const authorization = readOrdinaryJson<AssessedRollbackAuthorizationG2>(resolve(root, `authorizations/${options.assessmentId}.json`), "rollback authorization");
		if (digestObject(applicationBody(application)) !== application.application_digest || digestObject(authorizationBody(authorization)) !== authorization.authorization_digest || authorization.project_id !== assessment.project_id || authorization.assessment_id !== assessment.assessment_id || authorization.assessment_digest !== assessment.assessment_digest || authorization.authority !== "host_assessed_rollback" || !sameActive(authorization.expected_active, assessment.bound_state) || authorization.target_state_digest !== assessment.rollback_target_digest || application.project_id !== assessment.project_id || application.assessment_id !== assessment.assessment_id || application.assessment_digest !== assessment.assessment_digest || application.authorization_id !== authorization.authorization_id || application.authorization_digest !== authorization.authorization_digest || !sameActive(application.prior_active, assessment.bound_state) || application.target_state_digest !== assessment.rollback_target_digest) throw new Error("existing assessed rollback linkage is invalid");
		const store = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
		const decision = store.decisions.find((entry) => entry.decision_id === application.v3_rollback_decision_id);
		if (!store.integrity_valid || !decision || decision.kind !== "rollback" || decision.result !== "rolled_back" || !decision.prior_active || !decision.next_active || decision.decision_digest !== application.v3_rollback_decision_digest || decision.rollback_target_digest !== application.target_state_digest || !sameActive(decision.prior_active, application.prior_active) || !sameActive(decision.next_active, application.next_active)) throw new Error("existing assessed rollback V3 Decision lineage is invalid");
		return { authorization, application, idempotent_existing: true };
	}
	const authorizationSeed = { assessment_id: assessment.assessment_id, assessment_digest: assessment.assessment_digest, expected_active: assessment.bound_state, target_state_digest: assessment.rollback_target_digest };
	const authorizationBodyValue: Omit<AssessedRollbackAuthorizationG2, "authorization_digest"> = { schema_version: 1, authorization_id: `rollback-authorization-${digestObject(authorizationSeed).slice(0, 32)}`, project_id: assessment.project_id, assessment_id: assessment.assessment_id, assessment_digest: assessment.assessment_digest, expected_active: assessment.bound_state, target_state_digest: assessment.rollback_target_digest, authority: "host_assessed_rollback" };
	const authorization: AssessedRollbackAuthorizationG2 = { ...authorizationBodyValue, authorization_digest: digestObject(authorizationBodyValue) };
	writeIdempotentJson(root, `authorizations/${assessment.assessment_id}.json`, authorization);
	const rolled = await rollbackActiveStateV3({ stateRoot: options.stateRoot, projectId: options.projectId, targetStateDigest: assessment.rollback_target_digest, expectedActive: assessment.bound_state, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	const applicationSeed = { assessment_digest: assessment.assessment_digest, authorization_digest: authorization.authorization_digest, v3_decision_digest: rolled.decision.decision_digest };
	const body: Omit<AssessedRollbackApplicationG2, "application_digest"> = { schema_version: 1, application_id: `rollback-application-${digestObject(applicationSeed).slice(0, 32)}`, project_id: assessment.project_id, assessment_id: assessment.assessment_id, assessment_digest: assessment.assessment_digest, authorization_id: authorization.authorization_id, authorization_digest: authorization.authorization_digest, v3_rollback_decision_id: rolled.decision.decision_id, v3_rollback_decision_digest: rolled.decision.decision_digest, prior_active: assessment.bound_state, next_active: activeIdentity(rolled.active), target_state_digest: assessment.rollback_target_digest };
	const application: AssessedRollbackApplicationG2 = { ...body, application_digest: digestObject(body) };
	writeIdempotentJson(root, `applications/${assessment.assessment_id}.json`, application);
	return { authorization, application, idempotent_existing: false };
}

export { assessmentBody as stateAssessmentBodyG2, authorizationBody as assessedRollbackAuthorizationBodyG2, applicationBody as assessedRollbackApplicationBodyG2 };
