import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { formatSkillInvocation, JsonlSessionRepo, type AgentMessage } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { fauxAssistantMessage } from "@earendil-works/pi-ai";
import type { DirectPiRuntimeEvidenceV3 } from "../src/contracts/v3g3-types.ts";
import { writeOnceJson } from "../src/evidence/artifacts.ts";
import { digestObject, sha256 } from "../src/hash.ts";
import { createGoal3FauxExecutionPortV3, type BoundExecutionOptionsV3, type Goal3ExecutionPortV3, type Goal3RealAccessCountersV3 } from "../src/pi/pi-adapter-v3.ts";
import { GOAL3_BUDGET_PROFILE_DIGEST_V3, GOAL3_BUDGET_PROFILE_V3, GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3, GOAL3_FAUX_PROVIDER_PROFILE_V3, GOAL3_TOOL_PROFILE_ID_V3, goal3ToolProfileDigestV3 } from "../src/pi/runtime-profile-v3.ts";
import { createBoundedToolProfile } from "../src/pi/tool-profile.ts";
import { readGoal2SkillComparisonV35 } from "../src/read-model/read-model-v35.ts";
import { executeGoal3RunV3 } from "../src/run-v3.ts";
import { freezeGoal3CaseAuthorityV3 } from "../src/state/case-authority-v3.ts";
import { createTemporaryWorkspace } from "../src/workspace/temp-copy.ts";
import { assertFrozenGoal2CaseBytesV35, GOAL2_CANDIDATE_RUN_ID_V35, GOAL2_CASE_AUTHORITY_DIGEST_V35, GOAL2_CASE_ID_V35, GOAL2_PROJECT_ID_V35, GOAL2_SELECTED_STATE_DIGEST_V35, GOAL2_SKILL_SOURCE_SHA256_V35, GOAL2_SKILL_WRAPPER_SHA256_V35, GOAL2_TASK_ID_V35, GOAL2_TASK_KIND_V35, GOAL2_TASK_POLICY_V35, GOAL2_TOOL_PROFILE_DIGEST_V35, GOAL2_TOOL_RESTRICTIONS_V35, GOAL2_WORKSPACE_DIGEST_V35, goal2FailureLineageV35, goal2FixturePathsV35, goal2VerifierTaskV35, materializeGoal2CaseAuthorityV35, requireFrozenInstructionV35 } from "../src/v35g2/case-v35g2.ts";
import { runGoal2ReferenceCalibrationV35 } from "../src/v35g2/calibration-v35g2.ts";
import { inspectGoal2PairV35 } from "../src/v35g2/inspect-v35g2.ts";
import { executeGoal2PairV35, prepareGoal2PairV35 } from "../src/v35g2/pair-v35g2.ts";
import { createGoal2FirstProviderPayloadCaptureV35 } from "../src/v35g2/payload-fairness-v35g2.ts";
import { freezeGoal2RunBindingV35, inspectGoal2StateSelectionV35, materializeGoal2StateSelectionV35 } from "../src/v35g2/state-selection-v35g2.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const HISTORICAL_STATE = "D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/project-state";
const TEST_ROOT = resolve(PROJECT_ROOT, ".runs/v3-5-g2/tests");
function root(label: string): string { const value = resolve(TEST_ROOT, `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`); mkdirSync(value, { recursive: true }); return value; }

