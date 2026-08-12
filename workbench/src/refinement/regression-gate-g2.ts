import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import type { TaskSpecV0B } from "../contracts/v0b-types.ts";
import type { TrustedEvidenceAdmissionRecordG1 } from "../contracts/final-capstone-g1-types.ts";
import type {
	FrozenRegressionCheckG2,
	RegressionApplicabilityKeyG2,
	RegressionGatedValidationInspectionG2,
	RegressionPackSelectionG2,
} from "../contracts/final-capstone-g2-types.ts";
import type { ActiveStateIdentityV3, HarnessStateVersionV3 } from "../contracts/v3g2-types.ts";
import type { HarnessStateEntryV3, StagedHarnessStateV3 } from "../contracts/v3-types.ts";
import { artifactRef, readJsonArtifact, writeOnceBytes, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, sha256, stableJson, treeDigest } from "../hash.ts";
import { inspectTrustedEvidenceAdmissionG1 } from "../inspect-final-capstone-g1.ts";
import {
	executeSymmetricAcceptedStateComparisonV3,
	executeSymmetricValidationV3,
	inspectSymmetricAcceptedStateComparisonV3,
	inspectValidationV3,
	type FauxValidationPortV3,
	type LocalCheckV3,
} from "./comparator-v3.ts";
import { validateAdmissionEnvelopeG1 } from "./evidence-admission-g1.ts";
import { applyValidationDecisionV3, inspectStateStoreV3 } from "../state/store-v3.ts";

const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const SELECTION_PATH = "g2-regression-selection.json";

const CHECK_DEFINITIONS = Object.freeze({
	"protected-stability": Object.freeze({
		verifierId: "final-capstone-g2-protected-stability-v1",
		source: `import { readFileSync } from "node:fs";\nimport { resolve } from "node:path";\nconst root=process.env.V0B_WORKSPACE;\nlet passed=false;\ntry{passed=typeof root==="string"&&readFileSync(resolve(root,"protected.txt"),"utf8")==="protected-stable\\n";}catch{}\nconsole.log(JSON.stringify({schema_version:1,verifier_id:"final-capstone-g2-protected-stability-v1",status:passed?"passed":"failed",summary:passed?"passed":"failed",...(passed?{}:{failed_checks:["protected-stability"]})}));\nprocess.exit(passed?0:1);\n`,
	}),
	"subject-fixed": Object.freeze({
		verifierId: "final-capstone-g2-subject-fixed-v1",
		source: `import { readFileSync } from "node:fs";\nimport { resolve } from "node:path";\nconst root=process.env.V0B_WORKSPACE;\nlet passed=false;\ntry{passed=typeof root==="string"&&readFileSync(resolve(root,"subject.txt"),"utf8")==="fixed\\n";}catch{}\nconsole.log(JSON.stringify({schema_version:1,verifier_id:"final-capstone-g2-subject-fixed-v1",status:passed?"passed":"failed",summary:passed?"passed":"failed",...(passed?{}:{failed_checks:["subject-fixed"]})}));\nprocess.exit(passed?0:1);\n`,
	}),
} as const);

const PACKS: Readonly<Record<RegressionApplicabilityKeyG2, readonly (keyof typeof CHECK_DEFINITIONS)[]>> = {
	"typescript-maintenance/verifier-failure": ["protected-stability"],
	"typescript-maintenance/none": ["protected-stability", "subject-fixed"],
} as const;

