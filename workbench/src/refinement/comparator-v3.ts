import { existsSync, lstatSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { ArtifactRefV0B, TaskSpecV0B, VerifierResultV0B } from "../contracts/v0b-types.ts";
import type {
	FauxExecutionEvidenceV3,
	FauxExecutionEventV3,
	HarnessStateVersionV3,
	InterventionValidationSeedV3,
	InterventionValidationV3,
	StructuralUsageVectorV3,
	ValidationArmV3,
	ValidationDecisionV3,
	ValidationInspectionV3,
} from "../contracts/v3g2-types.ts";
import type { StagedHarnessStateV3 } from "../contracts/v3-types.ts";
import { JsonlSessionRepo } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { artifactRef, readJsonArtifact, validateArtifactRef, writeOnceBytes, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, fileSha256, sha256, stableJson, treeDigest, treeInventory } from "../hash.ts";
import { runExternalVerifierV0B } from "../verifier/runner.ts";
import { createTemporaryWorkspace } from "../workspace/temp-copy.ts";
import { acceptedStateVersionDigestV3, stagedStateDigestV3 } from "../state/identity-v3.ts";

const SHA256 = /^[a-f0-9]{64}$/;
const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;

function exactKeys(value: unknown, expected: readonly string[], label: string): asserts value is Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	const actual = Object.keys(value).sort(); const wanted = [...expected].sort();
	if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) throw new Error(`${label} exact-key validation failed`);
}

export interface LocalCheckV3 {
	task: TaskSpecV0B;
	sourcePath: string;
}

export interface FauxValidationPortV3 {
	execute(options: {
		workspaceRoot: string;
		state: HarnessStateVersionV3 | StagedHarnessStateV3;
	}): Promise<{ settled: true; events: FauxExecutionEventV3[] }>;
}

function validateStates(base: HarnessStateVersionV3, candidate: StagedHarnessStateV3): void {
	exactKeys(base, ["schema_version", "status", "project_id", "state_version", "parent_state_digest", "source_candidate_id", "source_candidate_digest", "source_staged_state_digest", "entries", "state_digest"], "accepted Base State");
	exactKeys(candidate, ["schema_version", "status", "state_digest", "candidate_id", "candidate_digest", "evidence_identity", "expected_base_state_digest", "entries"], "staged Candidate State");
	exactKeys(candidate.evidence_identity, ["evidence_id", "evidence_digest"], "staged Candidate evidence identity");
	for (const [label, entries] of [["accepted Base", base.entries], ["staged Candidate", candidate.entries]] as const) {
		if (!Array.isArray(entries) || entries.length > 2 || new Set(entries.map((entry) => entry.entry_id)).size !== entries.length) throw new Error(`${label} State entry membership invalid`);
		for (const entry of entries) {
			exactKeys(entry, entry.kind === "prompt_addendum"
				? ["kind", "entry_id", "content", "applicability", "content_sha256", "composed_prompt_sha256"]
				: ["kind", "entry_id", "skill_name", "description", "markdown_body", "applicability", "source_ref", "source_sha256", "source_size_bytes", "wrapper_sha256", "wrapper_size_bytes", "disable_model_invocation", "invocation_mode"], `${label} State entry`);
			exactKeys(entry.applicability, ["task_kinds", "failure_families"], `${label} applicability`);
			if (entry.kind === "prompt_addendum" && sha256(entry.content) !== entry.content_sha256) throw new Error(`${label} prompt content identity mismatch`);
			if (entry.kind === "adaptive_skill" && (entry.disable_model_invocation !== true || entry.invocation_mode !== "explicit_skill" || entry.source_ref !== `skills/${entry.skill_name}/SKILL.md`)) throw new Error(`${label} adaptive Skill authority identity mismatch`);
		}
	}
	if (base.schema_version !== 1 || base.status !== "accepted" || acceptedStateVersionDigestV3(base) !== base.state_digest) throw new Error("accepted Base State identity mismatch");
	if (candidate.schema_version !== 1 || candidate.status !== "staged_inactive" || stagedStateDigestV3(candidate) !== candidate.state_digest) throw new Error("staged Candidate State identity mismatch");
	if (candidate.expected_base_state_digest !== base.state_digest) throw new Error("staged Candidate base is stale");
}