function fakeDeepSeekPort(counters: Goal3RealAccessCountersV3, requests = 1, requestDrift: Record<string, unknown> = {}): Goal3ExecutionPortV3 {
	return { profile: GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3, async execute(options: BoundExecutionOptionsV3): Promise<DirectPiRuntimeEvidenceV3> {
		if (!options.executionSession) throw new Error("test port requires persistent Session");
		counters.credential_reads++; counters.network_calls += requests; counters.external_provider_calls += requests; counters.real_model_calls += requests;
		const wrapper = options.frozen.adaptiveSkill ? formatSkillInvocation(options.frozen.adaptiveSkill) : null; const userText = wrapper ? `${wrapper}\n\n${options.taskPrompt}` : options.taskPrompt;
		options.beforeProviderPayload?.({ model: GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.model_id, messages: [{ role: "system", content: options.frozen.composedPrompt }, { role: "user", content: userText }], tools: [{ type: "function", function: { name: "workspace_read" } }], stream: true, stream_options: { include_usage: true }, ...requestDrift });
		await options.executionSession.appendMessage({ role: "user", content: userText, timestamp: 1 } as AgentMessage); await options.executionSession.appendMessage(fauxAssistantMessage("deterministic Goal 2 test arm", { timestamp: 2 }));
		const body: Omit<DirectPiRuntimeEvidenceV3, "runtime_digest"> = { schema_version: 1, run_id: options.runId, binding_digest: options.frozen.binding.binding_digest, case_authority_digest: options.caseAuthority.authority_digest, runtime_path: wrapper ? "adaptive_skill" : "unbound_prompt", session_id: (await options.executionSession.getMetadata()).id, settled_events: 1, provider_kind: "deepseek_real", provider_id: GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.provider_id, model_id: GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.model_id, provider_profile_digest: GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.profile_digest, dispatch_attempts: 1, provider_dispatches: requests, credential_reads: 1, network_calls: requests, external_provider_calls: requests, real_model_calls: requests, provider_requests: requests, input_tokens: 0, output_tokens: 0, cost_usd: 0, tool_calls: 0, tool_profile_digest: goal3ToolProfileDigestV3(options.taskPolicy), task_prompt_sha256: sha256(options.taskPrompt), observed_system_prompt_sha256: sha256(options.frozen.composedPrompt), observed_user_message_sha256: sha256(userText), observed_skill_wrapper_sha256: wrapper ? sha256(wrapper) : null, model_payload_sha256: sha256(`test-payload:${userText}`) };
		const runtime = { ...body, runtime_digest: digestObject(body) }; writeOnceJson(options.runRoot, "runtime.json", runtime); return runtime;
	}, async close(): Promise<void> {} };
}

test("frozen fixture, profiles, Case Authority, State, and Skill identities match", async () => {
	assertFrozenGoal2CaseBytesV35(PROJECT_ROOT); assert.equal(goal3ToolProfileDigestV3(GOAL2_TASK_POLICY_V35), GOAL2_TOOL_PROFILE_DIGEST_V35); assert.equal(GOAL3_BUDGET_PROFILE_DIGEST_V3, "6b20b55e7930b193b7975c15668bba883961c9d3976e9d200b45cfd69d96be21");
	const output = root("identity"); const frozenCase = materializeGoal2CaseAuthorityV35({ projectRoot: PROJECT_ROOT, authorityRoot: resolve(output, "case") }); assert.equal(frozenCase.authority.authority_digest, GOAL2_CASE_AUTHORITY_DIGEST_V35);
	const selection = await materializeGoal2StateSelectionV35({ sourceStateRoot: HISTORICAL_STATE, authorityRoot: resolve(output, "selection") }); assert.equal(selection.authority.selected_state_digest, GOAL2_SELECTED_STATE_DIGEST_V35); assert.equal(selection.authority.skill_source_sha256, GOAL2_SKILL_SOURCE_SHA256_V35); assert.equal(selection.authority.skill_wrapper_sha256, GOAL2_SKILL_WRAPPER_SHA256_V35);
});

