import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, linkSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { FrozenEvidenceV3, ImprovementOpportunityV3, RefinementProposalV3 } from "../src/contracts/v3-types.ts";
import { artifactRef, writeOnceBytes } from "../src/evidence/artifacts.ts";
import { digestObject, sha256, stableJson } from "../src/hash.ts";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SHA256 } from "../src/prompts/base.ts";
import { evidenceDigestV3, projectImprovementOpportunityV3, validateFrozenEvidenceV3 } from "../src/refinement/evidence-v3.ts";
import { createBoundedModelBackedProducerV3, deterministicFixtureProposalV3, validateProposalAndBuildCandidateV3 } from "../src/refinement/producer-v3.ts";
import { loadAdaptiveSkillV3 } from "../src/skill/adapter-v3.ts";
import { loadStagedStateV3, stageCandidateStateV3 } from "../src/state/staging-v3.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const BASE_STATE_DIGEST = digestObject({ state: "accepted-base-v3" });
const V2_CLOSEOUT = "docs/reports/V2_B_CLOSEOUT.md";
const V1_CLOSEOUT = "docs/reports/V1_C_CLOSEOUT.md";

function caseRoot(label: string): string {
	const root = resolve(PROJECT_ROOT, ".runs/v3-g1/test-cases", `${label}-${randomUUID()}`);
	mkdirSync(root, { recursive: true });
	return root;
}

function freeze(body: Omit<FrozenEvidenceV3, "evidence_digest">): FrozenEvidenceV3 {
	return { ...body, evidence_digest: evidenceDigestV3(body) };
}

function acceptedRef(path: string) { return artifactRef(PROJECT_ROOT, path, "text/markdown", false); }

function hardFailureEvidence(): FrozenEvidenceV3 {
	return freeze({ schema_version: 1, evidence_id: "v2b-controlled-seed-evidence", source_run_ids: ["v2b-r2-real-20260807-02-primary-positive"], validity: { integrity_valid: true, terminal_valid: true, lineage_closed: true, attribution: "verifier" }, outcome: { status: "failed", verifier_status: "failed" }, task_context: { task_kind: "typescript-maintenance", failure_family: "verifier-failure" }, evidence_refs: [acceptedRef(V2_CLOSEOUT)] });
}

function inefficientSuccessEvidence(): FrozenEvidenceV3 {
	return freeze({ schema_version: 1, evidence_id: "v1c-comparable-success-evidence", source_run_ids: ["v1c-skill-plus-runtime-success"], validity: { integrity_valid: true, terminal_valid: true, lineage_closed: true, attribution: "none" }, outcome: { status: "passed", verifier_status: "passed" }, task_context: { task_kind: "typescript-maintenance", failure_family: null }, evidence_refs: [acceptedRef(V1_CLOSEOUT)], usage: { provider_calls: 8, tool_calls: 10 }, comparison: { peer_run_id: "v1c-skill-only-success", common_verifier: true, peer_verifier_status: "passed", vector: { provider_calls: { peer: 4, observed: 8 }, tool_calls: { peer: 6, observed: 10 } } } });
}

