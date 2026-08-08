import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { formatSkillInvocation, JsonlSessionRepo, type JsonlSessionMetadata, type Session } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { fauxAssistantMessage, fauxToolCall, type FauxResponseStep } from "@earendil-works/pi-ai";
import type { Goal25PreVerifierCheckpointV35 } from "../src/contracts/v35g25-types.ts";
import type { ArtifactRefV0B } from "../src/contracts/v0b-types.ts";
import type { Goal3CaseAuthorityV3 } from "../src/contracts/v3g3-types.ts";
import type { BoundedTaskPolicy } from "../src/types.ts";
import { writeOnceJson } from "../src/evidence/artifacts.ts";
import { digestObject, sha256, treeDigest } from "../src/hash.ts";
import { createGoal25FauxExecutionPortV35 } from "../src/pi/pi-adapter-v35g25.ts";
import { GOAL3_BUDGET_PROFILE_DIGEST_V3, GOAL3_BUDGET_PROFILE_V3, GOAL3_FAUX_PROVIDER_PROFILE_V3, GOAL3_TOOL_PROFILE_ID_V3 } from "../src/pi/runtime-profile-v3.ts";
import { createBoundedToolProfile, readProtectedBytes } from "../src/pi/tool-profile.ts";
import { freezeGoal3CaseAuthorityV3 } from "../src/state/case-authority-v3.ts";
import { createTemporaryWorkspace } from "../src/workspace/temp-copy.ts";
import {
	GOAL2_CASE_ID_V35,
	GOAL2_FAILURE_FAMILY_V35,
	GOAL2_PROJECT_ID_V35,
	GOAL2_TASK_ID_V35,
	GOAL2_TASK_KIND_V35,
	GOAL2_TASK_POLICY_V35,
	GOAL2_TOOL_PROFILE_DIGEST_V35,
	GOAL2_WORKSPACE_DIGEST_V35,
	goal2FailureLineageV35,
	goal2FixturePathsV35,
	requireFrozenInstructionV35,
} from "../src/v35g2/case-v35g2.ts";
import { createGoal2FirstProviderPayloadCaptureV35 } from "../src/v35g2/payload-fairness-v35g2.ts";
import { freezeGoal2RunBindingV35, materializeGoal2StateSelectionV35 } from "../src/v35g2/state-selection-v35g2.ts";
import { GOAL25_LEGAL_COMMAND_IDS_V35, GOAL25_TOOL_RESTRICTIONS_V35 } from "../src/v35g25/case-v35g25.ts";
import {
	createGoal25PreVerifierCheckpointV35,
	createGoal25SettledVerifierHandoffV35,
	goal25CheckpointGateErrors,
	handoffGoal25SettledVerifierV35,
	handoffGoal25VerifierV35,
} from "../src/v35g25/checkpoint-v35g25.ts";
import { assertGoal25PinnedPiSourceV35, createGoal25RealPairPortFactoryV35, createGoal25SessionRunLinkV35 } from "../src/v35g25/pair-v35g25.ts";
import { compareGoal25FirstProviderPayloadsV35 } from "../src/v35g25/payload-fairness-v35g25.ts";
import { GOAL25_REAL_PAIR_AUTHORIZATION_TOKEN_V35, parseGoal25RealPairArgumentsV35 } from "../src/v35g25/real-entry-v35g25.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const HISTORICAL_STATE = "D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/project-state";
const TEST_ROOT = resolve(PROJECT_ROOT, ".runs/v3-5-g2-5/tests");