test("Direct Pi harness accepts a public JSONL Session and persists the actual turn", async () => {
	const output = root("persistent-direct"); const fixture = goal2FixturePathsV35(PROJECT_ROOT); const selectionRoot = resolve(output, "selection"); await materializeGoal2StateSelectionV35({ sourceStateRoot: HISTORICAL_STATE, authorityRoot: selectionRoot });
	const task = goal2VerifierTaskV35(PROJECT_ROOT); const authority = freezeGoal3CaseAuthorityV3({ authorityRoot: resolve(output, "case"), projectId: GOAL2_PROJECT_ID_V35, taskId: GOAL2_TASK_ID_V35, caseId: GOAL2_CASE_ID_V35, taskKind: GOAL2_TASK_KIND_V35, allowedFailureLineage: goal2FailureLineageV35(), taskPromptSha256: sha256(requireFrozenInstructionV35(PROJECT_ROOT)), verifierId: task.verifier_id, verifierSha256: task.verifier_sha256, toolProfileId: GOAL3_TOOL_PROFILE_ID_V3, toolProfileDigest: GOAL2_TOOL_PROFILE_DIGEST_V35, budgetProfileId: GOAL3_BUDGET_PROFILE_V3.profile_id, budgetProfileDigest: GOAL3_BUDGET_PROFILE_DIGEST_V3, providerProfile: GOAL3_FAUX_PROVIDER_PROFILE_V3 });
	const workspace = resolve(output, "workspace"); createTemporaryWorkspace({ projectRoot: PROJECT_ROOT, sourceRoot: fixture.workspace, targetRoot: workspace, workspaceId: "v35g2-direct-test-workspace", task: { ...GOAL2_TASK_POLICY_V35, workspace_source_digest: GOAL2_WORKSPACE_DIGEST_V35 } }); const runRoot = resolve(output, "run"); mkdirSync(runRoot);
	const frozen = await freezeGoal2RunBindingV35({ arm: "candidate", selectionAuthorityRoot: selectionRoot, caseAuthorityPath: authority.path, runRoot }); const repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: output, shellEnv: {} }), sessionsRoot: resolve(output, "sessions") }); const session = await repo.create({ cwd: workspace, id: "v35g2-direct-persistent-session", metadata: { project_id: GOAL2_PROJECT_ID_V35 } });
	const taskPrompt = requireFrozenInstructionV35(PROJECT_ROOT); const wrapper = formatSkillInvocation(frozen.adaptiveSkill!); const capture = createGoal2FirstProviderPayloadCaptureV35({ arm: "candidate", runId: "v35g2-direct-persistent-run", taskPrompt, expectedLastUserText: `${wrapper}\n\n${taskPrompt}`, skillWrapperSha256: sha256(wrapper) });
	await executeGoal3RunV3({ projectRoot: PROJECT_ROOT, runRoot, runId: "v35g2-direct-persistent-run", caseId: GOAL2_CASE_ID_V35, caseAuthorityPath: authority.path, workspaceRoot: workspace, taskPrompt, taskPolicy: GOAL2_TASK_POLICY_V35, verifierTask: task, verifierSourcePath: fixture.verifier, frozen, executionPort: createGoal3FauxExecutionPortV3(), executionSession: session, toolRestrictions: GOAL2_TOOL_RESTRICTIONS_V35, beforeProviderPayload: capture.observe, verifierWorkspaceEnvironmentKey: "V35_WORKSPACE" });
	const firstCapture = capture.requireEvidence(); capture.observe({ model: "later-drift", messages: [{ role: "user", content: "later request" }] }); assert.deepEqual(capture.requireEvidence(), firstCapture);
	assert.ok((await session.getEntries()).length >= 2); assert.equal(JSON.parse(readFileSync(resolve(runRoot, "runtime.json"), "utf8")).session_id, "v35g2-direct-persistent-session");
});

test("Goal 2 first-payload capture rejects wrong, missing, or extra Skill treatment text", async () => {
	const output = root("payload-treatment"); const selectionRoot = resolve(output, "selection"); await materializeGoal2StateSelectionV35({ sourceStateRoot: HISTORICAL_STATE, authorityRoot: selectionRoot }); const selected = await inspectGoal2StateSelectionV35({ authorityRoot: selectionRoot });
	const taskPrompt = requireFrozenInstructionV35(PROJECT_ROOT); const wrapper = formatSkillInvocation(selected.skill); const expected = `${wrapper}\n\n${taskPrompt}`;
	const reject = (actual: string) => {
		const capture = createGoal2FirstProviderPayloadCaptureV35({ arm: "candidate", runId: GOAL2_CANDIDATE_RUN_ID_V35, taskPrompt, expectedLastUserText: expected, skillWrapperSha256: sha256(wrapper) });
		assert.throws(() => capture.observe({ model: "deepseek-chat", messages: [{ role: "system", content: "system" }, { role: "user", content: actual }], tools: [], stream: true }), /treatment text mismatch/);
	};
	reject(taskPrompt); reject(`<skill name="wrong">wrong</skill>\n\n${taskPrompt}`); reject(`${expected}\nextra treatment text`);
});

test("Goal 2 runtime narrows the frozen V3 authority to subject read/write and public_test only", async () => {
	const output = root("tool-surface"); const workspace = resolve(output, "workspace"); const fixture = goal2FixturePathsV35(PROJECT_ROOT); createTemporaryWorkspace({ projectRoot: PROJECT_ROOT, sourceRoot: fixture.workspace, targetRoot: workspace, workspaceId: "v35g2-tool-workspace", task: { ...GOAL2_TASK_POLICY_V35, workspace_source_digest: GOAL2_WORKSPACE_DIGEST_V35 } });
	const profile = createBoundedToolProfile(workspace, GOAL2_TASK_POLICY_V35, GOAL2_TOOL_RESTRICTIONS_V35); assert.deepEqual(profile.tools.map((tool) => tool.name), ["workspace_read", "workspace_write", "run_command"]);
	const invoke = async (name: string, args: unknown) => { const tool = profile.tools.find((entry) => entry.name === name); assert.ok(tool); return await tool.execute("call-1", args, undefined, undefined, profile.context); };
	await assert.rejects(() => invoke("workspace_read", { path: "package.json" }), /outside readable scope/); await assert.rejects(() => invoke("run_command", { command_id: "git_status" }), /not allowed/); await invoke("workspace_read", { path: "src/subject.ts" }); await invoke("run_command", { command_id: "public_test" });
});