function validateTask(task: TaskSpecV0B, sourceWorkspaceRoot: string, sourceWorkspaceDigest: string, sourcePath: string): void {
	if (task.schema_version !== 1 || resolve(task.workspace_source_ref) !== resolve(sourceWorkspaceRoot) || task.workspace_source_digest !== sourceWorkspaceDigest) throw new Error("validation task Workspace identity mismatch");
	if (!existsSync(sourcePath) || fileSha256(sourcePath) !== task.verifier_sha256) throw new Error("validation check source identity mismatch");
}

function validateEvents(value: FauxExecutionEvidenceV3): StructuralUsageVectorV3 {
	exactKeys(value, ["schema_version", "arm", "settled", "events"], "Faux execution evidence");
	if (value.schema_version !== 1 || value.settled !== true || !Array.isArray(value.events)) throw new Error("invalid Faux execution evidence");
	const ids = new Set<string>();
	let providerCalls = 0;
	let toolCalls = 0;
	let structuralPathologyCount = 0;
	for (const [index, event] of value.events.entries()) {
		if (!event || typeof event !== "object" || event.seq !== index + 1) throw new Error("Faux execution sequence is not contiguous");
		const expectedKeys = event.type === "structural_pathology" ? ["check_id", "seq", "type"] : ["call_id", "seq", "type"];
		if (stableJson(Object.keys(event).sort()) !== stableJson(expectedKeys)) throw new Error("Faux execution event exact-key validation failed");
		const id = event.type === "structural_pathology" ? event.check_id : event.call_id;
		if (!ID.test(id) || ids.has(id)) throw new Error("Faux execution event identity is invalid or duplicated");
		ids.add(id);
		if (event.type === "provider_call") providerCalls++;
		else if (event.type === "tool_call") toolCalls++;
		else if (event.type === "structural_pathology") structuralPathologyCount++;
		else throw new Error("unknown Faux execution event");
	}
	return { structural_pathology_count: structuralPathologyCount, tool_calls: toolCalls, provider_calls: providerCalls };
}

export function decideValidationV3(options: {
	fairnessValid: boolean;
	base: Pick<ValidationArmV3, "verifier_status" | "regression_passed" | "authority_valid" | "metrics">;
	candidate: Pick<ValidationArmV3, "verifier_status" | "regression_passed" | "authority_valid" | "metrics">;
}): ValidationDecisionV3 {
	if (!options.fairnessValid || !options.base.authority_valid || !options.candidate.authority_valid) return { result: "reject", reason: "authority_or_fairness_invalid" };
	if (!options.candidate.regression_passed) return { result: "reject", reason: "candidate_regression_failed" };
	const basePassed = options.base.verifier_status === "passed";
	const candidatePassed = options.candidate.verifier_status === "passed";
	if (!candidatePassed) return { result: "reject", reason: basePassed ? "candidate_failed" : "both_failed" };
	if (!basePassed) return { result: "promote", reason: "base_failed_candidate_passed" };
	const keys = ["structural_pathology_count", "tool_calls", "provider_calls"] as const;
	const noWorse = keys.every((key) => options.candidate.metrics[key] <= options.base.metrics[key]);
	const strictlyBetter = keys.some((key) => options.candidate.metrics[key] < options.base.metrics[key]);
	return noWorse && strictlyBetter
		? { result: "promote", reason: "both_passed_material_improvement" }
		: { result: "reject", reason: "no_material_improvement" };
}

function materializeCheck(runRoot: string, relativePath: string, check: LocalCheckV3): { path: string; ref: ArtifactRefV0B } {
	const bytes = readFileSync(check.sourcePath);
	if (sha256(bytes) !== check.task.verifier_sha256) throw new Error("check source changed before validation");
	const path = writeOnceBytes(runRoot, relativePath, bytes);
	return { path, ref: artifactRef(runRoot, path, "text/javascript; charset=utf-8", false) };
}