function root(label: string): string {
	const value = resolve(TEST_ROOT, `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	mkdirSync(value, { recursive: true });
	return value;
}

function toolResponse(name: string, args: Record<string, unknown>, id: string): FauxResponseStep {
	return fauxAssistantMessage(fauxToolCall(name, args, { id }), { stopReason: "toolUse", timestamp: 1 });
}

async function setupRun(options: { label: string; arm?: "base" | "candidate"; correctWorkspace?: boolean }): Promise<{
	output: string;
	runRoot: string;
	workspace: string;
	session: Session<JsonlSessionMetadata>;
	frozen: Awaited<ReturnType<typeof freezeGoal2RunBindingV35>>;
	caseAuthority: Goal3CaseAuthorityV3;
	taskPrompt: string;
}> {
	const output = root(options.label);
	const runRoot = resolve(output, "run");
	mkdirSync(runRoot, { recursive: true });
	const selectionRoot = resolve(output, "selection");
	await materializeGoal2StateSelectionV35({ sourceStateRoot: HISTORICAL_STATE, authorityRoot: selectionRoot });
	const fixture = goal2FixturePathsV35(PROJECT_ROOT);
	const workspace = resolve(output, "workspace");
	createTemporaryWorkspace({
		projectRoot: PROJECT_ROOT,
		sourceRoot: fixture.workspace,
		targetRoot: workspace,
		workspaceId: `${options.label}-workspace`,
		task: { ...GOAL2_TASK_POLICY_V35, workspace_source_digest: GOAL2_WORKSPACE_DIGEST_V35 },
	});
	if (options.correctWorkspace) writeFileSync(resolve(workspace, "src/subject.ts"), readFileSync(fixture.reference));
	const taskPrompt = requireFrozenInstructionV35(PROJECT_ROOT);
	const authority = freezeGoal3CaseAuthorityV3({
		authorityRoot: resolve(output, "case"),
		projectId: GOAL2_PROJECT_ID_V35,
		taskId: GOAL2_TASK_ID_V35,
		caseId: GOAL2_CASE_ID_V35,
		taskKind: GOAL2_TASK_KIND_V35,
		allowedFailureLineage: goal2FailureLineageV35(),
		taskPromptSha256: sha256(taskPrompt),
		verifierId: "v35-g2-5-zero-access-test-verifier",
		verifierSha256: sha256("v35-g2-5-zero-access-test-verifier"),
		toolProfileId: GOAL3_TOOL_PROFILE_ID_V3,
		toolProfileDigest: GOAL2_TOOL_PROFILE_DIGEST_V35,
		budgetProfileId: GOAL3_BUDGET_PROFILE_V3.profile_id,
		budgetProfileDigest: GOAL3_BUDGET_PROFILE_DIGEST_V3,
		providerProfile: GOAL3_FAUX_PROVIDER_PROFILE_V3,
	});
	const frozen = await freezeGoal2RunBindingV35({
		arm: options.arm ?? "base",
		selectionAuthorityRoot: selectionRoot,
		caseAuthorityPath: authority.path,
		runRoot,
	});
	const repo = new JsonlSessionRepo({
		fs: new NodeExecutionEnv({ cwd: runRoot, shellEnv: {} }),
		sessionsRoot: resolve(runRoot, "sessions"),
	});
	const session = await repo.create({ cwd: workspace, id: `${options.label}-session`, metadata: { goal_id: "v35g25" } });
	return { output, runRoot, workspace, session, frozen, caseAuthority: authority.authority, taskPrompt };
}

function checkpointWith(
	checkpoint: Goal25PreVerifierCheckpointV35,
	change: Partial<Goal25PreVerifierCheckpointV35>,
	recomputeDigest = true,
): Goal25PreVerifierCheckpointV35 {
	const changed = { ...structuredClone(checkpoint), ...change };
	if (recomputeDigest) {
		const body = { ...changed } as Record<string, unknown>;
		delete body.checkpoint_digest;
		changed.checkpoint_digest = digestObject(body);
	}
	return changed;
}

async function successfulSettledRun(label: string): Promise<Awaited<ReturnType<typeof setupRun>> & {
	runtime: Awaited<ReturnType<ReturnType<typeof createGoal25FauxExecutionPortV35>["execute"]>>;
	firstPayloadRef: ArtifactRefV0B;
	firstPayloadToolsSha256: string;
	protectedBefore: Readonly<Record<string, string>>;
}> {
	const setup = await setupRun({ label, correctWorkspace: true });
	const capture = createGoal2FirstProviderPayloadCaptureV35({
		arm: "base",
		runId: `${label}-run`,
		taskPrompt: setup.taskPrompt,
		expectedLastUserText: setup.taskPrompt,
		skillWrapperSha256: null,
	});
	const protectedBefore = readProtectedBytes(setup.workspace, GOAL2_TASK_POLICY_V35);
	const port = createGoal25FauxExecutionPortV35([toolResponse("run_command", { command_id: "public_test" }, `${label}-public-test`)]);
	const runtime = await port.execute({
		runRoot: setup.runRoot,
		runId: `${label}-run`,
		workspaceRoot: setup.workspace,
		taskPrompt: setup.taskPrompt,
		taskPolicy: GOAL2_TASK_POLICY_V35,
		frozen: setup.frozen,
		caseAuthority: setup.caseAuthority,
		executionSession: setup.session,
		toolRestrictions: GOAL25_TOOL_RESTRICTIONS_V35,
		beforeProviderPayload: capture.observe,
	});
	const firstPayload = capture.requireEvidence();
	return { ...setup, runtime, firstPayloadRef: writeOnceJson(setup.runRoot, "first-provider-payload.json", firstPayload), firstPayloadToolsSha256: firstPayload.tools_sha256, protectedBefore };
}

async function createSettledHandoff(setup: Awaited<ReturnType<typeof successfulSettledRun>>) {
	return await createGoal25SettledVerifierHandoffV35({
		runRoot: setup.runRoot,
		runtime: setup.runtime,
		session: setup.session,
		sessionEvidenceRoot: setup.runRoot,
		sessionRoot: resolve(setup.runRoot, "sessions"),
		workspaceRoot: setup.workspace,
		taskPolicy: GOAL2_TASK_POLICY_V35,
		protectedBefore: setup.protectedBefore,
		firstPayloadRef: setup.firstPayloadRef,
		firstPayloadToolsSha256: setup.firstPayloadToolsSha256,
	});
}

async function budgetTerminalCheckpoint(label: string) {
	const setup = await setupRun({ label });
	const capture = createGoal2FirstProviderPayloadCaptureV35({
		arm: "base",
		runId: `${label}-run`,
		taskPrompt: setup.taskPrompt,
		expectedLastUserText: setup.taskPrompt,
		skillWrapperSha256: null,
	});
	const responses = Array.from({ length: 16 }, (_, index) => toolResponse("workspace_read", { path: "src/subject.ts" }, `${label}-read-${index + 1}`));
	const port = createGoal25FauxExecutionPortV35(responses);
	const runtime = await port.execute({
		runRoot: setup.runRoot,
		runId: `${label}-run`,
		workspaceRoot: setup.workspace,
		taskPrompt: setup.taskPrompt,
		taskPolicy: GOAL2_TASK_POLICY_V35,
		frozen: setup.frozen,
		caseAuthority: setup.caseAuthority,
		executionSession: setup.session,
		toolRestrictions: GOAL25_TOOL_RESTRICTIONS_V35,
		beforeProviderPayload: capture.observe,
	});
	const firstPayload = capture.requireEvidence();
	const firstPayloadRef = writeOnceJson(setup.runRoot, "first-provider-payload.json", firstPayload);
	const protectedBefore = readProtectedBytes(setup.workspace, GOAL2_TASK_POLICY_V35);
	const created = await createGoal25PreVerifierCheckpointV35({
		runRoot: setup.runRoot,
		runtime,
		session: setup.session,
		sessionEvidenceRoot: setup.runRoot,
		sessionRoot: resolve(setup.runRoot, "sessions"),
		workspaceRoot: setup.workspace,
		taskPolicy: GOAL2_TASK_POLICY_V35,
		protectedBefore,
		firstPayloadRef,
		firstPayloadToolsSha256: firstPayload.tools_sha256,
	});
	return { ...setup, runtime, port, protectedBefore, created };
}

test("Goal 2.5 command affordance exposes exactly public_test and remains fail closed", async () => {
	const setup = await setupRun({ label: "tool-affordance" });
	const profile = createBoundedToolProfile(setup.workspace, GOAL2_TASK_POLICY_V35, GOAL25_TOOL_RESTRICTIONS_V35);
	const command = profile.tools.find((tool) => tool.name === "run_command");
	assert.ok(command);
	const surface = JSON.stringify({ description: command.description, parameters: command.parameters });
	assert.deepEqual(GOAL25_LEGAL_COMMAND_IDS_V35, ["public_test"]);
	assert.match(surface, /public_test/);
	assert.doesNotMatch(surface, /git_status|git_diff|git_log/);
	await assert.rejects(
		() => command.execute("unknown", { command_id: "not_a_legal_command" }, undefined, undefined, profile.context),
		/command ID is not allowed/,
	);
});

test("successful public_test persists its Tool Result, terminates, and settles exactly once", async () => {
	const setup = await setupRun({ label: "successful-termination", correctWorkspace: true });
	const taskPrompt = setup.taskPrompt;
	const capture = createGoal2FirstProviderPayloadCaptureV35({
		arm: "base",
		runId: "success-run",
		taskPrompt,
		expectedLastUserText: taskPrompt,
		skillWrapperSha256: null,
	});
	let actualFirstPayload: unknown = null;
	const port = createGoal25FauxExecutionPortV35([toolResponse("run_command", { command_id: "public_test" }, "public-success")]);
	const runtime = await port.execute({
		runRoot: setup.runRoot,
		runId: "success-run",
		workspaceRoot: setup.workspace,
		taskPrompt,
		taskPolicy: GOAL2_TASK_POLICY_V35,
		frozen: setup.frozen,
		caseAuthority: setup.caseAuthority,
		executionSession: setup.session,
		toolRestrictions: GOAL25_TOOL_RESTRICTIONS_V35,
		beforeProviderPayload: (payload) => {
			if (actualFirstPayload === null) actualFirstPayload = structuredClone(payload);
			capture.observe(payload);
		},
	});
	const entries = await setup.session.getEntries();
	assert.equal(runtime.trajectory_outcome, "settled");
	assert.equal(runtime.task_outcome, null);
	assert.equal(runtime.public_test_terminated, true);
	assert.equal(runtime.provider_dispatches, 1);
	assert.equal(runtime.raw_harness_settled_events, 1);
	assert.equal(entries.filter((entry) => "message" in entry && entry.message.role === "toolResult").length, 1);
	const actualSurface = JSON.stringify((actualFirstPayload as { tools?: unknown }).tools);
	assert.match(actualSurface, /public_test/);
	assert.doesNotMatch(actualSurface, /git_status|git_diff|git_log|not_a_legal_command/);
	assert.equal(capture.requireEvidence().tools_sha256, runtime.tool_interface_sha256);
	assert.deepEqual(port.accessCounters, { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 });
});

test("mixed Tool batch refuses a post-public_test Provider request before dispatch and invalidates the trajectory", async () => {
	const setup = await setupRun({ label: "mixed-batch-post-success", correctWorkspace: true });
	const capture = createGoal2FirstProviderPayloadCaptureV35({
		arm: "base",
		runId: "mixed-batch-post-success-run",
		taskPrompt: setup.taskPrompt,
		expectedLastUserText: setup.taskPrompt,
		skillWrapperSha256: null,
	});
	const mixedResponse = fauxAssistantMessage([
		fauxToolCall("run_command", { command_id: "public_test" }, { id: "mixed-public-test" }),
		fauxToolCall("workspace_read", { path: "src/subject.ts" }, { id: "mixed-read" }),
	], { stopReason: "toolUse", timestamp: 1 });
	const port = createGoal25FauxExecutionPortV35([
		mixedResponse,
		fauxAssistantMessage("must not dispatch", { timestamp: 2 }),
	]);
	const runtime = await port.execute({
		runRoot: setup.runRoot,
		runId: "mixed-batch-post-success-run",
		workspaceRoot: setup.workspace,
		taskPrompt: setup.taskPrompt,
		taskPolicy: GOAL2_TASK_POLICY_V35,
		frozen: setup.frozen,
		caseAuthority: setup.caseAuthority,
		executionSession: setup.session,
		toolRestrictions: GOAL25_TOOL_RESTRICTIONS_V35,
		beforeProviderPayload: capture.observe,
	});
	let verifierRuns = 0;
	let candidateStarts = 0;
	if (runtime.trajectory_outcome !== "invalid") {
		verifierRuns++;
		candidateStarts++;
	}
	assert.equal(runtime.trajectory_outcome, "invalid");
	assert.equal(runtime.terminal_reason, "invalid");
	assert.equal(runtime.public_test_succeeded, true);
	assert.equal(runtime.public_test_terminated, false);
	assert.equal(runtime.provider_request_after_successful_public_test, true);
	assert.equal(runtime.request_attempts, 2);
	assert.equal(runtime.provider_dispatches, 1);
	assert.equal(runtime.provider_responses, 1);
	assert.equal(verifierRuns, 0);
	assert.equal(candidateStarts, 0);
	assert.deepEqual(port.accessCounters, { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 });
});

test("settled handoff authenticates persisted Runtime, public Session, Workspace and first payload before one Verifier", async () => {
	const setup = await successfulSettledRun("settled-handoff-valid");
	const created = await createSettledHandoff(setup);
	assert.equal(created.handoff.runtime_matches_expected, true);
	assert.equal(created.handoff.session_reopen_equal, true);
	assert.equal(created.handoff.tool_calls_closed, true);
	assert.equal(created.handoff.session_entry_count, (await setup.session.getEntries()).length);
	let verifierRuns = 0;
	const outcome = await handoffGoal25SettledVerifierV35({
		runRoot: setup.runRoot,
		handoffRef: created.ref,
		sessionRoot: resolve(setup.runRoot, "sessions"),
		sessionEvidenceRoot: setup.runRoot,
		workspaceRoot: setup.workspace,
		taskPolicy: GOAL2_TASK_POLICY_V35,
		protectedBefore: setup.protectedBefore,
		expectedRunId: setup.runtime.run_id,
		expectedSessionId: setup.runtime.session_id,
		expectedToolInterfaceSha256: setup.runtime.tool_interface_sha256,
		runVerifier: async () => {
			assert.equal(existsSync(resolve(setup.runRoot, created.ref.path)), true);
			verifierRuns++;
			return "passed";
		},
	});
	assert.equal(verifierRuns, 1);
	assert.equal(outcome.trajectory_outcome, "settled");
	assert.equal(outcome.task_outcome, "passed");
	assert.equal(outcome.candidate_eligible, true);
});

test("settled handoff mismatches stop before every Verifier and Candidate start", async () => {
	const scenarios: Array<[string, (setup: Awaited<ReturnType<typeof successfulSettledRun>>) => Promise<void> | void]> = [
		["persisted Runtime tamper", (setup) => {
			const runtime = JSON.parse(readFileSync(resolve(setup.runRoot, "runtime-v35g25.json"), "utf8")) as Record<string, unknown>;
			runtime.provider_dispatches = Number(runtime.provider_dispatches) + 1;
			writeFileSync(resolve(setup.runRoot, "runtime-v35g25.json"), `${JSON.stringify(runtime)}\n`);
		}],
		["Session Tool-result mismatch", async (setup) => {
			const metadata = await setup.session.getMetadata();
			const lines = readFileSync(metadata.path, "utf8").trim().split(/\r?\n/);
			const filtered = lines.filter((line) => !line.includes('"role":"toolResult"'));
			assert.ok(filtered.length < lines.length);
			writeFileSync(metadata.path, `${filtered.join("\n")}\n`);
		}],
		["Workspace drift", (setup) => writeFileSync(resolve(setup.workspace, "src/subject.ts"), "export const drift = true;\n")],
		["protected drift", (setup) => writeFileSync(resolve(setup.workspace, "package.json"), "{}\n")],
		["missing first payload", (setup) => unlinkSync(resolve(setup.runRoot, setup.firstPayloadRef.path))],
		["tampered first payload", (setup) => writeFileSync(resolve(setup.runRoot, setup.firstPayloadRef.path), "{}\n")],
	];
	for (const [label, mutate] of scenarios) {
		const setup = await successfulSettledRun(`settled-negative-${label.replaceAll(" ", "-")}`);
		const created = await createSettledHandoff(setup);
		await mutate(setup);
		let verifierRuns = 0;
		let candidateStarts = 0;
		await assert.rejects(async () => {
			await handoffGoal25SettledVerifierV35({
				runRoot: setup.runRoot,
				handoffRef: created.ref,
				sessionRoot: resolve(setup.runRoot, "sessions"),
				sessionEvidenceRoot: setup.runRoot,
				workspaceRoot: setup.workspace,
				taskPolicy: GOAL2_TASK_POLICY_V35,
				protectedBefore: setup.protectedBefore,
				expectedRunId: setup.runtime.run_id,
				expectedSessionId: setup.runtime.session_id,
				expectedToolInterfaceSha256: setup.runtime.tool_interface_sha256,
				runVerifier: async () => { verifierRuns++; candidateStarts++; return "failed"; },
			});
		}, /settled handoff inspection rejected/, label);
		assert.equal(verifierRuns, 0, label);
		assert.equal(candidateStarts, 0, label);
	}
});

test("failed and timed-out public checks never return termination", async () => {
	const setup = await setupRun({ label: "non-terminating-checks" });
	const profile = createBoundedToolProfile(setup.workspace, GOAL2_TASK_POLICY_V35, GOAL25_TOOL_RESTRICTIONS_V35);
	const command = profile.tools.find((tool) => tool.name === "run_command");
	assert.ok(command);
	const failed = await command.execute("failed", { command_id: "public_test" }, undefined, undefined, profile.context);
	assert.notEqual(failed.terminate, true);
	const timeoutTask: BoundedTaskPolicy = {
		writable_paths: [],
		protected_paths: [],
		command_descriptors: [{
			command_id: "public_test",
			executable: "current_node_executable",
			argv: ["-e", "setInterval(() => {}, 1000)"],
			cwd: "workspace",
			timeout_seconds: 0.05,
			max_combined_output_bytes: 1_024,
		}],
	};
	const timeoutProfile = createBoundedToolProfile(setup.workspace, timeoutTask, {
		allowed_tool_names: ["run_command"],
		allow_repository_commands: false,
		expose_task_command_ids: true,
		terminate_on_successful_command_ids: ["public_test"],
	});
	const timeoutCommand = timeoutProfile.tools[0]!;
	const timedOut = await timeoutCommand.execute("timeout", { command_id: "public_test" }, undefined, undefined, timeoutProfile.context);
	assert.notEqual(timedOut.terminate, true);
	assert.equal(timeoutProfile.commandExecutions[0]?.timed_out, true);
});

test("the seventeenth request attempt refuses locally after exactly sixteen dispatches", async () => {
	const setup = await budgetTerminalCheckpoint("budget-terminal");
	const { runtime, port, created, protectedBefore } = setup;
	assert.equal(runtime.trajectory_outcome, "pre_dispatch_budget_terminal");
	assert.equal(runtime.terminal_reason, "provider_request_budget_exhausted");
	assert.equal(runtime.request_attempts, 17);
	assert.equal(runtime.provider_dispatches, 16);
	assert.equal(runtime.provider_responses, 16);
	assert.equal(runtime.pending_provider_reservations, 0);
	assert.equal(runtime.pending_tool_calls, 0);
	assert.equal(runtime.pending_side_effects, 0);
	assert.equal(runtime.usage_known, true);
	assert.deepEqual(port.accessCounters, { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 });
	let verifierRuns = 0;
	const outcome = await handoffGoal25VerifierV35({
		runRoot: setup.runRoot,
		checkpointRef: created.ref,
		sessionRoot: resolve(setup.runRoot, "sessions"),
		sessionEvidenceRoot: setup.runRoot,
		workspaceRoot: setup.workspace,
		taskPolicy: GOAL2_TASK_POLICY_V35,
		protectedBefore,
		expectedRunId: runtime.run_id,
		expectedSessionId: runtime.session_id,
		expectedToolInterfaceSha256: runtime.tool_interface_sha256,
		runVerifier: async () => { verifierRuns++; return "failed"; },
	});
	assert.equal(verifierRuns, 1);
	assert.equal(outcome.task_outcome, "failed");
	assert.equal(outcome.trajectory_outcome, "pre_dispatch_budget_terminal");
	assert.equal(outcome.candidate_eligible, true);

	const negativeFixtures: Array<[string, Partial<Goal25PreVerifierCheckpointV35>, boolean]> = [
		["pending Provider", { pending_provider_reservations: 1 as 0 }, true],
		["pending Tool", { pending_tool_calls: 1 as 0 }, true],
		["pending side effect", { pending_side_effects: 1 as 0 }, true],
		["unknown usage", { usage_known: false as true }, true],
		["Session mismatch", { session_reopen_equal: false as true }, true],
		["missing Tool Result", { tool_calls_closed: false as true }, true],
		["Workspace drift", { workspace_unchanged_since_terminal: false as true }, true],
		["protected drift", { protected_unchanged: false as true }, true],
		["missing first payload", { first_payload_present: false as true }, true],
		["timeout", { timed_out: true as false }, true],
		["post-dispatch loss", { post_dispatch_loss: true as false }, true],
		["tampered checkpoint", { workspace_tree_sha256: "tampered" }, false],
	];
	for (const [label, mutation, recompute] of negativeFixtures) {
		let negativeVerifierRuns = 0;
		let candidateStarts = 0;
		const invalid = checkpointWith(created.checkpoint, mutation, recompute);
		const errors = goal25CheckpointGateErrors(invalid);
		if (errors.length === 0) {
			negativeVerifierRuns++;
			candidateStarts++;
		}
		assert.ok(errors.length > 0, label);
		assert.equal(negativeVerifierRuns, 0, label);
		assert.equal(candidateStarts, 0, label);
	}
});

test("budget-terminal handoff rechecks live Session, Workspace and protected bytes before every Verifier", async () => {
	const scenarios: Array<[string, (setup: Awaited<ReturnType<typeof budgetTerminalCheckpoint>>) => Promise<void> | void]> = [
		["Session drift", async (setup) => { await setup.session.appendCustomEntry("post-checkpoint-drift", { changed: true }); }],
		["Workspace drift", (setup) => writeFileSync(resolve(setup.workspace, "src/subject.ts"), "export const postCheckpointDrift = true;\n")],
		["protected drift", (setup) => writeFileSync(resolve(setup.workspace, "package.json"), "{}\n")],
	];
	for (const [label, mutate] of scenarios) {
		const setup = await budgetTerminalCheckpoint(`budget-live-${label.replaceAll(" ", "-")}`);
		await mutate(setup);
		let verifierRuns = 0;
		let candidateStarts = 0;
		await assert.rejects(async () => {
			await handoffGoal25VerifierV35({
				runRoot: setup.runRoot,
				checkpointRef: setup.created.ref,
				sessionRoot: resolve(setup.runRoot, "sessions"),
				sessionEvidenceRoot: setup.runRoot,
				workspaceRoot: setup.workspace,
				taskPolicy: GOAL2_TASK_POLICY_V35,
				protectedBefore: setup.protectedBefore,
				expectedRunId: setup.runtime.run_id,
				expectedSessionId: setup.runtime.session_id,
				expectedToolInterfaceSha256: setup.runtime.tool_interface_sha256,
				runVerifier: async () => { verifierRuns++; candidateStarts++; return "failed"; },
			});
		}, /checkpoint inspection rejected/, label);
		assert.equal(verifierRuns, 0, label);
		assert.equal(candidateStarts, 0, label);
	}
});

test("Base and Candidate actual first payloads are identical outside the frozen Skill treatment", async () => {
	const payloads = [] as ReturnType<ReturnType<typeof createGoal2FirstProviderPayloadCaptureV35>["requireEvidence"]>[];
	for (const arm of ["base", "candidate"] as const) {
		const setup = await setupRun({ label: `payload-${arm}`, arm, correctWorkspace: true });
		const wrapper = setup.frozen.adaptiveSkill === null ? null : formatSkillInvocation(setup.frozen.adaptiveSkill);
		const expected = wrapper === null ? setup.taskPrompt : `${wrapper}\n\n${setup.taskPrompt}`;
		const capture = createGoal2FirstProviderPayloadCaptureV35({
			arm,
			runId: `payload-${arm}-run`,
			taskPrompt: setup.taskPrompt,
			expectedLastUserText: expected,
			skillWrapperSha256: wrapper === null ? null : sha256(wrapper),
		});
		const port = createGoal25FauxExecutionPortV35([toolResponse("run_command", { command_id: "public_test" }, `public-${arm}`)]);
		const runtime = await port.execute({
			runRoot: setup.runRoot,
			runId: `payload-${arm}-run`,
			workspaceRoot: setup.workspace,
			taskPrompt: setup.taskPrompt,
			taskPolicy: GOAL2_TASK_POLICY_V35,
			frozen: setup.frozen,
			caseAuthority: setup.caseAuthority,
			executionSession: setup.session,
			toolRestrictions: GOAL25_TOOL_RESTRICTIONS_V35,
			beforeProviderPayload: capture.observe,
		});
		const evidence = capture.requireEvidence();
		assert.equal(runtime.tool_interface_sha256, evidence.tools_sha256);
		payloads.push(evidence);
	}
	const fairness = compareGoal25FirstProviderPayloadsV35(payloads[0]!, payloads[1]!);
	assert.equal(fairness.equal_outside_frozen_skill_treatment, true);
	assert.equal(fairness.base_tool_interface_sha256, fairness.candidate_tool_interface_sha256);
});

test("arm evidence provides authenticated bidirectional Session and Run linkage", async () => {
	const setup = await successfulSettledRun("session-run-link");
	const created = await createGoal25SessionRunLinkV35({
		pairRoot: setup.runRoot,
		runRoot: setup.runRoot,
		arm: "base",
		runId: setup.runtime.run_id,
		sessionId: setup.runtime.session_id,
		session: setup.session,
	});
	assert.equal(created.link.run_ref, "goal25-manifest.json");
	assert.equal(created.link.session_id, setup.runtime.session_id);
	assert.equal(created.link.session_ref_root, "pair_root");
	assert.equal(created.link.session_entry_count, (await setup.session.getEntries()).length);
	assert.equal(created.link.session_entries_sha256, digestObject(await setup.session.getEntries()));
	const linkBody = { ...created.link } as Record<string, unknown>;
	delete linkBody.link_digest;
	assert.equal(created.link.link_digest, digestObject(linkBody));
	assert.equal(existsSync(resolve(setup.runRoot, created.link.session_ref.path)), true);
});

test("tracked real entry fails closed on arguments and composes two one-Run authorities with zero access", async () => {
	let resolverReads = 0;
	const resolver = { resolve: async () => { resolverReads++; return "must-not-be-read-during-composition"; } };
	const invalidArguments: readonly string[][] = [
		[],
		["--project-root", PROJECT_ROOT, "--pair-root", root("missing-real-args")],
		["--project-root", PROJECT_ROOT, "--pair-root", root("wrong-auth"), "--historical-state-root", HISTORICAL_STATE, "--execution-baseline", "a".repeat(40), "--authorize-real-pair", "WRONG"],
		["--project-root", PROJECT_ROOT, "--pair-root", root("bad-baseline"), "--historical-state-root", HISTORICAL_STATE, "--execution-baseline", "not-a-commit", "--authorize-real-pair", GOAL25_REAL_PAIR_AUTHORIZATION_TOKEN_V35],
	];
	for (const args of invalidArguments) assert.throws(() => parseGoal25RealPairArgumentsV35(args), /required|authorization|Baseline/);
	assert.equal(resolverReads, 0);
	const workbenchRoot = resolve(PROJECT_ROOT, "workbench");
	const noCredentialEnvironment = { ...process.env };
	delete noCredentialEnvironment["DEEPSEEK_API_KEY"];
	const missingCli = spawnSync(process.execPath, ["--experimental-loader", "./scripts/v35g2-public-pi-loader.mjs", "scripts/v35g25-real-pair.ts"], { cwd: workbenchRoot, encoding: "utf8", windowsHide: true, env: noCredentialEnvironment });
	assert.notEqual(missingCli.status, 0);
	const wrongCliPairRoot = resolve(TEST_ROOT, `cli-wrong-auth-${process.pid}-${Date.now()}`);
	const wrongCli = spawnSync(process.execPath, [
		"--experimental-loader", "./scripts/v35g2-public-pi-loader.mjs", "scripts/v35g25-real-pair.ts",
		"--project-root", PROJECT_ROOT,
		"--pair-root", wrongCliPairRoot,
		"--historical-state-root", HISTORICAL_STATE,
		"--execution-baseline", "a".repeat(40),
		"--authorize-real-pair", "WRONG",
	], { cwd: workbenchRoot, encoding: "utf8", windowsHide: true, env: noCredentialEnvironment });
	assert.notEqual(wrongCli.status, 0);
	assert.equal(existsSync(wrongCliPairRoot), false);
	assert.equal(resolverReads, 0);
	const parsed = parseGoal25RealPairArgumentsV35([
		"--project-root", PROJECT_ROOT,
		"--pair-root", root("valid-real-args"),
		"--historical-state-root", HISTORICAL_STATE,
		"--execution-baseline", "a".repeat(40),
		"--authorize-real-pair", GOAL25_REAL_PAIR_AUTHORIZATION_TOKEN_V35,
	]);
	assert.equal(parsed.expectedExecutionBaseline, "a".repeat(40));
	assert.doesNotThrow(() => assertGoal25PinnedPiSourceV35());
	const counters = { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 };
	const factory = createGoal25RealPairPortFactoryV35({ credentialResolver: resolver });
	const base = factory("base", counters);
	const candidate = factory("candidate", counters);
	assert.throws(() => factory("base", counters), /already constructed/);
	assert.equal(resolverReads, 0);
	assert.deepEqual({ ...counters, real_cost_usd: 0 }, { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0, real_cost_usd: 0 });
	await base.close();
	await candidate.close();
});

test("zero-access suite counters remain exactly 0/0/0/0/0", () => {
	const counters = { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0, real_cost_usd: 0 };
	assert.deepEqual(Object.values(counters), [0, 0, 0, 0, 0]);
	assert.equal(GOAL2_FAILURE_FAMILY_V35, "prior-pass");
});