test("Base then Candidate pair persists fair evidence and safe Read Model projection", async () => {
	const output = root("pair"); const pairRoot = resolve(output, "pair"); const prepared = await prepareGoal2PairV35({ projectRoot: PROJECT_ROOT, pairRoot, historicalStateRoot: HISTORICAL_STATE }); let sourceChecks = 0;
	const comparison = await executeGoal2PairV35({ projectRoot: PROJECT_ROOT, ...prepared, expectedImplementationCommit: "deterministic-test-commit", sourceIdentityVerifier: () => { sourceChecks++; assertFrozenGoal2CaseBytesV35(PROJECT_ROOT); }, executionPortFactory: (_arm, counters) => fakeDeepSeekPort(counters) });
	assert.equal(sourceChecks, 2); assert.equal(comparison.result, "both_failed"); assert.equal(comparison.fairness_valid, true); const inspected = await inspectGoal2PairV35({ pairRoot }); assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	const view = await readGoal2SkillComparisonV35({ sourceRoot: pairRoot }); assert.equal(view.source_status, "available"); assert.equal(view.skill?.wrapper_sha256, GOAL2_SKILL_WRAPPER_SHA256_V35); assert.equal(view.base?.session_id.endsWith("base-session-01"), true); assert.equal(view.candidate?.session_id.endsWith("candidate-session-01"), true);
	const tampered = resolve(output, "tampered"); cpSync(pairRoot, tampered, { recursive: true }); const candidatePath = resolve(tampered, comparison.candidate_manifest_ref.path); const candidate = JSON.parse(readFileSync(candidatePath, "utf8")); candidate.cost_usd = 9; writeFileSync(candidatePath, JSON.stringify(candidate), "utf8"); assert.equal((await inspectGoal2PairV35({ pairRoot: tampered })).integrity_valid, false);
	const missingPayload = resolve(output, "missing-payload"); cpSync(pairRoot, missingPayload, { recursive: true }); unlinkSync(resolve(missingPayload, "runs", GOAL2_CANDIDATE_RUN_ID_V35, "first-provider-payload.json")); assert.equal((await inspectGoal2PairV35({ pairRoot: missingPayload })).integrity_valid, false);
});

test("non-treatment first Provider payload drift invalidates the pair", async () => {
	const output = root("payload-drift"); const pairRoot = resolve(output, "pair"); const prepared = await prepareGoal2PairV35({ projectRoot: PROJECT_ROOT, pairRoot, historicalStateRoot: HISTORICAL_STATE });
	await assert.rejects(() => executeGoal2PairV35({ projectRoot: PROJECT_ROOT, ...prepared, expectedImplementationCommit: "deterministic-test-commit", sourceIdentityVerifier: () => undefined, executionPortFactory: (arm, counters) => fakeDeepSeekPort(counters, 1, arm === "candidate" ? { temperature: 0.25 } : {}) }), /pair fairness invalid/);
	assert.equal(existsSync(resolve(pairRoot, "comparison.json")), false);
});

test("an over-budget Base terminalizes the pair without dispatching Candidate", async () => {
	const output = root("budget-stop"); const pairRoot = resolve(output, "pair"); const prepared = await prepareGoal2PairV35({ projectRoot: PROJECT_ROOT, pairRoot, historicalStateRoot: HISTORICAL_STATE }); let ports = 0;
	await assert.rejects(() => executeGoal2PairV35({ projectRoot: PROJECT_ROOT, ...prepared, expectedImplementationCommit: "deterministic-test-commit", sourceIdentityVerifier: () => undefined, executionPortFactory: (_arm, counters) => { ports++; return fakeDeepSeekPort(counters, 17); } }), /arm budget invalid/);
	assert.equal(ports, 1); assert.equal(readFileSync(resolve(pairRoot, "pause.json"), "utf8").includes('"status":"invalid_pair"'), true); assert.equal(existsSync(resolve(pairRoot, "runs/v35-g2-stable-unique-candidate-run-01")), false);
});

test("reference calibration passes with zero access and remains outside arm Workspaces", () => {
	const output = root("calibration"); const result = runGoal2ReferenceCalibrationV35({ projectRoot: PROJECT_ROOT, outputRoot: resolve(output, "evidence") }); assert.equal(result.verifier_status, "passed"); assert.equal(result.credential_reads, 0); assert.equal(result.network_calls, 0); assert.equal(result.real_model_calls, 0); assert.equal(readFileSync(resolve(output, "evidence/reference-workspace/src/subject.ts"), "utf8"), readFileSync(goal2FixturePathsV35(PROJECT_ROOT).reference, "utf8"));
});