function copyWorkspace(options: { projectRoot: string; sourceRoot: string; targetRoot: string; workspaceId: string; task: TaskSpecV0B }): void {
	mkdirSync(dirname(options.targetRoot), { recursive: true });
	createTemporaryWorkspace({
		projectRoot: options.projectRoot,
		sourceRoot: options.sourceRoot,
		targetRoot: options.targetRoot,
		workspaceId: options.workspaceId,
		task: options.task,
	});
}

async function executeArm(options: {
	projectRoot: string;
	runRoot: string;
	arm: "base" | "candidate";
	state: HarnessStateVersionV3 | StagedHarnessStateV3;
	stateDigest: string;
	seed: InterventionValidationSeedV3;
	sourceWorkspaceRoot: string;
	task: TaskSpecV0B;
	verifier: { path: string; ref: ArtifactRefV0B };
	regressions: Array<{ task: TaskSpecV0B; path: string; ref: ArtifactRefV0B }>;
	port: FauxValidationPortV3;
}): Promise<{ arm: ValidationArmV3; ref: ArtifactRefV0B }> {
	const initialRoot = resolve(options.runRoot, "initial", options.arm);
	const workspaceRoot = resolve(options.runRoot, "workspaces", options.arm);
	copyWorkspace({ projectRoot: options.projectRoot, sourceRoot: options.sourceWorkspaceRoot, targetRoot: initialRoot, workspaceId: `${options.seed.validation_id}-${options.arm}-initial`, task: options.task });
	copyWorkspace({ projectRoot: options.projectRoot, sourceRoot: options.sourceWorkspaceRoot, targetRoot: workspaceRoot, workspaceId: `${options.seed.validation_id}-${options.arm}-working`, task: options.task });
	const initialDigest = treeDigest(initialRoot);
	if (initialDigest !== options.seed.source_workspace_digest || treeDigest(workspaceRoot) !== initialDigest) throw new Error("symmetric arm initial Workspace mismatch");
	const initialRef = writeOnceJson(options.runRoot, `arms/${options.arm}/initial-workspace.json`, { schema_version: 1, digest: initialDigest, inventory: treeInventory(initialRoot) });
	const repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: options.runRoot, shellEnv: {} }), sessionsRoot: resolve(options.runRoot, "sessions") });
	const session = await repo.create({ cwd: workspaceRoot, id: `${options.seed.validation_id}-${options.arm}-session`, metadata: { session_policy: "fresh_both" } });
	const sessionMetadata = await session.getMetadata(); const sessionEntries = await session.getEntries();
	if (sessionMetadata.parentSessionPath !== undefined || sessionEntries.length !== 0) throw new Error("symmetric validation Session must be fresh and empty");
	const sessionRef = artifactRef(options.runRoot, sessionMetadata.path, "application/x-ndjson", false);
	const raw = await options.port.execute({ workspaceRoot, state: structuredClone(options.state) });
	const execution: FauxExecutionEvidenceV3 = { schema_version: 1, arm: options.arm, settled: raw.settled, events: structuredClone(raw.events) };
	const metrics = validateEvents(execution);
	const executionRef = writeOnceJson(options.runRoot, `arms/${options.arm}/execution.json`, execution);
	const attemptId = `${options.seed.validation_id}-${options.arm}-attempt`;
	const verifierResult = await runExternalVerifierV0B({
		projectRoot: options.projectRoot,
		runRoot: options.runRoot,
		workspaceRoot,
		attemptId,
		task: options.task,
		verifierSnapshotPath: options.verifier.path,
		verifierSnapshotRef: options.verifier.ref,
		outputPath: `arms/${options.arm}/verifier-output.txt`,
	});
	const verifierResultRef = writeOnceJson(options.runRoot, `arms/${options.arm}/verifier-result.json`, verifierResult);
	const regressionResultRefs: ArtifactRefV0B[] = [];
	let regressionPassed = true;
	for (const [index, regression] of options.regressions.entries()) {
		const result = await runExternalVerifierV0B({
			projectRoot: options.projectRoot,
			runRoot: options.runRoot,
			workspaceRoot,
			attemptId,
			task: regression.task,
			verifierSnapshotPath: regression.path,
			verifierSnapshotRef: regression.ref,
			outputPath: `arms/${options.arm}/regression-${index + 1}-output.txt`,
		});
		regressionPassed = regressionPassed && result.status === "passed";
		regressionResultRefs.push(writeOnceJson(options.runRoot, `arms/${options.arm}/regression-${index + 1}-result.json`, result));
	}
	const arm: ValidationArmV3 = {
		schema_version: 1,
		arm: options.arm,
		treatment_state_digest: options.stateDigest,
		common_identity_digest: options.seed.common_identity_digest,
		initial_workspace_digest: initialDigest,
		initial_workspace_ref: initialRef,
		session_id: sessionMetadata.id,
		session_ref: sessionRef,
		session_parent: null,
		session_entry_count_before: 0,
		execution_ref: executionRef,
		verifier_result_ref: verifierResultRef,
		regression_result_refs: regressionResultRefs,
		final_workspace_digest: treeDigest(workspaceRoot),
		metrics,
		verifier_status: verifierResult.status,
		regression_passed: regressionPassed,
		authority_valid: true,
	};
	return { arm, ref: writeOnceJson(options.runRoot, `arms/${options.arm}/arm.json`, arm) };
}

