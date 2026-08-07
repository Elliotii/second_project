import assert from "node:assert/strict";
import { cpSync, linkSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { ArtifactRefV0B, TaskSpecV0B } from "../src/contracts/v0b-types.ts";
import type { ActiveStateIdentityV3, FauxExecutionEventV3, HarnessStateVersionV3, InterventionValidationV3, ValidationArmV3 } from "../src/contracts/v3g2-types.ts";
import type { FrozenEvidenceV3, ImprovementOpportunityV3, RefinementCandidateV3 } from "../src/contracts/v3-types.ts";
import { artifactRef, writeOnceBytes } from "../src/evidence/artifacts.ts";
import { digestObject, fileSha256, sha256, stableJson, treeDigest } from "../src/hash.ts";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SHA256 } from "../src/prompts/base.ts";
import { decideValidationV3, executeSymmetricValidationV3, inspectValidationV3, type FauxValidationPortV3, type LocalCheckV3 } from "../src/refinement/comparator-v3.ts";
import { evidenceDigestV3, projectImprovementOpportunityV3 } from "../src/refinement/evidence-v3.ts";
import { deterministicFixtureProposalV3, validateProposalAndBuildCandidateV3 } from "../src/refinement/producer-v3.ts";
import { applyValidationDecisionV3, initializeStateStoreV3, inspectGoal2LineageV3, inspectStateStoreV3, rollbackActiveStateV3 } from "../src/state/store-v3.ts";
import { stageCandidateStateV3 } from "../src/state/staging-v3.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const CASES_ROOT = resolve(PROJECT_ROOT, ".runs/v3-g2/test-cases");
const BASE_PATH = resolve(PROJECT_ROOT, "workbench/src/prompts/base.ts");