function structuralEvidence(): FrozenEvidenceV3 {
	const root = caseRoot("real-repeated-check"); const relativeRoot = resolve(root).slice(resolve(PROJECT_ROOT).length + 1).replaceAll("\\", "/");
	const argv = ["-e", "process.stderr.write('frozen-fail\\n');process.exit(3)"]; const argvSha = sha256(stableJson([process.execPath, ...argv]));
	const first = spawnSync(process.execPath, argv, { cwd: root, encoding: "utf8" });
	assert.equal(first.status, 3); const firstPath = `${relativeRoot}/first-check.txt`; writeOnceBytes(PROJECT_ROOT, firstPath, `${first.stdout}${first.stderr}`);
	const editPath = `${relativeRoot}/workspace-edit.txt`; writeOnceBytes(PROJECT_ROOT, editPath, "bounded intervention occurred\n");
	const second = spawnSync(process.execPath, argv, { cwd: root, encoding: "utf8" });
	assert.equal(second.status, 3); const secondPath = `${relativeRoot}/second-check.txt`; writeOnceBytes(PROJECT_ROOT, secondPath, `${second.stdout}${second.stderr}`);
	return freeze({ schema_version: 1, evidence_id: `structural-cycle-${randomUUID()}`, source_run_ids: ["real-frozen-check-cycle"], validity: { integrity_valid: true, terminal_valid: true, lineage_closed: true, attribution: "agent" }, outcome: { status: "failed", verifier_status: "failed" }, task_context: { task_kind: "typescript-maintenance", failure_family: "repeated-check-failure" }, evidence_refs: [artifactRef(PROJECT_ROOT, firstPath, "text/plain", false), artifactRef(PROJECT_ROOT, editPath, "text/plain", false), artifactRef(PROJECT_ROOT, secondPath, "text/plain", false)], trajectory: { events: [
		{ seq: 1, kind: "check_call", call_id: "check-call-1", command_id: "frozen-check-v3", argv_sha256: argvSha },
		{ seq: 2, kind: "check_result", call_id: "check-call-1", result_id: "check-result-1", command_id: "frozen-check-v3", argv_sha256: argvSha, exit_code: 3, output_ref: artifactRef(PROJECT_ROOT, firstPath, "text/plain", false) },
		{ seq: 3, kind: "edit_call", call_id: "edit-call-1" },
		{ seq: 4, kind: "edit_result", call_id: "edit-call-1", result_id: "edit-result-1", edit_ref: artifactRef(PROJECT_ROOT, editPath, "text/plain", false) },
		{ seq: 5, kind: "check_call", call_id: "check-call-2", command_id: "frozen-check-v3", argv_sha256: argvSha },
		{ seq: 6, kind: "check_result", call_id: "check-call-2", result_id: "check-result-2", command_id: "frozen-check-v3", argv_sha256: argvSha, exit_code: 3, output_ref: artifactRef(PROJECT_ROOT, secondPath, "text/plain", false) },
	] } });
}

function opportunity(evidence: FrozenEvidenceV3): ImprovementOpportunityV3 {
	const result = projectImprovementOpportunityV3(PROJECT_ROOT, evidence);
	assert.ok(result); return result;
}

function proposalFor(opportunityValue: ImprovementOpportunityV3, kind: "prompt_addendum" | "adaptive_skill" = "prompt_addendum") {
	return deterministicFixtureProposalV3({ opportunity: opportunityValue, currentBaseStateDigest: BASE_STATE_DIGEST, kind });
}