export async function executeSymmetricValidationV3(options: {
	projectRoot: string;
	runRoot: string;
	validationId: string;
	projectId: string;
	sourceWorkspaceRoot: string;
	task: TaskSpecV0B;
	verifier: LocalCheckV3;
	regressions: LocalCheckV3[];
	baseState: HarnessStateVersionV3;
	candidateState: StagedHarnessStateV3;
	providerModelProfileDigest: string;
	toolProfileDigest: string;
	budgetDigest: string;
	hardConstraintsDigest: string;
	port: FauxValidationPortV3;
}): Promise<{ validation: InterventionValidationV3; validationRef: ArtifactRefV0B }> {
	if (!ID.test(options.validationId) || !ID.test(options.projectId)) throw new Error("invalid validation or project identity");
	if (existsSync(options.runRoot)) throw new Error("validation Run root already exists");
	mkdirSync(options.runRoot, { recursive: true });
	validateStates(options.baseState, options.candidateState);
	const sourceWorkspaceDigest = treeDigest(options.sourceWorkspaceRoot);
	validateTask(options.task, options.sourceWorkspaceRoot, sourceWorkspaceDigest, options.verifier.sourcePath);
	for (const regression of options.regressions) validateTask(regression.task, options.sourceWorkspaceRoot, sourceWorkspaceDigest, regression.sourcePath);
	const baseStateRef = writeOnceJson(options.runRoot, "config/base-state.json", options.baseState);
	const candidateStateRef = writeOnceJson(options.runRoot, "config/candidate-state.json", options.candidateState);
	const verifier = materializeCheck(options.runRoot, "config/external-verifier.mjs", options.verifier);
	const regressions = options.regressions.map((entry, index) => ({ task: entry.task, ...materializeCheck(options.runRoot, `config/regression-${index + 1}.mjs`, entry) }));
	const frozenIdentity = {
		task_digest: digestObject(options.task),
		instruction_digest: options.task.instruction_sha256,
		provider_model_profile_digest: options.providerModelProfileDigest,
		tool_profile_digest: options.toolProfileDigest,
		external_verifier_id: options.verifier.task.verifier_id,
		external_verifier_source_sha256: verifier.ref.sha256,
		external_verifier_digest: digestObject({ task: options.verifier.task, source_sha256: verifier.ref.sha256 }),
		regression_checks: regressions.map((entry) => ({ verifier_id: entry.task.verifier_id, source_sha256: entry.ref.sha256, task_digest: digestObject(entry.task) })),
		regression_set_digest: digestObject(regressions.map((entry) => ({ task: entry.task, source_sha256: entry.ref.sha256 }))),
		budget_digest: options.budgetDigest,
		hard_constraints_digest: options.hardConstraintsDigest,
		session_policy: "fresh_both" as const,
	};
	for (const [label, digest] of Object.entries(frozenIdentity).filter(([key]) => key.endsWith("digest") || key.endsWith("sha256"))) if (!SHA256.test(String(digest))) throw new Error(`invalid frozen ${label}`);
	if (!ID.test(frozenIdentity.external_verifier_id) || frozenIdentity.regression_checks.some((entry) => !ID.test(entry.verifier_id) || !SHA256.test(entry.source_sha256) || !SHA256.test(entry.task_digest))) throw new Error("invalid frozen check identities");
	const seedBody = {
		schema_version: 1 as const,
		validation_id: options.validationId,
		project_id: options.projectId,
		candidate_id: options.candidateState.candidate_id,
		candidate_digest: options.candidateState.candidate_digest,
		base_state_digest: options.baseState.state_digest,
		candidate_state_digest: options.candidateState.state_digest,
		source_workspace_digest: sourceWorkspaceDigest,
		base_state_ref: baseStateRef,
		candidate_state_ref: candidateStateRef,
		frozen_identity: frozenIdentity,
		common_identity_digest: digestObject({ source_workspace_digest: sourceWorkspaceDigest, frozen_identity: frozenIdentity }),
	};
	const seed: InterventionValidationSeedV3 = { ...seedBody, seed_digest: digestObject(seedBody) };
	const seedRef = writeOnceJson(options.runRoot, "config/validation-seed.json", seed);
	const base = await executeArm({ projectRoot: options.projectRoot, runRoot: options.runRoot, arm: "base", state: options.baseState, stateDigest: options.baseState.state_digest, seed, sourceWorkspaceRoot: options.sourceWorkspaceRoot, task: options.task, verifier, regressions, port: options.port });
	const candidate = await executeArm({ projectRoot: options.projectRoot, runRoot: options.runRoot, arm: "candidate", state: options.candidateState, stateDigest: options.candidateState.state_digest, seed, sourceWorkspaceRoot: options.sourceWorkspaceRoot, task: options.task, verifier, regressions, port: options.port });
	if (treeDigest(resolve(options.runRoot, "initial", "base")) !== sourceWorkspaceDigest || treeDigest(resolve(options.runRoot, "initial", "candidate")) !== sourceWorkspaceDigest) throw new Error("preserved initial Workspace drift");
	const decision = decideValidationV3({ fairnessValid: true, base: base.arm, candidate: candidate.arm });
	const validationBody = { schema_version: 1 as const, validation_id: options.validationId, seed_ref: seedRef, base_arm_ref: base.ref, candidate_arm_ref: candidate.ref, decision };
	const validation: InterventionValidationV3 = { ...validationBody, validation_digest: digestObject(validationBody) };
	return { validation, validationRef: writeOnceJson(options.runRoot, "validation.json", validation) };
}

