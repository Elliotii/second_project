import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { CandidateAdmissionV3 } from "../src/contracts/v3g3-types.ts";
import type { RefinementCandidateV3, StagedHarnessStateV3 } from "../src/contracts/v3-types.ts";
import { digestObject, fileSha256, stableJson } from "../src/hash.ts";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SHA256 } from "../src/prompts/base.ts";
import { admitCandidateV3, inspectCandidateAdmissionV3 } from "../src/refinement/admission-v3.ts";
import { stageCandidateStateV3 } from "../src/state/staging-v3.ts";
import { initializeStateStoreV3 } from "../src/state/store-v3.ts";

const PROJECT_ROOT = resolve(import.meta.dirname, "../..");
const FIXTURE_ROOT = resolve(PROJECT_ROOT, "fixtures/v3");
const SOURCE_CANDIDATE_SHA256 = "8b161311386364234fa19a0d648f2dedd801dcb3eaa87e3f8be9d2ff9aacbb44";
const SOURCE_STATE_SHA256 = "25c2c0e3f43f2e9984e70e184a4d59206f4f96dc23685a94fb4a1402c467a676";

function readFixtures(): { candidate: RefinementCandidateV3; state: StagedHarnessStateV3 } {
	const candidatePath = resolve(FIXTURE_ROOT, "goal1-real-candidate.json");
	const statePath = resolve(FIXTURE_ROOT, "goal1-real-staged-state.json");
	assert.equal(fileSha256(candidatePath), SOURCE_CANDIDATE_SHA256);
	assert.equal(fileSha256(statePath), SOURCE_STATE_SHA256);
	return { candidate: JSON.parse(readFileSync(candidatePath, "utf8")), state: JSON.parse(readFileSync(statePath, "utf8")) };
}

function rehashAdmission(value: CandidateAdmissionV3): void {
	const { admission_digest: _old, ...body } = value;
	value.admission_digest = digestObject(body);
}

test("V3-G3 explicit admission preserves immutable Goal 1 semantics and fails closed for forged, stale, cross-project, or mismatched lineage", async () => {
	const root = resolve(PROJECT_ROOT, ".runs/v3-g3/admission-checkpoint", randomUUID());
	const workspace = resolve(root, "agent-workspace");
	mkdirSync(workspace, { recursive: true });
	const projectId = "v3-g3-admission-project";
	const store = await initializeStateStoreV3({ stateRoot: resolve(root, "state-store"), projectId, agentWorkspaceRoot: workspace, acceptedBaseRoots: [resolve(PROJECT_ROOT, "workbench/src/prompts/base.ts")], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	const source = readFixtures();
	const targetActive = { binding_revision: store.active.binding_revision, state_version: store.active.state_version, state_digest: store.active.state_digest };
	const admitted = admitCandidateV3({ admissionRoot: resolve(root, "admissions"), projectId, sourceCandidate: source.candidate, sourceState: source.state, targetActive });
	assert.notEqual(admitted.admittedCandidate.candidate_digest, source.candidate.candidate_digest);
	assert.equal(admitted.admittedCandidate.expected_base_state_digest, store.active.state_digest);
	assert.equal(admitted.admission.original_candidate_digest, source.candidate.candidate_digest);
	assert.equal(admitted.admission.original_staged_state_digest, source.state.state_digest);
	const staged = await stageCandidateStateV3({ candidate: admitted.admittedCandidate, stateRoot: resolve(root, "admitted-staging"), agentWorkspaceRoot: workspace, acceptedBaseRoots: [FIXTURE_ROOT], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(staged.state.state_digest, admitted.admission.admitted_staged_state_digest);
	const inspected = inspectCandidateAdmissionV3({ admissionPath: admitted.path, expectedProjectId: projectId, sourceCandidate: source.candidate, sourceState: source.state, expectedCurrentActive: targetActive });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));

	const forgedPath = resolve(root, "forged.json");
	const forged = structuredClone(admitted.admission); forged.semantic_payload_digest = "0".repeat(64); rehashAdmission(forged); writeFileSync(forgedPath, `${stableJson(forged)}\n`);
	assert.equal(inspectCandidateAdmissionV3({ admissionPath: forgedPath, expectedProjectId: projectId, sourceCandidate: source.candidate, sourceState: source.state, expectedCurrentActive: targetActive }).integrity_valid, false);
	assert.equal(inspectCandidateAdmissionV3({ admissionPath: admitted.path, expectedProjectId: "cross-project", sourceCandidate: source.candidate, sourceState: source.state, expectedCurrentActive: targetActive }).integrity_valid, false);
	assert.equal(inspectCandidateAdmissionV3({ admissionPath: admitted.path, expectedProjectId: projectId, sourceCandidate: source.candidate, sourceState: source.state, expectedCurrentActive: { ...targetActive, binding_revision: targetActive.binding_revision + 1 } }).integrity_valid, false);
	const changed = structuredClone(source.candidate); changed.lesson.statement += " changed";
	assert.equal(inspectCandidateAdmissionV3({ admissionPath: admitted.path, expectedProjectId: projectId, sourceCandidate: changed, sourceState: source.state, expectedCurrentActive: targetActive }).integrity_valid, false);
	const mismatchedState = structuredClone(source.state); mismatchedState.candidate_digest = "0".repeat(64);
	assert.equal(inspectCandidateAdmissionV3({ admissionPath: admitted.path, expectedProjectId: projectId, sourceCandidate: source.candidate, sourceState: mismatchedState, expectedCurrentActive: targetActive }).integrity_valid, false);

	const immutableCopy = resolve(root, "source-copy"); cpSync(FIXTURE_ROOT, immutableCopy, { recursive: true });
	assert.equal(fileSha256(resolve(immutableCopy, "goal1-real-candidate.json")), SOURCE_CANDIDATE_SHA256);
	assert.equal(fileSha256(resolve(immutableCopy, "goal1-real-staged-state.json")), SOURCE_STATE_SHA256);
});
