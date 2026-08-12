import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type {
	AssessedRollbackApplicationG2,
	AssessedRollbackAuthorizationG2,
	FinalCapstoneG2Inspection,
} from "./contracts/final-capstone-g2-types.ts";
import { digestObject, stableJson } from "./hash.ts";
import {
	assessedRollbackApplicationBodyG2,
	assessedRollbackAuthorizationBodyG2,
	recomputeStoredAssessmentG2,
	type StateAssessmentContextG2,
} from "./state/state-feedback-g2.ts";
import { inspectStateStoreV3 } from "./state/store-v3.ts";

function ordinaryJson<T>(path: string, label: string): T {
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`${label} must be an ordinary singly linked file`);
	const bytes = readFileSync(path, "utf8");
	const value = JSON.parse(bytes) as T;
	if (bytes !== `${stableJson(value)}\n`) throw new Error(`${label} bytes are not canonical`);
	return value;
}

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function artifactJson<T>(root: string, relativePath: string, label: string): T {
	const ordinaryRoot = resolve(root); const target = resolve(ordinaryRoot, relativePath);
	if (!contained(ordinaryRoot, target)) throw new Error(`${label} escapes Goal 2 artifact root`);
	const rootStats = lstatSync(ordinaryRoot);
	if (rootStats.isSymbolicLink() || !rootStats.isDirectory()) throw new Error("Goal 2 artifact root must be an ordinary directory");
	const realRoot = realpathSync.native(ordinaryRoot);
	let current = ordinaryRoot;
	for (const segment of relative(ordinaryRoot, target).split(sep).filter(Boolean)) {
		current = resolve(current, segment);
		if (!existsSync(current)) throw new Error(`${label} is missing`);
		const stats = lstatSync(current);
		if (stats.isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
		if (current !== target && !stats.isDirectory()) throw new Error(`${label} contains a non-directory ancestor`);
		if (!contained(realRoot, realpathSync.native(current))) throw new Error(`${label} real path escapes Goal 2 artifact root`);
	}
	return ordinaryJson<T>(target, label);
}

function activeIdentity(value: { binding_revision: number; state_version: number; state_digest: string }) {
	return { binding_revision: value.binding_revision, state_version: value.state_version, state_digest: value.state_digest };
}

export async function inspectFinalCapstoneG2(options: StateAssessmentContextG2 & { assessmentId: string }): Promise<FinalCapstoneG2Inspection> {
	const errors: string[] = [];
	let assessment: FinalCapstoneG2Inspection["assessment"] = null;
	let authorization: AssessedRollbackAuthorizationG2 | null = null;
	let application: AssessedRollbackApplicationG2 | null = null;
	try {
		assessment = await recomputeStoredAssessmentG2({ ...options, enforceCurrent: false });
		const root = resolve(options.assessmentRoot);
		const authorizationPath = resolve(root, `authorizations/${assessment.assessment_id}.json`);
		const applicationPath = resolve(root, `applications/${assessment.assessment_id}.json`);
		const hasAuthorization = existsSync(authorizationPath); const hasApplication = existsSync(applicationPath);
		if (hasAuthorization !== hasApplication) throw new Error("assessed rollback authorization/application completeness mismatch");
		const store = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
		if (!store.integrity_valid || !store.active) throw new Error(`State store fails closed: ${store.errors.join("; ")}`);
		ordinaryJson(resolve(options.stateRoot, "active.json"), "active State pointer");
		ordinaryJson(resolve(options.stateRoot, `decisions/${assessment.bound_decision_id}.json`), "bound promotion Decision");
		ordinaryJson(resolve(options.stateRoot, `versions/${assessment.bound_state.state_digest}/state.json`), "bound accepted State version");
		if (!hasApplication) {
			if (assessment.assessment_result !== "rollback" && (assessment.rollback_target_digest !== null || assessment.comparison_id !== null && assessment.assessment_result === "retain")) throw new Error("non-rollback assessment carries rollback authority");
		} else {
			if (assessment.assessment_result !== "rollback" || !assessment.rollback_target_digest) throw new Error("non-rollback assessment has an application");
			authorization = artifactJson<AssessedRollbackAuthorizationG2>(root, `authorizations/${assessment.assessment_id}.json`, "rollback authorization");
			application = artifactJson<AssessedRollbackApplicationG2>(root, `applications/${assessment.assessment_id}.json`, "rollback application");
			if (digestObject(assessedRollbackAuthorizationBodyG2(authorization)) !== authorization.authorization_digest || digestObject(assessedRollbackApplicationBodyG2(application)) !== application.application_digest) throw new Error("assessed rollback link digest mismatch");
			if (authorization.project_id !== assessment.project_id || authorization.assessment_id !== assessment.assessment_id || authorization.assessment_digest !== assessment.assessment_digest || authorization.authority !== "host_assessed_rollback" || stableJson(authorization.expected_active) !== stableJson(assessment.bound_state) || authorization.target_state_digest !== assessment.rollback_target_digest) throw new Error("rollback authorization/assessment lineage mismatch");
			if (application.project_id !== assessment.project_id || application.assessment_id !== assessment.assessment_id || application.assessment_digest !== assessment.assessment_digest || application.authorization_id !== authorization.authorization_id || application.authorization_digest !== authorization.authorization_digest || stableJson(application.prior_active) !== stableJson(assessment.bound_state) || application.target_state_digest !== assessment.rollback_target_digest) throw new Error("rollback application/authorization lineage mismatch");
			const decision = store.decisions.find((entry) => entry.decision_id === application!.v3_rollback_decision_id);
			if (!decision || decision.kind !== "rollback" || decision.result !== "rolled_back" || decision.reason !== "operator_rollback" || decision.decision_digest !== application.v3_rollback_decision_digest || stableJson(decision.prior_active) !== stableJson(application.prior_active) || stableJson(decision.next_active) !== stableJson(application.next_active) || decision.rollback_target_digest !== application.target_state_digest) throw new Error("existing V3 rollback Decision/application lineage mismatch");
			ordinaryJson(resolve(options.stateRoot, `decisions/${decision.decision_id}.json`), "V3 rollback Decision");
			ordinaryJson(resolve(options.stateRoot, `versions/${application.target_state_digest}/state.json`), "rollback target State version");
		}
	} catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
	return { integrity_valid: errors.length === 0, errors, assessment, authorization, application };
}