function caseRoot(label: string): string {
	const root = resolve(CASES_ROOT, `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	mkdirSync(root, { recursive: true });
	return root;
}

function activeIdentity(value: { binding_revision: number; state_version: number; state_digest: string }): ActiveStateIdentityV3 {
	return { binding_revision: value.binding_revision, state_version: value.state_version, state_digest: value.state_digest };
}

function makeWorkspace(root: string, subject: "broken" | "fixed"): string {
	const workspace = resolve(root, "workspace-source"); mkdirSync(workspace);
	writeFileSync(resolve(workspace, "subject.txt"), `${subject}\n`);
	writeFileSync(resolve(workspace, "protected.txt"), "protected-stable\n");
	return workspace;
}

function checkSource(root: string, verifierId: string, mode: "subject" | "protected"): string {
	const path = resolve(root, `${verifierId}.mjs`);
	const predicate = mode === "subject"
		? 'readFileSync(resolve(workspace, "subject.txt"), "utf8") === "fixed\\n"'
		: 'readFileSync(resolve(workspace, "protected.txt"), "utf8") === "protected-stable\\n"';
	writeFileSync(path, `import { readFileSync } from "node:fs";\nimport { resolve } from "node:path";\nconst workspace = process.env.V0B_WORKSPACE;\nconst passed = typeof workspace === "string" && ${predicate};\nconsole.log(JSON.stringify({ schema_version: 1, verifier_id: ${JSON.stringify(verifierId)}, status: passed ? "passed" : "failed", summary: passed ? "passed" : "failed", ...(passed ? {} : { failed_checks: [${JSON.stringify(mode)}] }) }));\nprocess.exit(passed ? 0 : 1);\n`);
	return path;
}

function task(workspace: string, verifierId: string, sourcePath: string): TaskSpecV0B {
	return {
		schema_version: 1,
		task_id: "v3g2-deterministic-task",
		instruction_ref: "ignored-v3g2-instruction",
		instruction_sha256: sha256("repair the bounded subject"),
		workspace_source_ref: workspace,
		workspace_source_digest: treeDigest(workspace),
		writable_paths: ["subject.txt"],
		protected_paths: ["protected.txt"],
		verifier_id: verifierId,
		verifier_ref: sourcePath,
		verifier_sha256: fileSha256(sourcePath),
		acceptance_visibility: "hidden_external",
		tool_profile_id: "v3g2_faux_local",
		command_descriptors: [],
		verifier_command: { executable: "current_node_executable", argv: [sourcePath], cwd: "project", timeout_ms: 5_000, output_limit_bytes: 8_192 },
	};
}

function checks(root: string, workspace: string): { verifier: LocalCheckV3; regressions: LocalCheckV3[] } {
	const verifierPath = checkSource(root, "v3g2-external-verifier", "subject");
	const regressionPath = checkSource(root, "v3g2-frozen-regression", "protected");
	return {
		verifier: { task: task(workspace, "v3g2-external-verifier", verifierPath), sourcePath: verifierPath },
		regressions: [{ task: task(workspace, "v3g2-frozen-regression", regressionPath), sourcePath: regressionPath }],
	};
}

function hardFailureOpportunity(root: string): ImprovementOpportunityV3 {
	const evidencePath = "evidence/frozen-failure.txt";
	writeOnceBytes(root, evidencePath, "frozen external verifier failure\n");
	const withoutDigest: Omit<FrozenEvidenceV3, "evidence_digest"> = {
		schema_version: 1,
		evidence_id: `v3g2-evidence-${Math.random().toString(16).slice(2)}`,
		source_run_ids: ["v3g2-frozen-source-run"],
		validity: { integrity_valid: true, terminal_valid: true, lineage_closed: true, attribution: "agent" },
		outcome: { status: "failed", verifier_status: "failed" },
		task_context: { task_kind: "typescript-maintenance", failure_family: "bounded-failure" },
		evidence_refs: [artifactRef(root, evidencePath, "text/plain", false)],
	};
	const evidence: FrozenEvidenceV3 = { ...withoutDigest, evidence_digest: evidenceDigestV3(withoutDigest) };
	const opportunity = projectImprovementOpportunityV3(root, evidence);
	assert.ok(opportunity); return opportunity;
}

async function acceptedBase(root: string, projectId: string) {
	const agentWorkspace = resolve(root, "agent-workspace"); mkdirSync(agentWorkspace);
	const initialized = await initializeStateStoreV3({ stateRoot: resolve(root, "state-store"), projectId, agentWorkspaceRoot: agentWorkspace, acceptedBaseRoots: [BASE_PATH], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	return { ...initialized, stateRoot: resolve(root, "state-store"), agentWorkspace };
}

async function stagedCandidate(options: { root: string; agentWorkspace: string; baseDigest: string; kind: "prompt_addendum" | "adaptive_skill" }): Promise<{ candidate: RefinementCandidateV3; stagedRoot: string; stateDigest: string }> {
	const opportunity = hardFailureOpportunity(options.root);
	const proposal = deterministicFixtureProposalV3({ opportunity, currentBaseStateDigest: options.baseDigest, kind: options.kind });
	const candidate = validateProposalAndBuildCandidateV3({ rawProposal: proposal, opportunity, currentBaseStateDigest: options.baseDigest, derivation: "deterministic_fixture" });
	const stagedRoot = resolve(options.root, `staged-${options.kind}`);
	const staged = await stageCandidateStateV3({ candidate, stateRoot: stagedRoot, agentWorkspaceRoot: options.agentWorkspace, acceptedBaseRoots: [BASE_PATH], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	return { candidate, stagedRoot, stateDigest: staged.state.state_digest };
}

function events(arm: "base" | "candidate", counts: { provider: number; tool: number; pathology: number }): FauxExecutionEventV3[] {
	const result: FauxExecutionEventV3[] = [];
	for (let index = 0; index < counts.provider; index++) result.push({ seq: result.length + 1, type: "provider_call", call_id: `${arm}-provider-${index + 1}` });
	for (let index = 0; index < counts.tool; index++) result.push({ seq: result.length + 1, type: "tool_call", call_id: `${arm}-tool-${index + 1}` });
	for (let index = 0; index < counts.pathology; index++) result.push({ seq: result.length + 1, type: "structural_pathology", check_id: `${arm}-pathology-${index + 1}` });
	return result;
}

function goodPort(): FauxValidationPortV3 {
	return { execute: async ({ state, workspaceRoot }) => {
		const treatment = state.status === "accepted" ? "base" : "candidate";
		if (state.status === "staged_inactive") writeFileSync(resolve(workspaceRoot, "subject.txt"), "fixed\n");
		return { settled: true, events: events(treatment, state.status === "accepted" ? { provider: 3, tool: 3, pathology: 1 } : { provider: 2, tool: 2, pathology: 0 }) };
	} };
}

function noImprovementPort(): FauxValidationPortV3 {
	return { execute: async ({ state }) => ({ settled: true, events: events(state.status === "accepted" ? "base" : "candidate", { provider: 2, tool: 2, pathology: 0 }) }) };
}

async function baseVersion(stateRoot: string, projectId: string): Promise<HarnessStateVersionV3> {
	const inspected = await inspectStateStoreV3({ stateRoot, expectedProjectId: projectId, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; ")); assert.ok(inspected.active);
	const version = inspected.versions.find((entry) => entry.state_digest === inspected.active!.state_digest);
	assert.ok(version); return version;
}

async function validate(options: { root: string; label: string; projectId: string; workspace: string; base: HarnessStateVersionV3; stagedRoot: string; stateDigest: string; port: FauxValidationPortV3 }) {
	const candidateState = JSON.parse(readFileSync(resolve(options.stagedRoot, "candidates", options.stateDigest, "state.json"), "utf8"));
	const localChecks = checks(options.root, options.workspace);
	return await executeSymmetricValidationV3({
		projectRoot: PROJECT_ROOT,
		runRoot: resolve(options.root, `validation-${options.label}`),
		validationId: `v3g2-${options.label}`,
		projectId: options.projectId,
		sourceWorkspaceRoot: options.workspace,
		task: localChecks.verifier.task,
		verifier: localChecks.verifier,
		regressions: localChecks.regressions,
		baseState: options.base,
		candidateState,
		providerModelProfileDigest: sha256("public-emitted-faux"),
		toolProfileDigest: sha256("v3g2-faux-local"),
		budgetDigest: sha256("provider-4-tool-4-verifier-2"),
		hardConstraintsDigest: sha256("authority-plane-frozen"),
		port: options.port,
	});
}

function rewriteArtifactRef(runRoot: string, relativePath: string): ArtifactRefV0B {
	return artifactRef(runRoot, relativePath, "application/json", false);
}

test("V3-G2 deterministic decision table covers all correctness, regression and both-pass branches", () => {
	const arm = (status: "passed" | "failed" | "invalid", metrics = { structural_pathology_count: 1, tool_calls: 2, provider_calls: 2 }, regressionPassed = true) => ({ verifier_status: status, regression_passed: regressionPassed, authority_valid: true, metrics });
	assert.deepEqual(decideValidationV3({ fairnessValid: true, base: arm("failed"), candidate: arm("passed") }), { result: "promote", reason: "base_failed_candidate_passed" });
	assert.deepEqual(decideValidationV3({ fairnessValid: true, base: arm("passed"), candidate: arm("failed") }), { result: "reject", reason: "candidate_failed" });
	assert.deepEqual(decideValidationV3({ fairnessValid: true, base: arm("failed"), candidate: arm("failed") }), { result: "reject", reason: "both_failed" });
	assert.deepEqual(decideValidationV3({ fairnessValid: true, base: arm("passed"), candidate: arm("passed", { structural_pathology_count: 0, tool_calls: 2, provider_calls: 2 }) }), { result: "promote", reason: "both_passed_material_improvement" });
	assert.deepEqual(decideValidationV3({ fairnessValid: true, base: arm("passed"), candidate: arm("passed") }), { result: "reject", reason: "no_material_improvement" });
	assert.deepEqual(decideValidationV3({ fairnessValid: true, base: arm("failed"), candidate: arm("passed", undefined, false) }), { result: "reject", reason: "candidate_regression_failed" });
	assert.deepEqual(decideValidationV3({ fairnessValid: false, base: arm("failed"), candidate: arm("passed") }), { result: "reject", reason: "authority_or_fairness_invalid" });
});

test("V3-G2 good Candidate promotes, reopens, and rolls back by pointer while retaining history", async () => {
	const root = caseRoot("promote-rollback"); const projectId = "v3g2-project-promote"; const store = await acceptedBase(root, projectId); const initialDigest = store.version.state_digest;
	const workspace = makeWorkspace(root, "broken"); const candidate = await stagedCandidate({ root, agentWorkspace: store.agentWorkspace, baseDigest: initialDigest, kind: "prompt_addendum" });
	const validation = await validate({ root, label: "good", projectId, workspace, base: store.version, stagedRoot: candidate.stagedRoot, stateDigest: candidate.stateDigest, port: goodPort() });
	const inspectedValidation = inspectValidationV3(resolve(root, "validation-good")); assert.equal(inspectedValidation.integrity_valid, true, inspectedValidation.errors.join("; ")); assert.deepEqual(inspectedValidation.recomputed_decision, { result: "promote", reason: "base_failed_candidate_passed" });
	const applied = await applyValidationDecisionV3({ stateRoot: store.stateRoot, projectId, runRoot: resolve(root, "validation-good"), validationRef: validation.validationRef, stagedStateRoot: candidate.stagedRoot, candidateStateDigest: candidate.stateDigest, expectedActive: activeIdentity(store.active), immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(applied.decision.result, "promoted"); assert.ok(applied.version); assert.equal(applied.active.binding_revision, 1); assert.equal(applied.active.state_digest, applied.version.state_digest);
	const reopened = await inspectStateStoreV3({ stateRoot: store.stateRoot, expectedProjectId: projectId, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 }); assert.equal(reopened.integrity_valid, true, reopened.errors.join("; ")); assert.equal(reopened.versions.length, 2);
	const rollback = await rollbackActiveStateV3({ stateRoot: store.stateRoot, projectId, targetStateDigest: initialDigest, expectedActive: activeIdentity(applied.active), immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(rollback.active.binding_revision, 2); assert.equal(rollback.active.state_digest, initialDigest); assert.equal(rollback.decision.result, "rolled_back");
	const after = await inspectGoal2LineageV3({ stateRoot: store.stateRoot, projectId, validationRunRoots: { "v3g2-good": resolve(root, "validation-good") }, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(after.integrity_valid, true, after.errors.join("; ")); assert.equal(after.versions.length, 2); assert.equal(after.decisions.length, 3); assert.ok(after.decisions.some((entry) => entry.kind === "promotion")); assert.ok(after.decisions.some((entry) => entry.kind === "rollback"));
});

test("V3-G2 both-pass no-improvement adaptive Skill rejects and leaves active pointer bytes unchanged", async () => {
	const root = caseRoot("reject-no-improvement"); const projectId = "v3g2-project-reject"; const store = await acceptedBase(root, projectId);
	const workspace = makeWorkspace(root, "fixed"); const candidate = await stagedCandidate({ root, agentWorkspace: store.agentWorkspace, baseDigest: store.version.state_digest, kind: "adaptive_skill" });
	const validation = await validate({ root, label: "no-improvement", projectId, workspace, base: store.version, stagedRoot: candidate.stagedRoot, stateDigest: candidate.stateDigest, port: noImprovementPort() });
	const activePath = resolve(store.stateRoot, "active.json"); const before = readFileSync(activePath);
	const applied = await applyValidationDecisionV3({ stateRoot: store.stateRoot, projectId, runRoot: resolve(root, "validation-no-improvement"), validationRef: validation.validationRef, stagedStateRoot: candidate.stagedRoot, candidateStateDigest: candidate.stateDigest, expectedActive: activeIdentity(store.active), immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(applied.decision.result, "rejected"); assert.equal(applied.decision.reason, "no_material_improvement"); assert.equal(applied.version, null); assert.deepEqual(readFileSync(activePath), before);
	const lineage = await inspectGoal2LineageV3({ stateRoot: store.stateRoot, projectId, validationRunRoots: { "v3g2-no-improvement": resolve(root, "validation-no-improvement") }, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(lineage.integrity_valid, true, lineage.errors.join("; ")); assert.equal(lineage.versions.length, 1); assert.equal(lineage.decisions.at(-1)!.kind, "rejection");
});

test("V3-G2 compare-and-swap stale promotion records rejection without pointer mutation", async () => {
	const root = caseRoot("stale"); const projectId = "v3g2-project-stale"; const store = await acceptedBase(root, projectId);
	const workspace = makeWorkspace(root, "broken"); const candidate = await stagedCandidate({ root, agentWorkspace: store.agentWorkspace, baseDigest: store.version.state_digest, kind: "prompt_addendum" });
	const validation = await validate({ root, label: "stale", projectId, workspace, base: store.version, stagedRoot: candidate.stagedRoot, stateDigest: candidate.stateDigest, port: goodPort() });
	const activePath = resolve(store.stateRoot, "active.json"); const before = readFileSync(activePath);
	const staleExpected = { ...activeIdentity(store.active), binding_revision: store.active.binding_revision + 1 };
	const applied = await applyValidationDecisionV3({ stateRoot: store.stateRoot, projectId, runRoot: resolve(root, "validation-stale"), validationRef: validation.validationRef, stagedStateRoot: candidate.stagedRoot, candidateStateDigest: candidate.stateDigest, expectedActive: staleExpected, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(applied.decision.result, "rejected"); assert.equal(applied.decision.reason, "stale_base"); assert.deepEqual(readFileSync(activePath), before);
});

test("V3-G2 store reload fails closed for corrupt, missing, hardlink, path and inventory variants", async () => {
	const root = caseRoot("store-tamper"); const projectId = "v3g2-project-tamper"; const store = await acceptedBase(root, projectId);
	const variants: Array<{ label: string; mutate(path: string): void; pattern: RegExp }> = [
		{ label: "corrupt", mutate: (path) => { const active = JSON.parse(readFileSync(resolve(path, "active.json"), "utf8")); active.pointer_digest = "0".repeat(64); writeFileSync(resolve(path, "active.json"), `${stableJson(active)}\n`); }, pattern: /pointer identity/ },
		{ label: "missing", mutate: (path) => rmSync(resolve(path, `versions/${store.version.state_digest}/state.json`)), pattern: /missing|State version/ },
		{ label: "hardlink", mutate: (path) => linkSync(resolve(path, "active.json"), resolve(path, "active-copy.json")), pattern: /hardlink/ },
		{ label: "path", mutate: (path) => { mkdirSync(resolve(path, "versions/not-a-digest")); writeFileSync(resolve(path, "versions/not-a-digest/state.json"), "{}\n"); }, pattern: /version directory/ },
		{ label: "inventory", mutate: (path) => writeFileSync(resolve(path, "unexpected.json"), "{}\n"), pattern: /inventory/ },
	];
	for (const variant of variants) {
		const copy = resolve(root, variant.label); cpSync(store.stateRoot, copy, { recursive: true }); variant.mutate(copy);
		const inspected = await inspectStateStoreV3({ stateRoot: copy, expectedProjectId: projectId, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
		assert.equal(inspected.integrity_valid, false, variant.label); assert.match(inspected.errors.join("; "), variant.pattern, variant.label);
	}
});

test("V3-G2 independent Inspector rejects coherently rehashed fairness, raw Verifier and lineage tampering", async () => {
	const root = caseRoot("inspector-tamper"); const projectId = "v3g2-project-inspector"; const store = await acceptedBase(root, projectId);
	const workspace = makeWorkspace(root, "broken"); const candidate = await stagedCandidate({ root, agentWorkspace: store.agentWorkspace, baseDigest: store.version.state_digest, kind: "prompt_addendum" });
	await validate({ root, label: "tamper-source", projectId, workspace, base: store.version, stagedRoot: candidate.stagedRoot, stateDigest: candidate.stateDigest, port: goodPort() });
	const source = resolve(root, "validation-tamper-source");
	const fairness = resolve(root, "fairness-copy"); cpSync(source, fairness, { recursive: true });
	const armPath = resolve(fairness, "arms/candidate/arm.json"); const arm = JSON.parse(readFileSync(armPath, "utf8")) as ValidationArmV3; arm.common_identity_digest = "0".repeat(64); writeFileSync(armPath, `${stableJson(arm)}\n`);
	const validationPath = resolve(fairness, "validation.json"); const validation = JSON.parse(readFileSync(validationPath, "utf8")) as InterventionValidationV3; validation.candidate_arm_ref = rewriteArtifactRef(fairness, "arms/candidate/arm.json"); const { validation_digest: _old, ...body } = validation; validation.validation_digest = digestObject(body); writeFileSync(validationPath, `${stableJson(validation)}\n`);
	const fairnessRejected = inspectValidationV3(fairness); assert.equal(fairnessRejected.integrity_valid, false); assert.match(fairnessRejected.errors.join("; "), /treatment\/fairness|fairness/i);
	const raw = resolve(root, "raw-copy"); cpSync(source, raw, { recursive: true }); writeFileSync(resolve(raw, "arms/candidate/verifier-output.txt"), "tampered raw output\n"); const rawRejected = inspectValidationV3(raw); assert.equal(rawRejected.integrity_valid, false); assert.match(rawRejected.errors.join("; "), /raw output|digest mismatch/i);
	const lineage = resolve(root, "lineage-copy"); cpSync(store.stateRoot, lineage, { recursive: true }); const initialPath = resolve(lineage, `versions/${store.version.state_digest}/state.json`); const initial = JSON.parse(readFileSync(initialPath, "utf8")); initial.source_candidate_id = "forged-candidate"; writeFileSync(initialPath, `${stableJson(initial)}\n`); const lineageRejected = await inspectStateStoreV3({ stateRoot: lineage, expectedProjectId: projectId, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 }); assert.equal(lineageRejected.integrity_valid, false); assert.match(lineageRejected.errors.join("; "), /version identity|initial State/i);
});