function loadState(stateRoot: string, stateDigest: string) {
	return loadStagedStateV3({ stateRoot, stateDigest, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
}

test("V3-G1 projects hard failure and inefficient success only from closed valid evidence", () => {
	const hard = opportunity(hardFailureEvidence()); const inefficient = opportunity(inefficientSuccessEvidence());
	assert.equal(hard.trigger, "hard_failure"); assert.equal(inefficient.trigger, "inefficient_success");
	assert.equal(hard.evidence_identity.evidence_digest, hardFailureEvidence().evidence_digest);
	assert.equal(inefficient.observations.provider_calls_observed, 8);
});

test("V3-G1 proves a real fail-edit-same-fail cycle with frozen command and Tool linkage", () => {
	const projected = opportunity(structuralEvidence());
	assert.equal(projected.trigger, "structural_trajectory_pathology");
	assert.deepEqual({ command_id: projected.observations.command_id, first: projected.observations.first_exit_code, second: projected.observations.second_exit_code, linked: projected.observations.intervention_linked }, { command_id: "frozen-check-v3", first: 3, second: 3, linked: true });
});

test("V3-G1 structural projection rejects identity, order, linkage, success and Artifact tampering", () => {
	for (const mutate of [
		(value: FrozenEvidenceV3) => { value.trajectory!.events[4] = { ...(value.trajectory!.events[4] as Record<string, unknown>), command_id: "different-check" } as never; },
		(value: FrozenEvidenceV3) => { (value.trajectory!.events[5] as { call_id: string }).call_id = "unlinked-call"; },
		(value: FrozenEvidenceV3) => { (value.trajectory!.events[5] as { exit_code: number }).exit_code = 0; },
		(value: FrozenEvidenceV3) => { (value.trajectory!.events[1] as { output_ref: { sha256: string } }).output_ref.sha256 = "0".repeat(64); },
	]) {
		const value = structuralEvidence(); mutate(value); const { evidence_digest: _old, ...body } = value; value.evidence_digest = evidenceDigestV3(body); assert.equal(projectImprovementOpportunityV3(PROJECT_ROOT, value), null);
	}
});

test("V3-G1 invalid, infrastructure, cancelled, missing-Verifier and unclosed-lineage evidence fail closed", () => {
	for (const mutate of [
		(value: FrozenEvidenceV3) => { value.outcome.status = "invalid"; value.outcome.verifier_status = "invalid"; },
		(value: FrozenEvidenceV3) => { value.validity.attribution = "infrastructure"; },
		(value: FrozenEvidenceV3) => { value.outcome.status = "cancelled"; },
		(value: FrozenEvidenceV3) => { value.outcome.verifier_status = "missing"; },
		(value: FrozenEvidenceV3) => { value.validity.lineage_closed = false; },
	]) {
		const value = hardFailureEvidence(); mutate(value); const { evidence_digest: _old, ...body } = value; value.evidence_digest = evidenceDigestV3(body); assert.equal(projectImprovementOpportunityV3(PROJECT_ROOT, value), null);
	}
	const digestTamper = hardFailureEvidence(); digestTamper.evidence_digest = "f".repeat(64); assert.equal(projectImprovementOpportunityV3(PROJECT_ROOT, digestTamper), null);
});

test("V3-G1 deterministic producer yields evidence-traceable typed Candidates for both State kinds", () => {
	const projected = opportunity(hardFailureEvidence());
	for (const kind of ["prompt_addendum", "adaptive_skill"] as const) {
		const candidate = validateProposalAndBuildCandidateV3({ rawProposal: proposalFor(projected, kind), opportunity: projected, currentBaseStateDigest: BASE_STATE_DIGEST, derivation: "deterministic_fixture" });
		assert.equal(candidate.edits[0]!.kind, kind); assert.equal(candidate.evidence_identity.evidence_digest, projected.evidence_identity.evidence_digest); assert.deepEqual(candidate.diagnosis.evidence_refs, projected.evidence_refs);
		assert.equal(candidate.candidate_id, `candidate-${candidate.candidate_digest.slice(0, 32)}`);
	}
});

test("V3-G1 Faux model-backed adapter has proposal-only authority and host exact-key validation", async () => {
	const projected = opportunity(inefficientSuccessEvidence()); const valid = proposalFor(projected, "adaptive_skill"); let calls = 0;
	const produce = createBoundedModelBackedProducerV3({ port: { propose: async (input) => { calls++; assert.equal(Object.isFrozen(input), true); assert.equal(Object.isFrozen(input.opportunity), true); assert.equal(Object.isFrozen(input.opportunity.evidence_refs), true); return structuredClone(valid); } } });
	const candidate = await produce(projected, BASE_STATE_DIGEST); assert.equal(calls, 1); assert.equal(candidate.diagnosis.derivation, "model_proposal"); assert.equal(candidate.edits[0]!.kind, "adaptive_skill");
	for (const raw of [
		{ ...valid, verifier: { mode: "relaxed" } },
		{ ...valid, expected_base_state_digest: "1".repeat(64) },
		{ ...valid, evidence_digest: "2".repeat(64) },
		{ ...valid, edits: [{ kind: "verifier", entry_id: "authority", content: "relax" }] },
	]) {
		const reject = createBoundedModelBackedProducerV3({ port: { propose: async () => raw } }); await assert.rejects(() => reject(projected, BASE_STATE_DIGEST), /exact-key|stale|unrelated|authority-targeting/);
	}
});

test("V3-G1 malformed output, output cap and non-JSON values fail closed", async () => {
	const projected = opportunity(hardFailureEvidence());
	await assert.rejects(() => createBoundedModelBackedProducerV3({ port: { propose: async () => ({}) } })(projected, BASE_STATE_DIGEST), /exact-key/);
	await assert.rejects(() => createBoundedModelBackedProducerV3({ outputBytesMax: 8, port: { propose: async () => proposalFor(projected) } })(projected, BASE_STATE_DIGEST), /output limit/);
	const circular: { self?: unknown } = {}; circular.self = circular;
	await assert.rejects(() => createBoundedModelBackedProducerV3({ port: { propose: async () => circular } })(projected, BASE_STATE_DIGEST), /not JSON serializable/);
});

test("V3-G1 stages and reloads a prompt addendum without changing base or active bytes", async () => {
	const root = caseRoot("prompt-stage"); const workspace = resolve(root, "agent-workspace"); const stateRoot = resolve(root, "host-state"); mkdirSync(workspace); const active = resolve(root, "active.json"); writeFileSync(active, "accepted-active-pointer\n");
	const basePath = resolve(PROJECT_ROOT, "workbench/src/prompts/base.ts"); const baseBefore = readFileSync(basePath); const activeBefore = readFileSync(active);
	const projected = opportunity(hardFailureEvidence()); const candidate = validateProposalAndBuildCandidateV3({ rawProposal: proposalFor(projected), opportunity: projected, currentBaseStateDigest: BASE_STATE_DIGEST, derivation: "deterministic_fixture" });
	const staged = await stageCandidateStateV3({ candidate, stateRoot, agentWorkspaceRoot: workspace, acceptedBaseRoots: [basePath], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(staged.state.status, "staged_inactive"); assert.equal(staged.state.entries[0]!.kind, "prompt_addendum"); assert.deepEqual(await loadState(stateRoot, staged.state.state_digest), staged.state);
	assert.deepEqual(readFileSync(basePath), baseBefore); assert.deepEqual(readFileSync(active), activeBefore); assert.equal(staged.state.entries.some((entry) => (entry as { active?: boolean }).active === true), false);
});

test("V3-G1 stages adaptive Skill through public loadSkills and explicit wrapper identity", async () => {
	const root = caseRoot("skill-stage"); const workspace = resolve(root, "agent-workspace"); const stateRoot = resolve(root, "host-state"); mkdirSync(workspace);
	const acceptedSkill = resolve(PROJECT_ROOT, "fixtures/skills/v1/reliability-completion/SKILL.md"); const acceptedBefore = readFileSync(acceptedSkill);
	const projected = opportunity(inefficientSuccessEvidence()); const candidate = validateProposalAndBuildCandidateV3({ rawProposal: proposalFor(projected, "adaptive_skill"), opportunity: projected, currentBaseStateDigest: BASE_STATE_DIGEST, derivation: "deterministic_fixture" });
	const staged = await stageCandidateStateV3({ candidate, stateRoot, agentWorkspaceRoot: workspace, acceptedBaseRoots: [resolve(PROJECT_ROOT, "workbench/src/prompts/base.ts"), acceptedSkill], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	const entry = staged.state.entries[0]!; assert.equal(entry.kind, "adaptive_skill"); if (entry.kind !== "adaptive_skill") assert.fail();
	assert.equal(entry.disable_model_invocation, true); assert.equal(entry.invocation_mode, "explicit_skill"); assert.match(entry.wrapper_sha256, /^[a-f0-9]{64}$/); assert.ok(entry.wrapper_size_bytes > entry.source_size_bytes);
	assert.deepEqual(await loadState(stateRoot, staged.state.state_digest), staged.state); assert.deepEqual(readFileSync(acceptedSkill), acceptedBefore);
});

test("V3-G1 Main repros reject prompt composed-digest and Skill invocation-flag tampering", async () => {
	const root = caseRoot("main-persisted-field-repros"); const workspace = resolve(root, "agent-workspace"); mkdirSync(workspace);
	const projected = opportunity(hardFailureEvidence());
	const promptCandidate = validateProposalAndBuildCandidateV3({ rawProposal: proposalFor(projected), opportunity: projected, currentBaseStateDigest: BASE_STATE_DIGEST, derivation: "deterministic_fixture" }); const promptRoot = resolve(root, "prompt-state"); const prompt = await stageCandidateStateV3({ candidate: promptCandidate, stateRoot: promptRoot, agentWorkspaceRoot: workspace, acceptedBaseRoots: [], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 }); const promptCopy = resolve(root, "prompt-copy"); cpSync(promptRoot, promptCopy, { recursive: true }); const promptManifestPath = resolve(promptCopy, "candidates", prompt.state.state_digest, "state.json"); const promptManifest = JSON.parse(readFileSync(promptManifestPath, "utf8")) as { entries: Array<Record<string, unknown>> }; promptManifest.entries[0]!.composed_prompt_sha256 = "f".repeat(64); writeFileSync(promptManifestPath, `${stableJson(promptManifest)}\n`); await assert.rejects(() => loadState(promptCopy, prompt.state.state_digest), /composed prompt digest mismatch/);
	const skillCandidate = validateProposalAndBuildCandidateV3({ rawProposal: proposalFor(projected, "adaptive_skill"), opportunity: projected, currentBaseStateDigest: BASE_STATE_DIGEST, derivation: "deterministic_fixture" }); const skillRoot = resolve(root, "skill-state"); const skill = await stageCandidateStateV3({ candidate: skillCandidate, stateRoot: skillRoot, agentWorkspaceRoot: workspace, acceptedBaseRoots: [], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 }); const skillCopy = resolve(root, "skill-copy"); cpSync(skillRoot, skillCopy, { recursive: true }); const skillCandidateRoot = resolve(skillCopy, "candidates", skill.state.state_digest); const skillManifestPath = resolve(skillCandidateRoot, "state.json"); const skillManifest = JSON.parse(readFileSync(skillManifestPath, "utf8")) as { entries: Array<Record<string, unknown>> }; const skillEntry = skillManifest.entries[0]!; const rebased = await loadAdaptiveSkillV3({ skillRoot: resolve(skillCandidateRoot, "skills"), expectedName: String(skillEntry.skill_name), expectedSourceSha256: String(skillEntry.source_sha256) }); skillEntry.wrapper_sha256 = rebased.wrapper_sha256; skillEntry.wrapper_size_bytes = rebased.wrapper_size_bytes; skillEntry.disable_model_invocation = false; skillEntry.invocation_mode = "implicit"; writeFileSync(skillManifestPath, `${stableJson(skillManifest)}\n`); await assert.rejects(() => loadState(skillCopy, skill.state.state_digest), /invocation authority flags mismatch/);
});

test("V3-G1 rejects the whole two-edit Candidate and writes no staged directory when one edit targets authority", async () => {
	const root = caseRoot("atomic-reject"); const workspace = resolve(root, "agent-workspace"); const stateRoot = resolve(root, "host-state"); mkdirSync(workspace); mkdirSync(stateRoot);
	const projected = opportunity(hardFailureEvidence()); const raw = proposalFor(projected) as RefinementProposalV3 & { edits: unknown[] };
	raw.edits.push({ kind: "verifier", entry_id: "invalid-authority", content: "change success criteria", applicability: raw.lesson.applicability });
	const before = readdirSync(stateRoot); assert.throws(() => validateProposalAndBuildCandidateV3({ rawProposal: raw, opportunity: projected, currentBaseStateDigest: BASE_STATE_DIGEST, derivation: "model_proposal" }), /authority-targeting/); assert.deepEqual(readdirSync(stateRoot), before);
});

test("V3-G1 State boundary, immutable write-once, tamper, hardlink and digest reload checks fail closed", async () => {
	const root = caseRoot("state-security"); const workspace = resolve(root, "agent-workspace"); const stateRoot = resolve(root, "host-state"); mkdirSync(workspace); const workspaceSentinel = resolve(workspace, "sentinel.txt"); writeFileSync(workspaceSentinel, "workspace-before\n"); const workspaceBytes = readFileSync(workspaceSentinel); const workspaceEntries = readdirSync(workspace);
	const projected = opportunity(hardFailureEvidence()); const candidate = validateProposalAndBuildCandidateV3({ rawProposal: proposalFor(projected, "adaptive_skill"), opportunity: projected, currentBaseStateDigest: BASE_STATE_DIGEST, derivation: "deterministic_fixture" });
	const rejectedWorkspaceState = resolve(workspace, "state"); await assert.rejects(() => stageCandidateStateV3({ candidate, stateRoot: rejectedWorkspaceState, agentWorkspaceRoot: workspace, acceptedBaseRoots: [], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 }), /outside the Agent tool Workspace/); assert.equal(existsSync(rejectedWorkspaceState), false); assert.deepEqual(readdirSync(workspace), workspaceEntries); assert.deepEqual(readFileSync(workspaceSentinel), workspaceBytes);
	const acceptedBase = resolve(root, "accepted-base"); mkdirSync(acceptedBase); const acceptedFile = resolve(acceptedBase, "accepted.txt"); writeFileSync(acceptedFile, "accepted-before\n"); const acceptedBytes = readFileSync(acceptedFile); const acceptedEntries = readdirSync(acceptedBase); const rejectedAcceptedState = resolve(acceptedBase, "state"); await assert.rejects(() => stageCandidateStateV3({ candidate, stateRoot: rejectedAcceptedState, agentWorkspaceRoot: workspace, acceptedBaseRoots: [acceptedBase], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 }), /overlaps accepted base authority/); assert.equal(existsSync(rejectedAcceptedState), false); assert.deepEqual(readdirSync(acceptedBase), acceptedEntries); assert.deepEqual(readFileSync(acceptedFile), acceptedBytes);
	const staged = await stageCandidateStateV3({ candidate, stateRoot, agentWorkspaceRoot: workspace, acceptedBaseRoots: [resolve(PROJECT_ROOT, "workbench/src/prompts/base.ts")], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	await assert.rejects(() => stageCandidateStateV3({ candidate, stateRoot, agentWorkspaceRoot: workspace, acceptedBaseRoots: [], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 }), /already exists/);
	const cloneRoot = resolve(root, "tampered-state"); cpSync(stateRoot, cloneRoot, { recursive: true }); const cloneCandidate = resolve(cloneRoot, "candidates", staged.state.state_digest); const manifest = resolve(cloneCandidate, "state.json"); writeFileSync(manifest, readFileSync(manifest, "utf8").replace("staged_inactive", "staged-active")); await assert.rejects(() => loadState(cloneRoot, staged.state.state_digest), /invalid staged State/);
	const extraKeyRoot = resolve(root, "extra-key-state"); cpSync(stateRoot, extraKeyRoot, { recursive: true }); const extraKeyManifest = resolve(extraKeyRoot, "candidates", staged.state.state_digest, "state.json"); const extraKeyState = JSON.parse(readFileSync(extraKeyManifest, "utf8")) as Record<string, unknown>; extraKeyState.active_pointer = true; writeFileSync(extraKeyManifest, JSON.stringify(extraKeyState)); await assert.rejects(() => loadState(extraKeyRoot, staged.state.state_digest), /exact-key/);
	const promptCandidate = validateProposalAndBuildCandidateV3({ rawProposal: proposalFor(projected), opportunity: projected, currentBaseStateDigest: BASE_STATE_DIGEST, derivation: "deterministic_fixture" }); const promptStateRoot = resolve(root, "prompt-extra-state"); const promptStaged = await stageCandidateStateV3({ candidate: promptCandidate, stateRoot: promptStateRoot, agentWorkspaceRoot: workspace, acceptedBaseRoots: [], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 }); writeFileSync(resolve(promptStateRoot, "candidates", promptStaged.state.state_digest, "unexpected.txt"), "not part of the immutable State\n"); await assert.rejects(() => loadState(promptStateRoot, promptStaged.state.state_digest), /file inventory/);
	const skillDir = resolve(stateRoot, "candidates", staged.state.state_digest, "skills", (staged.state.entries[0] as { skill_name: string }).skill_name); linkSync(resolve(skillDir, "SKILL.md"), resolve(skillDir, "copy.md")); await assert.rejects(() => loadState(stateRoot, staged.state.state_digest), /hardlink/);
});

test("V3-G1 evidence and Candidate objects reject unknown keys and preserve canonical digests", () => {
	const evidence = hardFailureEvidence(); assert.deepEqual(validateFrozenEvidenceV3(PROJECT_ROOT, evidence), evidence);
	assert.throws(() => validateFrozenEvidenceV3(PROJECT_ROOT, { ...evidence, hidden_authority: true }), /unknown key/);
	const projected = opportunity(evidence); const proposal = proposalFor(projected); const candidate = validateProposalAndBuildCandidateV3({ rawProposal: proposal, opportunity: projected, currentBaseStateDigest: BASE_STATE_DIGEST, derivation: "deterministic_fixture" });
	const { candidate_id: _id, candidate_digest: _digest, ...body } = candidate; assert.equal(digestObject(body), candidate.candidate_digest);
});