function addRefErrors(errors: string[], runRoot: string, label: string, ref: unknown): ref is ArtifactRefV0B {
	const found = validateArtifactRef(runRoot, ref);
	if (found.length !== 0) errors.push(`${label}: ${found.join("; ")}`);
	return found.length === 0;
}

function rawVerifierStatus(runRoot: string, ref: ArtifactRefV0B, expectedId: string, expectedSourceSha256: string, expectedAttempt: string, errors: string[]): VerifierResultV0B["status"] {
	if (!addRefErrors(errors, runRoot, "Verifier result", ref)) return "invalid";
	let result: VerifierResultV0B;
	try { result = readJsonArtifact<VerifierResultV0B>(runRoot, ref.path); } catch (error) { errors.push(`Verifier result parse failed: ${error instanceof Error ? error.message : String(error)}`); return "invalid"; }
	try {
		exactKeys(result, result.public_failed_checks === undefined
			? ["schema_version", "verifier_id", "verifier_sha256", "attempt_id", "started_at", "completed_at", "duration_ms", "execution", "status", "exit_code", "timed_out", "summary", "full_output_ref", "full_output_sha256", "invalid_reason"]
			: ["schema_version", "verifier_id", "verifier_sha256", "attempt_id", "started_at", "completed_at", "duration_ms", "execution", "status", "exit_code", "timed_out", "summary", "public_failed_checks", "full_output_ref", "full_output_sha256", "invalid_reason"], "Verifier result");
		exactKeys(result.execution, ["executable", "executable_identity", "argv", "cwd", "cwd_identity", "shell", "environment_allowlist_keys", "timeout_ms", "output_limit_bytes", "source_snapshot_ref", "source_sha256", "source_digest_verified"], "Verifier execution");
	} catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
	if (result.schema_version !== 1 || result.verifier_id !== expectedId || result.verifier_sha256 !== expectedSourceSha256 || result.attempt_id !== expectedAttempt || !result.execution?.source_digest_verified || result.execution.source_sha256 !== result.verifier_sha256 || result.execution.source_snapshot_ref.sha256 !== expectedSourceSha256) errors.push("Verifier result identity/authority mismatch");
	addRefErrors(errors, runRoot, "Verifier source snapshot", result.execution.source_snapshot_ref);
	if (!addRefErrors(errors, runRoot, "Verifier raw output", result.full_output_ref)) return "invalid";
	let rawStatus: VerifierResultV0B["status"] = "invalid";
	try {
		const output = readFileSync(resolve(runRoot, result.full_output_ref.path), "utf8").replace(/^\[(?:stdout|stderr)\] /gm, "");
		const last = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).at(-1);
		const wire = JSON.parse(last ?? "null") as Record<string, unknown>;
		exactKeys(wire, Object.hasOwn(wire, "failed_checks") ? ["schema_version", "verifier_id", "status", "summary", "failed_checks"] : ["schema_version", "verifier_id", "status", "summary"], "Verifier wire result");
		if (wire.schema_version === 1 && wire.verifier_id === expectedId && (wire.status === "passed" || wire.status === "failed")) rawStatus = wire.status;
	} catch { rawStatus = "invalid"; }
	const expectedExit = rawStatus === "passed" ? 0 : rawStatus === "failed" ? 1 : null;
	if (result.status !== rawStatus || result.exit_code !== expectedExit || result.invalid_reason !== null || result.full_output_sha256 !== result.full_output_ref.sha256) errors.push("Verifier result is not derived from raw output");
	return rawStatus;
}