function exactKeys(value: unknown, expected: readonly string[], label: string): asserts value is Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value) || stableJson(Object.keys(value).sort()) !== stableJson([...expected].sort())) throw new Error(`${label} exact-key validation failed`);
}

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function projectRelative(projectRoot: string, target: string, label: string, requireExisting = true): string {
	const root = resolve(projectRoot);
	const absolute = resolve(target);
	if (!contained(root, absolute)) throw new Error(`${label} is cross-project or escapes project root`);
	if (requireExisting) {
		let current = root;
		for (const segment of relative(root, absolute).split(sep).filter(Boolean)) {
			current = resolve(current, segment);
			if (!existsSync(current)) throw new Error(`${label} is missing`);
			if (lstatSync(current).isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
		}
		if (!contained(realpathSync.native(root), realpathSync.native(absolute))) throw new Error(`${label} real path escapes project root`);
	}
	return relative(root, absolute).split(sep).join("/") || ".";
}

function readOrdinaryJson<T>(path: string, label: string): T {
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`${label} must be an ordinary singly linked file`);
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

function withoutSelectionDigest(record: RegressionPackSelectionG2): Omit<RegressionPackSelectionG2, "selection_digest"> {
	const { selection_digest: _digest, ...body } = record;
	return body;
}

function applies(entry: HarnessStateEntryV3, context: TrustedEvidenceAdmissionRecordG1["trusted_task_context"]): boolean {
	const taskMatch = entry.applicability.task_kinds.length === 0 || entry.applicability.task_kinds.includes(context.task_kind);
	const failureMatch = entry.applicability.failure_families.length === 0 || (context.failure_family !== null && entry.applicability.failure_families.includes(context.failure_family));
	return taskMatch && failureMatch;
}

function applicabilityKey(context: TrustedEvidenceAdmissionRecordG1["trusted_task_context"]): RegressionApplicabilityKeyG2 {
	const key = `${context.task_kind}/${context.failure_family ?? "none"}`;
	if (!Object.hasOwn(PACKS, key)) throw new Error("unknown or empty trusted applicability regression pack");
	return key as RegressionApplicabilityKeyG2;
}

function checkTask(options: { workspaceRoot: string; workspaceDigest: string; checkId: keyof typeof CHECK_DEFINITIONS }): TaskSpecV0B {
	const definition = CHECK_DEFINITIONS[options.checkId];
	const sourceSha256 = sha256(definition.source);
	return {
		schema_version: 1,
		task_id: `final-capstone-g2-${options.checkId}`,
		instruction_ref: "final-capstone-g2-host-regression-pack-v1",
		instruction_sha256: sha256(`final-capstone-g2-host-regression-pack-v1/${options.checkId}`),
		workspace_source_ref: resolve(options.workspaceRoot),
		workspace_source_digest: options.workspaceDigest,
		writable_paths: [],
		protected_paths: [],
		verifier_id: definition.verifierId,
		verifier_ref: `host-regression-pack-v1/${options.checkId}.mjs`,
		verifier_sha256: sourceSha256,
		acceptance_visibility: "hidden_external",
		tool_profile_id: "final_capstone_g2_regression_only",
		command_descriptors: [],
		verifier_command: { executable: "current_node_executable", argv: [`host-regression-pack-v1/${options.checkId}.mjs`], cwd: "project", timeout_ms: 5_000, output_limit_bytes: 8_192 },
	};
}

function materializeChecks(projectRoot: string, workspaceRoot: string, workspaceDigest: string, key: RegressionApplicabilityKeyG2): { frozen: FrozenRegressionCheckG2[]; local: LocalCheckV3[] } {
	const sourceRoot = resolve(projectRoot, ".runs/final-capstone/g2/host-regression-pack-v1");
	mkdirSync(sourceRoot, { recursive: true });
	const frozen: FrozenRegressionCheckG2[] = [];
	const local: LocalCheckV3[] = [];
	for (const checkId of PACKS[key]) {
		const definition = CHECK_DEFINITIONS[checkId];
		const sourcePath = resolve(sourceRoot, `${checkId}.mjs`);
		if (existsSync(sourcePath)) {
			if (readFileSync(sourcePath, "utf8") !== definition.source) throw new Error("Host regression check source write-once conflict");
		} else writeOnceBytes(sourceRoot, `${checkId}.mjs`, definition.source);
		const task = checkTask({ workspaceRoot, workspaceDigest, checkId });
		const item: FrozenRegressionCheckG2 = { check_id: checkId, verifier_id: definition.verifierId, source_sha256: sha256(definition.source), source_size_bytes: Buffer.byteLength(definition.source, "utf8"), task, task_digest: digestObject(task) };
		frozen.push(item); local.push({ task, sourcePath });
	}
	if (frozen.length === 0 || new Set(frozen.map((entry) => entry.check_id)).size !== frozen.length) throw new Error("empty or duplicate Host regression pack");
	return { frozen, local };
}

async function validatedAdmission(options: { projectRoot: string; admissionRoot: string; registrationPath: string; admissionId: string; projectId: string }): Promise<TrustedEvidenceAdmissionRecordG1> {
	const inspected = await inspectTrustedEvidenceAdmissionG1({ projectRoot: options.projectRoot, admissionRoot: options.admissionRoot, registrationPath: options.registrationPath, admissionId: options.admissionId, expectedProjectId: options.projectId });
	if (!inspected.integrity_valid) throw new Error(`Goal 1 admission fails closed: ${inspected.errors.join("; ")}`);
	const path = resolve(options.projectRoot, options.admissionRoot, options.admissionId, "admission.json");
	const record = validateAdmissionEnvelopeG1(readOrdinaryJson(path, "Goal 1 admission"));
	if (record.admission_digest !== inspected.admission_digest || record.project_id !== options.projectId) throw new Error("Goal 1 admission inspection identity mismatch");
	return record;
}

function buildSelection(options: { projectRoot: string; admissionRoot: string; registrationPath: string; admission: TrustedEvidenceAdmissionRecordG1; candidateStateDigest: string; workspaceRoot: string; workspaceDigest: string; checks: FrozenRegressionCheckG2[] }): RegressionPackSelectionG2 {
	const key = applicabilityKey(options.admission.trusted_task_context);
	const packDigest = digestObject(options.checks.map((entry) => ({ check_id: entry.check_id, verifier_id: entry.verifier_id, source_sha256: entry.source_sha256, task_digest: entry.task_digest })));
	const seed = { project_id: options.admission.project_id, admission_digest: options.admission.admission_digest, candidate_state_digest: options.candidateStateDigest, pack_digest: packDigest };
	const body: Omit<RegressionPackSelectionG2, "selection_digest"> = {
		schema_version: 1,
		selection_id: `regression-selection-${digestObject(seed).slice(0, 32)}`,
		project_id: options.admission.project_id,
		admission_root: projectRelative(options.projectRoot, resolve(options.projectRoot, options.admissionRoot), "admission root"),
		registration_path: projectRelative(options.projectRoot, resolve(options.projectRoot, options.registrationPath), "registration path"),
		admission_id: options.admission.admission_id,
		admission_digest: options.admission.admission_digest,
		trusted_task_context: structuredClone(options.admission.trusted_task_context),
		applicability_key: key,
		candidate_state_digest: options.candidateStateDigest,
		source_workspace_ref: projectRelative(options.projectRoot, options.workspaceRoot, "source Workspace"),
		source_workspace_digest: options.workspaceDigest,
		checks: structuredClone(options.checks),
		pack_digest: packDigest,
	};
	return { ...body, selection_digest: digestObject(body) };
}

function validateStoredSelection(options: { projectRoot: string; runRoot: string; selection: RegressionPackSelectionG2; admission: TrustedEvidenceAdmissionRecordG1; candidateState: { state_digest: string; entries: HarnessStateEntryV3[] }; seed: { source_workspace_digest: string; candidate_state_digest: string; frozen_identity: { regression_checks: Array<{ verifier_id: string; source_sha256: string; task_digest: string }>; regression_set_digest: string } } }): string[] {
	const errors: string[] = [];
	try {
		const selection = options.selection;
		exactKeys(selection, ["schema_version", "selection_id", "project_id", "admission_root", "registration_path", "admission_id", "admission_digest", "trusted_task_context", "applicability_key", "candidate_state_digest", "source_workspace_ref", "source_workspace_digest", "checks", "pack_digest", "selection_digest"], "regression selection");
		if (selection.schema_version !== 1 || !ID.test(selection.selection_id) || !SHA256.test(selection.selection_digest) || digestObject(withoutSelectionDigest(selection)) !== selection.selection_digest) throw new Error("regression selection identity mismatch");
		const key = applicabilityKey(options.admission.trusted_task_context);
		if (selection.project_id !== options.admission.project_id || selection.admission_id !== options.admission.admission_id || selection.admission_digest !== options.admission.admission_digest || stableJson(selection.trusted_task_context) !== stableJson(options.admission.trusted_task_context) || selection.applicability_key !== key) throw new Error("regression selection Goal 1 admission/applicability mismatch");
		if (selection.candidate_state_digest !== options.candidateState.state_digest || selection.candidate_state_digest !== options.seed.candidate_state_digest || selection.source_workspace_digest !== options.seed.source_workspace_digest) throw new Error("regression selection State/Workspace lineage mismatch");
		if (options.candidateState.entries.length === 0 || !options.candidateState.entries.every((entry) => applies(entry, options.admission.trusted_task_context))) throw new Error("Candidate/State applicability does not authorize the trusted context");
		const workspaceRoot = resolve(options.projectRoot, selection.source_workspace_ref);
		projectRelative(options.projectRoot, workspaceRoot, "stored source Workspace", false);
		const expected = PACKS[key].map((checkId) => {
			const definition = CHECK_DEFINITIONS[checkId]; const task = checkTask({ workspaceRoot, workspaceDigest: selection.source_workspace_digest, checkId });
			return { check_id: checkId, verifier_id: definition.verifierId, source_sha256: sha256(definition.source), source_size_bytes: Buffer.byteLength(definition.source, "utf8"), task, task_digest: digestObject(task) } satisfies FrozenRegressionCheckG2;
		});
		if (expected.length === 0 || new Set(selection.checks.map((entry) => entry.check_id)).size !== selection.checks.length || stableJson(selection.checks) !== stableJson(expected)) throw new Error("regression selection membership/order/source/task mismatch");
		const packDigest = digestObject(expected.map((entry) => ({ check_id: entry.check_id, verifier_id: entry.verifier_id, source_sha256: entry.source_sha256, task_digest: entry.task_digest })));
		if (selection.pack_digest !== packDigest) throw new Error("regression pack digest mismatch");
		const frozenChecks = expected.map((entry) => ({ verifier_id: entry.verifier_id, source_sha256: entry.source_sha256, task_digest: entry.task_digest }));
		if (stableJson(options.seed.frozen_identity.regression_checks) !== stableJson(frozenChecks) || options.seed.frozen_identity.regression_set_digest !== digestObject(expected.map((entry) => ({ task: entry.task, source_sha256: entry.source_sha256 })))) throw new Error("V3 validation/comparison regression membership mismatch");
		for (const [index, item] of expected.entries()) {
			const snapshot = artifactRef(options.runRoot, `config/regression-${index + 1}.mjs`, "text/javascript; charset=utf-8", false);
			if (snapshot.sha256 !== item.source_sha256 || snapshot.size_bytes !== item.source_size_bytes) throw new Error("frozen regression source snapshot mismatch");
		}
	} catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
	return errors;
}

export async function inspectRegressionGatedValidationG2(options: { projectRoot: string; runRoot: string }): Promise<RegressionGatedValidationInspectionG2> {
	const errors: string[] = [];
	let selection: RegressionPackSelectionG2 | null = null;
	const validation = inspectValidationV3(options.runRoot);
	if (!validation.integrity_valid || !validation.validation || !validation.seed) errors.push(`V3 validation fails closed: ${validation.errors.join("; ")}`);
	try {
		selection = readJsonArtifact<RegressionPackSelectionG2>(options.runRoot, SELECTION_PATH);
		const admission = await validatedAdmission({ projectRoot: options.projectRoot, admissionRoot: selection.admission_root, registrationPath: selection.registration_path, admissionId: selection.admission_id, projectId: selection.project_id });
		if (!validation.seed) throw new Error("V3 validation Seed missing");
		const candidateState = readJsonArtifact<StagedHarnessStateV3>(options.runRoot, validation.seed.candidate_state_ref.path);
		errors.push(...validateStoredSelection({ projectRoot: options.projectRoot, runRoot: options.runRoot, selection, admission, candidateState, seed: validation.seed }));
	} catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
	return { integrity_valid: errors.length === 0, errors, selection, validation_id: validation.validation?.validation_id ?? null, validation_digest: validation.validation?.validation_digest ?? null, recomputed_decision: validation.recomputed_decision };
}

export async function executeRegressionGatedCandidatePublicationG2(options: {
	projectRoot: string; runRoot: string; validationId: string; projectId: string;
	admissionRoot: string; registrationPath: string; admissionId: string;
	stateRoot: string; stagedStateRoot: string; candidateState: StagedHarnessStateV3; expectedActive: ActiveStateIdentityV3;
	sourceWorkspaceRoot: string; task: TaskSpecV0B; verifier: LocalCheckV3;
	providerModelProfileDigest: string; toolProfileDigest: string; budgetDigest: string; hardConstraintsDigest: string;
	immutableBasePrompt: string; immutableBasePromptSha256: string; port: FauxValidationPortV3;
}) {
	exactKeys(options, ["projectRoot", "runRoot", "validationId", "projectId", "admissionRoot", "registrationPath", "admissionId", "stateRoot", "stagedStateRoot", "candidateState", "expectedActive", "sourceWorkspaceRoot", "task", "verifier", "providerModelProfileDigest", "toolProfileDigest", "budgetDigest", "hardConstraintsDigest", "immutableBasePrompt", "immutableBasePromptSha256", "port"], "Goal 2 Candidate publication request");
	if (existsSync(options.runRoot)) throw new Error("Goal 2 validation Run root already exists");
	projectRelative(options.projectRoot, options.runRoot, "validation Run root", false);
	projectRelative(options.projectRoot, options.sourceWorkspaceRoot, "source Workspace");
	const admission = await validatedAdmission({ projectRoot: options.projectRoot, admissionRoot: options.admissionRoot, registrationPath: options.registrationPath, admissionId: options.admissionId, projectId: options.projectId });
	const store = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	if (!store.integrity_valid || !store.active || stableJson({ binding_revision: store.active.binding_revision, state_version: store.active.state_version, state_digest: store.active.state_digest }) !== stableJson(options.expectedActive)) throw new Error(`active State fails closed or is stale: ${store.errors.join("; ")}`);
	const base = store.versions.find((entry) => entry.state_digest === store.active!.state_digest);
	if (!base) throw new Error("active accepted Base State is missing");
	if (options.candidateState.expected_base_state_digest !== base.state_digest || options.candidateState.entries.length === 0 || !options.candidateState.entries.every((entry) => applies(entry, admission.trusted_task_context))) throw new Error("Candidate applicability/base does not match trusted Goal 1 admission");
	const workspaceDigest = treeDigest(options.sourceWorkspaceRoot);
	const key = applicabilityKey(admission.trusted_task_context);
	const pack = materializeChecks(options.projectRoot, options.sourceWorkspaceRoot, workspaceDigest, key);
	const validation = await executeSymmetricValidationV3({ projectRoot: options.projectRoot, runRoot: options.runRoot, validationId: options.validationId, projectId: options.projectId, sourceWorkspaceRoot: options.sourceWorkspaceRoot, task: options.task, verifier: options.verifier, regressions: pack.local, baseState: base, candidateState: options.candidateState, providerModelProfileDigest: options.providerModelProfileDigest, toolProfileDigest: options.toolProfileDigest, budgetDigest: options.budgetDigest, hardConstraintsDigest: options.hardConstraintsDigest, port: options.port });
	const selection = buildSelection({ projectRoot: options.projectRoot, admissionRoot: options.admissionRoot, registrationPath: options.registrationPath, admission, candidateStateDigest: options.candidateState.state_digest, workspaceRoot: options.sourceWorkspaceRoot, workspaceDigest, checks: pack.frozen });
	writeOnceJson(options.runRoot, SELECTION_PATH, selection);
	const inspected = await inspectRegressionGatedValidationG2({ projectRoot: options.projectRoot, runRoot: options.runRoot });
	if (!inspected.integrity_valid) throw new Error(`Goal 2 regression gate fails closed: ${inspected.errors.join("; ")}`);
	const applied = await applyValidationDecisionV3({ stateRoot: options.stateRoot, projectId: options.projectId, runRoot: options.runRoot, validationRef: validation.validationRef, stagedStateRoot: options.stagedStateRoot, candidateStateDigest: options.candidateState.state_digest, expectedActive: options.expectedActive, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	return { selection, validation: validation.validation, applied };
}

export async function executeAcceptedStateRegressionComparisonG2(options: {
	projectRoot: string; runRoot: string; comparisonId: string; projectId: string;
	admissionRoot: string; registrationPath: string; admissionId: string;
	stateRoot: string; expectedActive: ActiveStateIdentityV3;
	sourceWorkspaceRoot: string; task: TaskSpecV0B; verifier: LocalCheckV3;
	providerModelProfileDigest: string; toolProfileDigest: string; budgetDigest: string; hardConstraintsDigest: string;
	immutableBasePrompt: string; immutableBasePromptSha256: string; port: FauxValidationPortV3;
}) {
	exactKeys(options, ["projectRoot", "runRoot", "comparisonId", "projectId", "admissionRoot", "registrationPath", "admissionId", "stateRoot", "expectedActive", "sourceWorkspaceRoot", "task", "verifier", "providerModelProfileDigest", "toolProfileDigest", "budgetDigest", "hardConstraintsDigest", "immutableBasePrompt", "immutableBasePromptSha256", "port"], "Goal 2 accepted-State comparison request");
	if (existsSync(options.runRoot)) throw new Error("Goal 2 comparison Run root already exists");
	projectRelative(options.projectRoot, options.runRoot, "comparison Run root", false);
	projectRelative(options.projectRoot, options.sourceWorkspaceRoot, "source Workspace");
	const admission = await validatedAdmission({ projectRoot: options.projectRoot, admissionRoot: options.admissionRoot, registrationPath: options.registrationPath, admissionId: options.admissionId, projectId: options.projectId });
	const store = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	if (!store.integrity_valid || !store.active || stableJson({ binding_revision: store.active.binding_revision, state_version: store.active.state_version, state_digest: store.active.state_digest }) !== stableJson(options.expectedActive)) throw new Error(`active State fails closed or is stale: ${store.errors.join("; ")}`);
	const current = store.versions.find((entry) => entry.state_digest === store.active!.state_digest);
	const parent = current?.parent_state_digest ? store.versions.find((entry) => entry.state_digest === current.parent_state_digest) : null;
	if (!current || !parent || current.entries.length === 0 || !current.entries.every((entry) => applies(entry, admission.trusted_task_context))) throw new Error("accepted current/immediate-parent State or applicability is invalid");
	const workspaceDigest = treeDigest(options.sourceWorkspaceRoot);
	const pack = materializeChecks(options.projectRoot, options.sourceWorkspaceRoot, workspaceDigest, applicabilityKey(admission.trusted_task_context));
	const comparison = await executeSymmetricAcceptedStateComparisonV3({ projectRoot: options.projectRoot, runRoot: options.runRoot, comparisonId: options.comparisonId, projectId: options.projectId, sourceWorkspaceRoot: options.sourceWorkspaceRoot, task: options.task, verifier: options.verifier, regressions: pack.local, parentState: parent, currentState: current, providerModelProfileDigest: options.providerModelProfileDigest, toolProfileDigest: options.toolProfileDigest, budgetDigest: options.budgetDigest, hardConstraintsDigest: options.hardConstraintsDigest, port: options.port });
	const selection = buildSelection({ projectRoot: options.projectRoot, admissionRoot: options.admissionRoot, registrationPath: options.registrationPath, admission, candidateStateDigest: current.state_digest, workspaceRoot: options.sourceWorkspaceRoot, workspaceDigest, checks: pack.frozen });
	writeOnceJson(options.runRoot, SELECTION_PATH, selection);
	const inspected = await inspectAcceptedStateRegressionComparisonG2({ projectRoot: options.projectRoot, runRoot: options.runRoot });
	if (!inspected.integrity_valid) throw new Error(`Goal 2 accepted-State regression comparison fails closed: ${inspected.errors.join("; ")}`);
	return { selection, comparison: comparison.comparison, inspection: inspected };
}

export async function inspectAcceptedStateRegressionComparisonG2(options: { projectRoot: string; runRoot: string }) {
	const comparison = inspectSymmetricAcceptedStateComparisonV3(options.runRoot);
	const errors = [...comparison.errors];
	let selection: RegressionPackSelectionG2 | null = null;
	try {
		selection = readJsonArtifact<RegressionPackSelectionG2>(options.runRoot, SELECTION_PATH);
		const admission = await validatedAdmission({ projectRoot: options.projectRoot, admissionRoot: selection.admission_root, registrationPath: selection.registration_path, admissionId: selection.admission_id, projectId: selection.project_id });
		if (!comparison.seed) throw new Error("accepted-State comparison Seed missing");
		const currentState = readJsonArtifact<HarnessStateVersionV3>(options.runRoot, comparison.seed.current_state_ref.path);
		const seedShape = { source_workspace_digest: comparison.seed.source_workspace_digest, candidate_state_digest: comparison.seed.current_state_digest, frozen_identity: comparison.seed.frozen_identity };
		errors.push(...validateStoredSelection({ projectRoot: options.projectRoot, runRoot: options.runRoot, selection, admission, candidateState: currentState, seed: seedShape }));
	} catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
	return { ...comparison, integrity_valid: errors.length === 0, errors, selection };
}

export async function loadValidatedAdmissionG2(options: { projectRoot: string; admissionRoot: string; registrationPath: string; admissionId: string; projectId: string }): Promise<TrustedEvidenceAdmissionRecordG1> {
	return await validatedAdmission(options);
}
