import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import type {
	AssessedRollbackApplicationG2,
	AssessedRollbackAuthorizationG2,
	StateAssessmentG2,
} from "../contracts/final-capstone-g2-types.ts";
import type { ActiveStateIdentityV3, StateDecisionV3 } from "../contracts/v3g2-types.ts";
import type { CanonicalBoundStateAssessmentInputG2 } from "../contracts/v37-types.ts";
import { writeOnceBytes } from "../evidence/artifacts.ts";
import { digestObject, stableJson } from "../hash.ts";
import { inspectValidationV3 } from "../refinement/comparator-v3.ts";
import {
	inspectAcceptedStateRegressionComparisonG2,
	loadValidatedAdmissionG2,
} from "../refinement/regression-gate-g2.ts";
import { inspectStateStoreV3, rollbackActiveStateV3 } from "./store-v3.ts";
import { normalizeRegisteredBoundFollowUpV37, registeredFollowUpPromotionValidationRootV37, type RegisteredFollowUpOptionsV37 } from "../v37/registered-follow-up-v37.ts";
import { loadWorkflowRegistrationV37 } from "../v37/workflow-registration-v37.ts";
import { normalizeRegisteredBoundFollowUpV37G3A, registeredFollowUpPromotionValidationRootV37G3A, type RegisteredFollowUpOptionsV37G3A } from "../v37/registered-follow-up-v37g3a.ts";
import { loadWorkflowRegistrationV37G3A } from "../v37/workflow-registration-v37g3a.ts";

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
	registeredFollowUp?: RegisteredFollowUpOptionsV37;
	registeredFollowUpG3A?: RegisteredFollowUpOptionsV37G3A;
}

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function safeProjectPath(projectRoot: string, path: string, label: string, requireExisting: boolean): string {
	const root = resolve(projectRoot); const target = resolve(path);
	if (!contained(root, target)) throw new Error(`${label} is cross-project or escapes project root`);
	const rootStats = lstatSync(root);
	if (rootStats.isSymbolicLink() || !rootStats.isDirectory()) throw new Error("project root must be an ordinary directory");
	const realRoot = realpathSync.native(root);
	let current = root;
	for (const segment of relative(root, target).split(sep).filter(Boolean)) {
		current = resolve(current, segment);
		if (!existsSync(current)) {
			if (requireExisting) throw new Error(`${label} is missing`);
			break;
		}
		if (lstatSync(current).isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
		if (!lstatSync(current).isDirectory()) throw new Error(`${label} nearest existing path must be an ordinary directory`);
		if (!contained(realRoot, realpathSync.native(current))) throw new Error(`${label} real path escapes project root`);
	}
	if (requireExisting && !contained(realRoot, realpathSync.native(target))) throw new Error(`${label} real path escapes project root`);
	return target;
}

function safeArtifactPath(root: string, relativePath: string, label: string, requireExisting: boolean): string {
	const ordinaryRoot = resolve(root); const target = resolve(ordinaryRoot, relativePath);
	if (!contained(ordinaryRoot, target)) throw new Error(`${label} escapes Goal 2 artifact root`);
	const rootStats = lstatSync(ordinaryRoot);
	if (rootStats.isSymbolicLink() || !rootStats.isDirectory()) throw new Error("Goal 2 artifact root must be an ordinary directory");
	const realRoot = realpathSync.native(ordinaryRoot);
	let current = ordinaryRoot;
	for (const segment of relative(ordinaryRoot, target).split(sep).filter(Boolean)) {
		current = resolve(current, segment);
		if (!existsSync(current)) {
			if (requireExisting) throw new Error(`${label} is missing`);
			break;
		}
		const stats = lstatSync(current);
		if (stats.isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
		if (current !== target && !stats.isDirectory()) throw new Error(`${label} contains a non-directory ancestor`);
		if (!contained(realRoot, realpathSync.native(current))) throw new Error(`${label} real path escapes Goal 2 artifact root`);
	}
	if (requireExisting && !contained(realRoot, realpathSync.native(target))) throw new Error(`${label} real path escapes Goal 2 artifact root`);
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

function readArtifactJson<T>(root: string, relativePath: string, label: string): T {
	return readOrdinaryJson<T>(safeArtifactPath(root, relativePath, label, true), label);
}

function writeIdempotentJson(root: string, relativePath: string, value: unknown): void {
	const path = safeArtifactPath(root, relativePath, "Goal 2 write-once artifact", false);
	const expected = `${stableJson(value)}\n`;
	if (existsSync(path)) {
		const existing = readArtifactJson<unknown>(root, relativePath, "existing Goal 2 write-once artifact");
		if (`${stableJson(existing)}\n` !== expected) throw new Error("write-once Goal 2 artifact identity conflict");
		return;
	}
	mkdirSync(resolve(path, ".."), { recursive: true });
	safeArtifactPath(root, dirname(relativePath), "Goal 2 artifact parent", true);
	writeOnceBytes(root, relativePath, expected);
	readArtifactJson<unknown>(root, relativePath, "new Goal 2 write-once artifact");
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

function normalizeLegacyBoundFollowUp(record: Awaited<ReturnType<typeof loadValidatedAdmissionG2>>): CanonicalBoundStateAssessmentInputG2 {
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
	return {
		admission_identity: { admission_id: record.admission_id, admission_digest: record.admission_digest },
		evidence_identity: { evidence_id: record.frozen_evidence.evidence_id, evidence_digest: record.frozen_evidence.evidence_digest },
		trusted_task_context: structuredClone(record.trusted_task_context),
		state_store_scope_digest: digestObject({ project_id: record.project_id, state_root: (record.provenance.state as Record<string, unknown>).state_root ?? "legacy_bound_state" }),
		bound_active_state_identity: boundState,
		bound_promotion_decision_identity: { decision_id: boundDecisionId, decision_digest: String(lineage.decision_digest) },
		binding_digest: bindingDigest,
		outcome_status: record.frozen_evidence.outcome.status,
		verifier_status: record.frozen_evidence.outcome.verifier_status,
		failure_attribution: record.frozen_evidence.validity.attribution === "verifier" ? "verifier" : record.frozen_evidence.validity.attribution === "none" ? "none" : "infrastructure",
	};
}

async function deriveAssessment(options: StateAssessmentContextG2, enforceCurrent: boolean): Promise<StateAssessmentG2> {
	safeProjectPath(options.projectRoot, options.assessmentRoot, "assessment root", false);
	const stateRoot = safeProjectPath(options.projectRoot, options.stateRoot, "State root", true);
	const promotionValidationRoot = safeProjectPath(options.projectRoot, options.promotionValidationRunRoot, "promotion validation root", true);
	if (options.comparisonRunRoot) safeProjectPath(options.projectRoot, options.comparisonRunRoot, "accepted-State comparison root", true);
	if (options.registeredFollowUp && options.registeredFollowUpG3A) throw new Error("assessment source is ambiguous");
	const hasRegistered = Boolean(options.registeredFollowUp || options.registeredFollowUpG3A);
	const legacyAdmission = hasRegistered ? null : await loadValidatedAdmissionG2({ projectRoot: options.projectRoot, admissionRoot: options.admissionRoot, registrationPath: options.registrationPath, admissionId: options.admissionId, projectId: options.projectId });
	const canonical = options.registeredFollowUpG3A ? await normalizeRegisteredBoundFollowUpV37G3A(options.registeredFollowUpG3A) : options.registeredFollowUp ? await normalizeRegisteredBoundFollowUpV37(options.registeredFollowUp) : normalizeLegacyBoundFollowUp(legacyAdmission!);
	if (canonical.admission_identity.admission_id !== options.admissionId || canonical.trusted_task_context.task_kind.length === 0) throw new Error("canonical bound-State admission identity mismatch");
	if (options.registeredFollowUp) {
		const registered = loadWorkflowRegistrationV37({ projectRoot: options.registeredFollowUp.projectRoot, dataRoot: options.registeredFollowUp.dataRoot, workflowId: options.registeredFollowUp.workflowId });
		const scope = registered.loadedCase.manifest.state_store_scope_spec;
		const { state_store_scope_digest: _scopeDigest, ...scopeBody } = scope;
		const configuredRoot = safeProjectPath(options.projectRoot, resolve(options.projectRoot, scope.configured_location), "Manifest-configured State root", true);
		const expectedPromotionRoot = safeProjectPath(options.projectRoot, registeredFollowUpPromotionValidationRootV37(options.registeredFollowUp), "registered promotion validation root", true);
		if (realpathSync.native(configuredRoot) !== realpathSync.native(stateRoot) || realpathSync.native(expectedPromotionRoot) !== realpathSync.native(promotionValidationRoot) || scope.project_id !== options.projectId || digestObject(scopeBody) !== scope.state_store_scope_digest || canonical.state_store_scope_digest !== scope.state_store_scope_digest) throw new Error("registered assessment State scope or promotion root mismatch");
	}
	if (options.registeredFollowUpG3A) {
		const registered = loadWorkflowRegistrationV37G3A({ projectRoot: options.registeredFollowUpG3A.projectRoot, dataRoot: options.registeredFollowUpG3A.dataRoot, workflowId: options.registeredFollowUpG3A.workflowId });
		const scope = registered.loadedCase.manifest.state_store_scope_spec;
		const { state_store_scope_digest: _scopeDigest, ...scopeBody } = scope;
		const configuredRoot = safeProjectPath(options.projectRoot, resolve(options.projectRoot, scope.configured_location), "Manifest-configured State root", true);
		const expectedPromotionRoot = safeProjectPath(options.projectRoot, registeredFollowUpPromotionValidationRootV37G3A(options.registeredFollowUpG3A), "registered promotion validation root", true);
		if (realpathSync.native(configuredRoot) !== realpathSync.native(stateRoot) || realpathSync.native(expectedPromotionRoot) !== realpathSync.native(promotionValidationRoot) || scope.project_id !== options.projectId || digestObject(scopeBody) !== scope.state_store_scope_digest || canonical.state_store_scope_digest !== scope.state_store_scope_digest) throw new Error("registered assessment State scope or promotion root mismatch");
	}
	const bound = { boundState: canonical.bound_active_state_identity, boundDecisionId: canonical.bound_promotion_decision_identity.decision_id, boundDecisionDigest: canonical.bound_promotion_decision_identity.decision_digest, bindingDigest: canonical.binding_digest };
	const store = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	if (!store.integrity_valid || !store.active) throw new Error(`State store fails closed: ${store.errors.join("; ")}`);
	if (!sameActive(bound.boundState, options.expectedActive)) throw new Error("assessment request active identity does not match admitted bound State");
	if (enforceCurrent && !sameActive(activeIdentity(store.active), options.expectedActive)) throw new Error("stale active identity cannot be assessed");
	const decision = promotionDecision(store.decisions, bound.boundDecisionId);
	if (decision.decision_digest !== bound.boundDecisionDigest || !sameActive(decision.next_active, bound.boundState)) throw new Error("bound promotion Decision identity mismatch");
	const currentVersion = store.versions.find((entry) => entry.state_digest === bound.boundState.state_digest);
	const parentVersion = currentVersion?.parent_state_digest ? store.versions.find((entry) => entry.state_digest === currentVersion.parent_state_digest) : null;
	if (!currentVersion || !parentVersion || currentVersion.state_version !== bound.boundState.state_version) throw new Error("bound current/immediate-parent accepted State lineage is missing");
	const promotion = inspectValidationV3(promotionValidationRoot);
	if (!promotion.integrity_valid || !promotion.validation || !promotion.seed || !promotion.candidate_arm || !promotion.recomputed_decision) throw new Error(`promotion validation fails closed: ${promotion.errors.join("; ")}`);
	if (decision.validation_id !== promotion.validation.validation_id || decision.validation_digest !== promotion.validation.validation_digest || decision.candidate_id !== promotion.seed.candidate_id || decision.candidate_digest !== promotion.seed.candidate_digest || currentVersion.source_staged_state_digest !== promotion.seed.candidate_state_digest || currentVersion.parent_state_digest !== promotion.seed.base_state_digest || promotion.recomputed_decision.result !== "promote" || promotion.candidate_arm.verifier_status !== "passed" || !promotion.candidate_arm.regression_passed) throw new Error("promotion Candidate/validation/State lineage mismatch");
	const passed = canonical.outcome_status === "passed" && canonical.verifier_status === "passed";
	const negative = canonical.outcome_status === "failed" && canonical.verifier_status === "failed";
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
			const sameAdmission = compared.selection.admission_id === canonical.admission_identity.admission_id && compared.selection.admission_digest === canonical.admission_identity.admission_digest && stableJson(compared.selection.trusted_task_context) === stableJson(canonical.trusted_task_context);
			const sameFrozenIdentity = stableJson(compared.seed.frozen_identity) === stableJson(promotion.seed.frozen_identity) && compared.seed.source_workspace_digest === promotion.seed.source_workspace_digest;
			const exactStates = compared.seed.current_state_digest === currentVersion.state_digest && compared.seed.parent_state_digest === parentVersion.state_digest;
			const targetIsParent = options.requestedRollbackTargetDigest === parentVersion.state_digest;
			const attributable = sameAdmission && canonical.failure_attribution === "verifier" && compared.state_regression_observed && sameFrozenIdentity && exactStates && targetIsParent;
			if (attributable) { result = "rollback"; reason = "valid_state_attributable_regression"; rollbackTarget = parentVersion.state_digest; }
			else reason = "comparison_not_state_attributable";
		}
	} else if (negative && options.requestedRollbackTargetDigest !== null) reason = "comparison_missing_or_invalid";
	const seed = { project_id: options.projectId, admission_digest: canonical.admission_identity.admission_digest, bound_state: bound.boundState, comparison_digest: comparisonDigest, rollback_target_digest: rollbackTarget };
	const body: Omit<StateAssessmentG2, "assessment_digest"> = {
		schema_version: 1,
		assessment_id: `state-assessment-${digestObject(seed).slice(0, 32)}`,
		project_id: options.projectId,
		admission_id: canonical.admission_identity.admission_id,
		admission_digest: canonical.admission_identity.admission_digest,
		evidence_id: canonical.evidence_identity.evidence_id,
		evidence_digest: canonical.evidence_identity.evidence_digest,
		trusted_task_context: structuredClone(canonical.trusted_task_context),
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
	safeProjectPath(options.projectRoot, root, "assessment root", true);
	const path = safeArtifactPath(root, `assessments/${assessment.assessment_id}.json`, "State assessment", false);
	const existed = existsSync(path);
	writeIdempotentJson(root, `assessments/${assessment.assessment_id}.json`, assessment);
	return { assessment, idempotent_existing: existed };
}

export async function recomputeStoredAssessmentG2(options: StateAssessmentContextG2 & { assessmentId: string; enforceCurrent?: boolean }): Promise<StateAssessmentG2> {
	if (!ID.test(options.assessmentId)) throw new Error("assessment ID is invalid");
	const root = safeProjectPath(options.projectRoot, options.assessmentRoot, "assessment root", true);
	const stored = readArtifactJson<StateAssessmentG2>(root, `assessments/${options.assessmentId}.json`, "State assessment");
	if (stored.assessment_id !== options.assessmentId || !SHA256.test(stored.assessment_digest) || digestObject(assessmentBody(stored)) !== stored.assessment_digest) throw new Error("State assessment identity mismatch");
	const recomputed = await deriveAssessment(options, options.enforceCurrent ?? false);
	if (stableJson(stored) !== stableJson(recomputed)) throw new Error("State assessment recomputation mismatch");
	return stored;
}

export async function applyAssessedRollbackG2(options: StateAssessmentContextG2 & { assessmentId: string }): Promise<{ authorization: AssessedRollbackAuthorizationG2; application: AssessedRollbackApplicationG2; idempotent_existing: boolean }> {
	const root = safeProjectPath(options.projectRoot, options.assessmentRoot, "assessment root", true);
	const applicationRelative = `applications/${options.assessmentId}.json`;
	const authorizationRelative = `authorizations/${options.assessmentId}.json`;
	const existingPath = resolve(root, applicationRelative);
	const hasExisting = existsSync(existingPath);
	const hasAuthorization = existsSync(resolve(root, authorizationRelative));
	const assessment = await recomputeStoredAssessmentG2({ ...options, enforceCurrent: !hasExisting && !hasAuthorization });
	if (assessment.assessment_result !== "rollback" || !assessment.rollback_target_digest) throw new Error("only a recomputed rollback assessment may authorize rollback");
	const authorizationSeed = { assessment_id: assessment.assessment_id, assessment_digest: assessment.assessment_digest, expected_active: assessment.bound_state, target_state_digest: assessment.rollback_target_digest };
	const authorizationBodyValue: Omit<AssessedRollbackAuthorizationG2, "authorization_digest"> = { schema_version: 1, authorization_id: `rollback-authorization-${digestObject(authorizationSeed).slice(0, 32)}`, project_id: assessment.project_id, assessment_id: assessment.assessment_id, assessment_digest: assessment.assessment_digest, expected_active: assessment.bound_state, target_state_digest: assessment.rollback_target_digest, authority: "host_assessed_rollback" };
	const expectedAuthorization: AssessedRollbackAuthorizationG2 = { ...authorizationBodyValue, authorization_digest: digestObject(authorizationBodyValue) };
	const validateAuthorization = (authorization: AssessedRollbackAuthorizationG2): void => {
		if (stableJson(authorization) !== stableJson(expectedAuthorization) || digestObject(authorizationBody(authorization)) !== authorization.authorization_digest) throw new Error("existing assessed rollback authorization is invalid or conflicting");
	};
	const applicationFor = (authorization: AssessedRollbackAuthorizationG2, decision: StateDecisionV3): AssessedRollbackApplicationG2 => {
		if (!decision.prior_active) throw new Error("rollback Decision prior active is missing");
		const applicationSeed = { assessment_digest: assessment.assessment_digest, authorization_digest: authorization.authorization_digest, v3_decision_digest: decision.decision_digest };
		const body: Omit<AssessedRollbackApplicationG2, "application_digest"> = { schema_version: 1, application_id: `rollback-application-${digestObject(applicationSeed).slice(0, 32)}`, project_id: assessment.project_id, assessment_id: assessment.assessment_id, assessment_digest: assessment.assessment_digest, authorization_id: authorization.authorization_id, authorization_digest: authorization.authorization_digest, v3_rollback_decision_id: decision.decision_id, v3_rollback_decision_digest: decision.decision_digest, prior_active: assessment.bound_state, next_active: decision.next_active, target_state_digest: assessment.rollback_target_digest! };
		return { ...body, application_digest: digestObject(body) };
	};
	if (hasExisting) {
		if (!hasAuthorization) throw new Error("existing rollback application lacks authorization");
		const application = readArtifactJson<AssessedRollbackApplicationG2>(root, applicationRelative, "rollback application");
		const authorization = readArtifactJson<AssessedRollbackAuthorizationG2>(root, authorizationRelative, "rollback authorization");
		validateAuthorization(authorization);
		if (digestObject(applicationBody(application)) !== application.application_digest || digestObject(authorizationBody(authorization)) !== authorization.authorization_digest || authorization.project_id !== assessment.project_id || authorization.assessment_id !== assessment.assessment_id || authorization.assessment_digest !== assessment.assessment_digest || authorization.authority !== "host_assessed_rollback" || !sameActive(authorization.expected_active, assessment.bound_state) || authorization.target_state_digest !== assessment.rollback_target_digest || application.project_id !== assessment.project_id || application.assessment_id !== assessment.assessment_id || application.assessment_digest !== assessment.assessment_digest || application.authorization_id !== authorization.authorization_id || application.authorization_digest !== authorization.authorization_digest || !sameActive(application.prior_active, assessment.bound_state) || application.target_state_digest !== assessment.rollback_target_digest) throw new Error("existing assessed rollback linkage is invalid");
		const store = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
		const decision = store.decisions.find((entry) => entry.decision_id === application.v3_rollback_decision_id);
		if (!store.integrity_valid || !decision || decision.kind !== "rollback" || decision.result !== "rolled_back" || !decision.prior_active || decision.decision_digest !== application.v3_rollback_decision_digest || decision.rollback_target_digest !== application.target_state_digest || !sameActive(decision.prior_active, application.prior_active) || !sameActive(decision.next_active, application.next_active) || stableJson(application) !== stableJson(applicationFor(authorization, decision))) throw new Error("existing assessed rollback V3 Decision lineage is invalid");
		return { authorization, application, idempotent_existing: true };
	}
	if (hasAuthorization) {
		const authorization = readArtifactJson<AssessedRollbackAuthorizationG2>(root, authorizationRelative, "rollback authorization");
		validateAuthorization(authorization);
		const store = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
		if (!store.integrity_valid || !store.active) throw new Error(`State store fails closed during assessed rollback recovery: ${store.errors.join("; ")}`);
		const targetVersion = store.versions.find((entry) => entry.state_digest === assessment.rollback_target_digest);
		if (!targetVersion) throw new Error("assessed rollback recovery target State is missing");
		const expectedNext: ActiveStateIdentityV3 = { binding_revision: assessment.bound_state.binding_revision + 1, state_version: targetVersion.state_version, state_digest: assessment.rollback_target_digest };
		const matches = store.decisions.filter((entry) => entry.kind === "rollback" && entry.result === "rolled_back" && entry.reason === "operator_rollback" && entry.prior_active !== null && sameActive(entry.prior_active, assessment.bound_state) && entry.rollback_target_digest === assessment.rollback_target_digest && sameActive(entry.next_active, expectedNext));
		if (matches.length !== 1) throw new Error("assessed rollback recovery requires exactly one matching V3 rollback Decision");
		const decision = matches[0]!;
		if (!sameActive(activeIdentity(store.active), decision.next_active) || store.active.decision_id !== decision.decision_id) throw new Error("assessed rollback recovery rejects unrelated or later active pointer movement");
		const application = applicationFor(authorization, decision);
		writeIdempotentJson(root, applicationRelative, application);
		return { authorization, application, idempotent_existing: false };
	}
	const authorization = expectedAuthorization;
	writeIdempotentJson(root, authorizationRelative, authorization);
	const rolled = await rollbackActiveStateV3({ stateRoot: options.stateRoot, projectId: options.projectId, targetStateDigest: assessment.rollback_target_digest, expectedActive: assessment.bound_state, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	const application = applicationFor(authorization, rolled.decision);
	if (!sameActive(application.next_active, activeIdentity(rolled.active))) throw new Error("V3 rollback result/Decision identity mismatch");
	writeIdempotentJson(root, applicationRelative, application);
	return { authorization, application, idempotent_existing: false };
}

export { assessmentBody as stateAssessmentBodyG2, authorizationBody as assessedRollbackAuthorizationBodyG2, applicationBody as assessedRollbackApplicationBodyG2 };