function inspectArm(runRoot: string, seed: InterventionValidationSeedV3, ref: ArtifactRefV0B, expectedArm: "base" | "candidate", errors: string[]): ValidationArmV3 | null {
	const errorCountBefore = errors.length;
	if (!addRefErrors(errors, runRoot, `${expectedArm} arm`, ref)) return null;
	let arm: ValidationArmV3;
	try { arm = readJsonArtifact<ValidationArmV3>(runRoot, ref.path); } catch (error) { errors.push(`${expectedArm} arm parse failed: ${error instanceof Error ? error.message : String(error)}`); return null; }
	try { exactKeys(arm, ["schema_version", "arm", "treatment_state_digest", "common_identity_digest", "initial_workspace_digest", "initial_workspace_ref", "session_id", "session_ref", "session_parent", "session_entry_count_before", "execution_ref", "verifier_result_ref", "regression_result_refs", "final_workspace_digest", "metrics", "verifier_status", "regression_passed", "authority_valid"], `${expectedArm} arm`); } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
	if (arm.schema_version !== 1 || arm.arm !== expectedArm || arm.common_identity_digest !== seed.common_identity_digest || arm.treatment_state_digest !== (expectedArm === "base" ? seed.base_state_digest : seed.candidate_state_digest)) errors.push(`${expectedArm} arm treatment/fairness identity mismatch`);
	if (!addRefErrors(errors, runRoot, `${expectedArm} initial Workspace`, arm.initial_workspace_ref) || !addRefErrors(errors, runRoot, `${expectedArm} execution`, arm.execution_ref)) return arm;
	if (!addRefErrors(errors, runRoot, `${expectedArm} Session`, arm.session_ref)) errors.push(`${expectedArm} Session ref invalid`);
	else {
		try {
			const lines = readFileSync(resolve(runRoot, arm.session_ref.path), "utf8").trim().split(/\r?\n/).filter(Boolean);
			const header = JSON.parse(lines[0] ?? "null") as Record<string, unknown>;
			if (lines.length !== 1 || header.id !== arm.session_id || Object.hasOwn(header, "parentSession") || arm.session_parent !== null || arm.session_entry_count_before !== 0) errors.push(`${expectedArm} Session is not a fresh empty public JSONL Session`);
		} catch (error) { errors.push(`${expectedArm} Session inspection failed: ${error instanceof Error ? error.message : String(error)}`); }
	}
	const initialRoot = resolve(runRoot, "initial", expectedArm);
	try {
		const snapshot = readJsonArtifact<{ schema_version: number; digest: string; inventory: unknown }>(runRoot, arm.initial_workspace_ref.path);
		if (snapshot.schema_version !== 1 || snapshot.digest !== treeDigest(initialRoot) || snapshot.digest !== seed.source_workspace_digest || stableJson(snapshot.inventory) !== stableJson(treeInventory(initialRoot)) || arm.initial_workspace_digest !== snapshot.digest) errors.push(`${expectedArm} initial Workspace snapshot mismatch`);
	} catch (error) { errors.push(`${expectedArm} initial Workspace inspection failed: ${error instanceof Error ? error.message : String(error)}`); }
	let metrics: StructuralUsageVectorV3 | null = null;
	try { metrics = validateEvents(readJsonArtifact<FauxExecutionEvidenceV3>(runRoot, arm.execution_ref.path)); } catch (error) { errors.push(`${expectedArm} execution evidence invalid: ${error instanceof Error ? error.message : String(error)}`); }
	const attemptId = `${seed.validation_id}-${expectedArm}-attempt`;
	const verifierStatus = rawVerifierStatus(runRoot, arm.verifier_result_ref, seed.frozen_identity.external_verifier_id, seed.frozen_identity.external_verifier_source_sha256, attemptId, errors);
	let regressionPassed = true;
	if (arm.regression_result_refs.length !== seed.frozen_identity.regression_checks.length) errors.push(`${expectedArm} regression membership mismatch`);
	for (const [index, regressionRef] of arm.regression_result_refs.entries()) {
		if (!addRefErrors(errors, runRoot, `${expectedArm} regression`, regressionRef)) { regressionPassed = false; continue; }
		const expected = seed.frozen_identity.regression_checks[index];
		if (!expected) { regressionPassed = false; continue; }
		regressionPassed = rawVerifierStatus(runRoot, regressionRef, expected.verifier_id, expected.source_sha256, attemptId, errors) === "passed" && regressionPassed;
	}
	if (metrics && stableJson(metrics) !== stableJson(arm.metrics)) errors.push(`${expectedArm} metrics are not raw-derived`);
	if (verifierStatus !== arm.verifier_status || regressionPassed !== arm.regression_passed || arm.authority_valid !== true) errors.push(`${expectedArm} derived outcome/authority mismatch`);
	return { ...structuredClone(arm), ...(metrics ? { metrics } : {}), verifier_status: verifierStatus, regression_passed: regressionPassed, authority_valid: errors.length === errorCountBefore };
}

export function inspectValidationV3(runRoot: string): ValidationInspectionV3 {
	const errors: string[] = [];
	let validation: InterventionValidationV3 | null = null;
	let seed: InterventionValidationSeedV3 | null = null;
	let baseArm: ValidationArmV3 | null = null;
	let candidateArm: ValidationArmV3 | null = null;
	try {
		validation = readJsonArtifact<InterventionValidationV3>(runRoot, "validation.json");
		exactKeys(validation, ["schema_version", "validation_id", "seed_ref", "base_arm_ref", "candidate_arm_ref", "decision", "validation_digest"], "validation");
		exactKeys(validation.decision, ["result", "reason"], "validation decision");
		if (digestObject({ schema_version: validation.schema_version, validation_id: validation.validation_id, seed_ref: validation.seed_ref, base_arm_ref: validation.base_arm_ref, candidate_arm_ref: validation.candidate_arm_ref, decision: validation.decision }) !== validation.validation_digest) errors.push("validation digest mismatch");
		if (!addRefErrors(errors, runRoot, "validation Seed", validation.seed_ref)) throw new Error("validation Seed ref invalid");
		seed = readJsonArtifact<InterventionValidationSeedV3>(runRoot, validation.seed_ref.path);
		exactKeys(seed, ["schema_version", "validation_id", "project_id", "candidate_id", "candidate_digest", "base_state_digest", "candidate_state_digest", "source_workspace_digest", "base_state_ref", "candidate_state_ref", "frozen_identity", "common_identity_digest", "seed_digest"], "validation Seed");
		exactKeys(seed.frozen_identity, ["task_digest", "instruction_digest", "provider_model_profile_digest", "tool_profile_digest", "external_verifier_id", "external_verifier_source_sha256", "external_verifier_digest", "regression_checks", "regression_set_digest", "budget_digest", "hard_constraints_digest", "session_policy"], "frozen validation identity");
		for (const check of seed.frozen_identity.regression_checks) exactKeys(check, ["verifier_id", "source_sha256", "task_digest"], "frozen regression check");
		const { seed_digest: _digest, ...seedBody } = seed;
		if (seed.schema_version !== 1 || digestObject(seedBody) !== seed.seed_digest || seed.validation_id !== validation.validation_id) errors.push("validation Seed digest/identity mismatch");
		for (const [label, ref] of [["Base State", seed.base_state_ref], ["Candidate State", seed.candidate_state_ref]] as const) addRefErrors(errors, runRoot, label, ref);
		const baseState = readJsonArtifact<HarnessStateVersionV3>(runRoot, seed.base_state_ref.path);
		const candidateState = readJsonArtifact<StagedHarnessStateV3>(runRoot, seed.candidate_state_ref.path);
		try { validateStates(baseState, candidateState); } catch (error) { errors.push(`State treatment identity invalid: ${error instanceof Error ? error.message : String(error)}`); }
		if (baseState.state_digest !== seed.base_state_digest || candidateState.state_digest !== seed.candidate_state_digest || candidateState.candidate_id !== seed.candidate_id || candidateState.candidate_digest !== seed.candidate_digest) errors.push("Candidate/Base/Seed lineage mismatch");
		if (digestObject({ source_workspace_digest: seed.source_workspace_digest, frozen_identity: seed.frozen_identity }) !== seed.common_identity_digest || seed.frozen_identity.session_policy !== "fresh_both") errors.push("frozen fairness identity mismatch");
		baseArm = inspectArm(runRoot, seed, validation.base_arm_ref, "base", errors);
		candidateArm = inspectArm(runRoot, seed, validation.candidate_arm_ref, "candidate", errors);
		const identities = new Set<string>();
		for (const root of [resolve(runRoot, "initial", "base"), resolve(runRoot, "initial", "candidate")]) {
			for (const file of treeInventory(root)) {
				const stats = lstatSync(resolve(root, file.path));
				if (stats.nlink !== 1) errors.push("initial Workspace hardlink rejected");
				const identity = `${stats.dev}:${stats.ino}`;
				if (identities.has(identity)) errors.push("Base/Candidate initial Workspace file identity is shared");
				identities.add(identity);
			}
		}
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
	}
	const fairnessValid = !!seed && !!baseArm && !!candidateArm && baseArm.common_identity_digest === candidateArm.common_identity_digest && baseArm.initial_workspace_digest === candidateArm.initial_workspace_digest && baseArm.treatment_state_digest !== candidateArm.treatment_state_digest && baseArm.session_id !== candidateArm.session_id && baseArm.session_parent === null && candidateArm.session_parent === null && baseArm.session_entry_count_before === 0 && candidateArm.session_entry_count_before === 0 && errors.length === 0;
	const recomputedDecision = baseArm && candidateArm ? decideValidationV3({ fairnessValid, base: baseArm, candidate: candidateArm }) : null;
	if (validation && recomputedDecision && stableJson(validation.decision) !== stableJson(recomputedDecision)) errors.push("validation decision is not independently reproducible");
	return {
		schema_version: 1,
		validation_id: validation?.validation_id ?? null,
		integrity_valid: errors.length === 0,
		fairness_valid: fairnessValid,
		lineage_valid: errors.length === 0 && seed !== null && validation !== null,
		errors,
		seed,
		base_arm: baseArm,
		candidate_arm: candidateArm,
		recomputed_decision: recomputedDecision,
		validation,
	};
}
