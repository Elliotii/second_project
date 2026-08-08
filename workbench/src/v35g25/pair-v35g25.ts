import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { formatSkillInvocation, JsonlSessionRepo, type JsonlSessionMetadata, type Session } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import type { Goal25ArmOutcomeV35, Goal25RuntimeEvidenceV35, Goal25SessionRunLinkV35 } from "../contracts/v35g25-types.ts";
import type { ArtifactRefV0B, VerifierResultV0B } from "../contracts/v0b-types.ts";
import { artifactRef, writeOnceBytes, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, sha256, treeDigest } from "../hash.ts";
import { createGoal25DeepSeekExecutionPortV35, type Goal25AccessCountersV35, type Goal25ExecutionPortV35 } from "../pi/pi-adapter-v35g25.ts";
import { readProtectedBytes } from "../pi/tool-profile.ts";
import { createOneRunProviderAuthorityV1B, type OpaqueCredentialResolverV1 } from "../provider/fixed-provider-v1.ts";
import { inspectGoal3CaseAuthorityV3 } from "../state/case-authority-v3.ts";
import { runExternalVerifierV0B } from "../verifier/runner.ts";
import { createTemporaryWorkspace } from "../workspace/temp-copy.ts";
import {
	GOAL2_CASE_ID_V35,
	GOAL2_PROJECT_ID_V35,
	GOAL2_TASK_POLICY_V35,
	GOAL2_WORKSPACE_DIGEST_V35,
	assertFrozenGoal2CaseBytesV35,
	goal2FixturePathsV35,
	goal2VerifierTaskV35,
	materializeGoal2CaseAuthorityV35,
	requireFrozenInstructionV35,
} from "../v35g2/case-v35g2.ts";
import { createGoal2FirstProviderPayloadCaptureV35 } from "../v35g2/payload-fairness-v35g2.ts";
import { freezeGoal2RunBindingV35, materializeGoal2StateSelectionV35 } from "../v35g2/state-selection-v35g2.ts";
import { GOAL25_TOOL_RESTRICTIONS_V35 } from "./case-v35g25.ts";
import {
	createGoal25PreVerifierCheckpointV35,
	createGoal25SettledVerifierHandoffV35,
	handoffGoal25SettledVerifierV35,
	handoffGoal25VerifierV35,
} from "./checkpoint-v35g25.ts";
import { compareGoal25FirstProviderPayloadsV35 } from "./payload-fairness-v35g25.ts";

export type Goal25ArmV35 = "base" | "candidate";

export const GOAL25_PAIR_ID_V35 = "v35-g25-stable-unique-pair-01";
export const GOAL25_PINNED_PI_COMMIT_V35 = "027a5847901b5dde30270abaa1041046cd2b4b55";
export const GOAL25_PINNED_PI_ROOT_V35 = "D:/AI/AI_Projects/project2/.upstream/pi";
export const GOAL25_IDS_V35 = Object.freeze({
	base: { session: "v35-g25-stable-unique-base-session-01", run: "v35-g25-stable-unique-base-run-01" },
	candidate: { session: "v35-g25-stable-unique-candidate-session-01", run: "v35-g25-stable-unique-candidate-run-01" },
});

export interface PreparedGoal25PairV35 {
	pairRoot: string;
	caseAuthorityPath: string;
	selectionAuthorityRoot: string;
	baseWorkspace: string;
	candidateWorkspace: string;
}

export interface Goal25ArmManifestV35 {
	schema_version: 1;
	arm: Goal25ArmV35;
	run_id: string;
	session_id: string;
	initial_workspace_sha256: string;
	final_workspace_sha256: string;
	binding_digest: string;
	case_authority_digest: string;
	runtime_ref: ArtifactRefV0B;
	first_payload_ref: ArtifactRefV0B;
	verifier_ref: ArtifactRefV0B;
	outcome_ref: ArtifactRefV0B;
	checkpoint_ref: ArtifactRefV0B | null;
	settled_handoff_ref: ArtifactRefV0B | null;
	session_link_ref: ArtifactRefV0B;
	session_ref_root: "pair_root";
	session_ref: ArtifactRefV0B;
	session_entry_count: number;
	session_entries_sha256: string;
	trajectory_outcome: Goal25ArmOutcomeV35["trajectory_outcome"];
	task_outcome: Goal25ArmOutcomeV35["task_outcome"];
	request_attempts: number;
	provider_dispatches: number;
	input_tokens: number;
	output_tokens: number;
	tool_calls: number;
	cost_usd: number;
	tool_interface_sha256: string;
	manifest_digest: string;
}

function portable(value: string): string { return value.split(sep).join("/"); }

export interface Goal25ComparisonV35 {
	schema_version: 1;
	pair_id: typeof GOAL25_PAIR_ID_V35;
	arm_order: ["base", "candidate"];
	base_manifest_ref: ArtifactRefV0B;
	candidate_manifest_ref: ArtifactRefV0B;
	tool_interface_sha256: string;
	payload_fairness_digest: string;
	base_task_outcome: Goal25ArmOutcomeV35["task_outcome"];
	candidate_task_outcome: Goal25ArmOutcomeV35["task_outcome"];
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
	provider_dispatches: number;
	input_tokens: number;
	output_tokens: number;
	cost_usd: number;
	comparison_digest: string;
}

export async function createGoal25SessionRunLinkV35(options: {
	pairRoot: string;
	runRoot: string;
	arm: Goal25ArmV35;
	runId: string;
	sessionId: string;
	session: Session<JsonlSessionMetadata>;
}): Promise<{ link: Goal25SessionRunLinkV35; ref: ArtifactRefV0B }> {
	const metadata = await options.session.getMetadata();
	const entries = await options.session.getEntries();
	if (metadata.id !== options.sessionId || entries.length < 2) throw new Error("Goal 2.5 Session/Run linkage identity invalid");
	const sessionRef = artifactRef(options.pairRoot, resolve(metadata.path), "application/x-ndjson", false);
	const body: Omit<Goal25SessionRunLinkV35, "link_digest"> = {
		schema_version: 1,
		arm: options.arm,
		run_id: options.runId,
		run_ref: portable(relative(options.pairRoot, resolve(options.runRoot, "goal25-manifest.json"))),
		session_id: options.sessionId,
		session_ref_root: "pair_root",
		session_ref: sessionRef,
		session_entry_count: entries.length,
		session_entries_sha256: digestObject(entries),
	};
	const link = { ...body, link_digest: digestObject(body) };
	return { link, ref: writeOnceJson(options.runRoot, "session-run-link.json", link) };
}

function assertExecutionBaseline(projectRoot: string, expectedExecutionBaseline: string): void {
	if (!/^[a-f0-9]{40}$/.test(expectedExecutionBaseline)) throw new Error("Goal 2.5 audited Execution Baseline identity invalid");
	const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: projectRoot, encoding: "utf8", windowsHide: true });
	const status = spawnSync("git", ["status", "--short", "--untracked-files=no"], { cwd: projectRoot, encoding: "utf8", windowsHide: true });
	if (head.status !== 0 || head.stdout.trim() !== expectedExecutionBaseline || status.status !== 0 || status.stdout.trim() !== "") throw new Error("Goal 2.5 source is not the exact clean audited Execution Baseline");
}

export function assertGoal25PinnedPiSourceV35(): void {
	const safeDirectory = `safe.directory=${GOAL25_PINNED_PI_ROOT_V35}`;
	const head = spawnSync("git", ["-c", safeDirectory, "rev-parse", "HEAD"], { cwd: GOAL25_PINNED_PI_ROOT_V35, encoding: "utf8", windowsHide: true });
	const status = spawnSync("git", ["-c", safeDirectory, "status", "--short", "--untracked-files=no"], { cwd: GOAL25_PINNED_PI_ROOT_V35, encoding: "utf8", windowsHide: true });
	if (head.status !== 0 || head.stdout.trim() !== GOAL25_PINNED_PI_COMMIT_V35 || status.status !== 0 || status.stdout.trim() !== "") throw new Error("Goal 2.5 pinned Pi source identity or tracked cleanliness invalid");
}

export async function prepareGoal25PairV35(options: {
	projectRoot: string;
	pairRoot: string;
	historicalStateRoot: string;
}): Promise<PreparedGoal25PairV35> {
	assertFrozenGoal2CaseBytesV35(options.projectRoot);
	if (existsSync(options.pairRoot)) throw new Error("Goal 2.5 pair identity already exists");
	mkdirSync(options.pairRoot, { recursive: true });
	const authorityRoot = resolve(options.pairRoot, "authority");
	const caseAuthority = materializeGoal2CaseAuthorityV35({ projectRoot: options.projectRoot, authorityRoot: resolve(authorityRoot, "case") });
	await materializeGoal2StateSelectionV35({ sourceStateRoot: options.historicalStateRoot, authorityRoot: resolve(authorityRoot, "state-selection") });
	const fixture = goal2FixturePathsV35(options.projectRoot);
	const workspace = (arm: Goal25ArmV35): string => {
		const target = resolve(options.pairRoot, "workspaces", arm);
		createTemporaryWorkspace({
			projectRoot: options.projectRoot,
			sourceRoot: fixture.workspace,
			targetRoot: target,
			workspaceId: `v35-g25-stable-unique-${arm}-workspace-01`,
			task: { ...GOAL2_TASK_POLICY_V35, workspace_source_digest: GOAL2_WORKSPACE_DIGEST_V35 },
		});
		return target;
	};
	const baseWorkspace = workspace("base");
	const candidateWorkspace = workspace("candidate");
	if (treeDigest(baseWorkspace) !== GOAL2_WORKSPACE_DIGEST_V35 || treeDigest(candidateWorkspace) !== GOAL2_WORKSPACE_DIGEST_V35) throw new Error("Goal 2.5 initial Workspace fairness failed");
	const preflightBody = {
		schema_version: 1,
		pair_id: GOAL25_PAIR_ID_V35,
		case_id: GOAL2_CASE_ID_V35,
		arm_order: ["base", "candidate"],
		initial_workspace_sha256: GOAL2_WORKSPACE_DIGEST_V35,
		base: GOAL25_IDS_V35.base,
		candidate: GOAL25_IDS_V35.candidate,
		credential_reads: 0,
		network_calls: 0,
		external_provider_calls: 0,
		real_model_calls: 0,
	};
	writeOnceJson(options.pairRoot, "preflight.json", { ...preflightBody, preflight_digest: digestObject(preflightBody) });
	return {
		pairRoot: resolve(options.pairRoot),
		caseAuthorityPath: caseAuthority.path,
		selectionAuthorityRoot: resolve(authorityRoot, "state-selection"),
		baseWorkspace,
		candidateWorkspace,
	};
}

async function executeArm(options: {
	projectRoot: string;
	prepared: PreparedGoal25PairV35;
	arm: Goal25ArmV35;
	accessCounters: Goal25AccessCountersV35;
	executionPortFactory: (arm: Goal25ArmV35, counters: Goal25AccessCountersV35) => Goal25ExecutionPortV35;
}): Promise<{ manifest: Goal25ArmManifestV35; ref: ArtifactRefV0B; firstPayload: ReturnType<ReturnType<typeof createGoal2FirstProviderPayloadCaptureV35>["requireEvidence"]> }> {
	const ids = GOAL25_IDS_V35[options.arm];
	const workspaceRoot = options.arm === "base" ? options.prepared.baseWorkspace : options.prepared.candidateWorkspace;
	const runRoot = resolve(options.prepared.pairRoot, "runs", ids.run);
	mkdirSync(runRoot, { recursive: true });
	if (treeDigest(workspaceRoot) !== GOAL2_WORKSPACE_DIGEST_V35) throw new Error(`Goal 2.5 ${options.arm} initial Workspace drift`);
	const taskPrompt = requireFrozenInstructionV35(options.projectRoot);
	const task = goal2VerifierTaskV35(options.projectRoot);
	const verifierSource = readFileSync(goal2FixturePathsV35(options.projectRoot).verifier);
	const verifierSnapshotPath = writeOnceBytes(runRoot, "verifier/source.mjs", verifierSource);
	const verifierSnapshotRef = artifactRef(runRoot, verifierSnapshotPath, "text/javascript; charset=utf-8", false);
	if (verifierSnapshotRef.sha256 !== task.verifier_sha256) throw new Error("Goal 2.5 verifier source identity mismatch before dispatch");
	const repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: options.prepared.pairRoot, shellEnv: {} }), sessionsRoot: resolve(options.prepared.pairRoot, "sessions") });
	if ((await repo.list()).some((entry) => entry.id === ids.session)) throw new Error("Goal 2.5 Session identity is not fresh");
	const session = await repo.create({ cwd: workspaceRoot, id: ids.session, metadata: { project_id: GOAL2_PROJECT_ID_V35, arm: options.arm, run_id: ids.run } });
	const frozen = await freezeGoal2RunBindingV35({ arm: options.arm, selectionAuthorityRoot: options.prepared.selectionAuthorityRoot, caseAuthorityPath: options.prepared.caseAuthorityPath, runRoot });
	const wrapper = frozen.adaptiveSkill === null ? null : formatSkillInvocation(frozen.adaptiveSkill);
	const capture = createGoal2FirstProviderPayloadCaptureV35({
		arm: options.arm,
		runId: ids.run,
		taskPrompt,
		expectedLastUserText: wrapper === null ? taskPrompt : `${wrapper}\n\n${taskPrompt}`,
		skillWrapperSha256: wrapper === null ? null : sha256(wrapper),
	});
	const protectedBefore = readProtectedBytes(workspaceRoot, GOAL2_TASK_POLICY_V35);
	const authority = inspectGoal3CaseAuthorityV3({ authorityPath: options.prepared.caseAuthorityPath, expectedProjectId: GOAL2_PROJECT_ID_V35 });
	const port = options.executionPortFactory(options.arm, options.accessCounters);
	let runtime: Goal25RuntimeEvidenceV35;
	try {
		runtime = await port.execute({
			runRoot,
			runId: ids.run,
			workspaceRoot,
			taskPrompt,
			taskPolicy: GOAL2_TASK_POLICY_V35,
			frozen,
			caseAuthority: authority,
			executionSession: session,
			toolRestrictions: GOAL25_TOOL_RESTRICTIONS_V35,
			beforeProviderPayload: capture.observe,
		});
	} finally {
		await port.close();
	}
	if (digestObject(readProtectedBytes(workspaceRoot, GOAL2_TASK_POLICY_V35)) !== digestObject(protectedBefore)) throw new Error(`Goal 2.5 ${options.arm} protected Workspace drift`);
	const firstPayload = capture.requireEvidence();
	if (firstPayload.tools_sha256 !== runtime.tool_interface_sha256) throw new Error("Goal 2.5 Tool-interface capture mismatch");
	const firstPayloadRef = writeOnceJson(runRoot, "first-provider-payload.json", firstPayload);
	let checkpointRef: ArtifactRefV0B | null = null;
	let settledHandoffRef: ArtifactRefV0B | null = null;
	if (runtime.trajectory_outcome === "pre_dispatch_budget_terminal") {
		const created = await createGoal25PreVerifierCheckpointV35({
			runRoot,
			runtime,
			session,
			sessionEvidenceRoot: options.prepared.pairRoot,
			sessionRoot: resolve(options.prepared.pairRoot, "sessions"),
			workspaceRoot,
			taskPolicy: GOAL2_TASK_POLICY_V35,
			protectedBefore,
			firstPayloadRef,
			firstPayloadToolsSha256: firstPayload.tools_sha256,
		});
		checkpointRef = created.ref;
	} else if (runtime.trajectory_outcome === "settled") {
		const created = await createGoal25SettledVerifierHandoffV35({
			runRoot,
			runtime,
			session,
			sessionEvidenceRoot: options.prepared.pairRoot,
			sessionRoot: resolve(options.prepared.pairRoot, "sessions"),
			workspaceRoot,
			taskPolicy: GOAL2_TASK_POLICY_V35,
			protectedBefore,
			firstPayloadRef,
			firstPayloadToolsSha256: firstPayload.tools_sha256,
		});
		settledHandoffRef = created.ref;
	} else {
		throw new Error(`Goal 2.5 ${options.arm} trajectory is invalid`);
	}
	let verifierRuns = 0;
	let verifierResult: VerifierResultV0B | null = null;
	const runVerifier = async (): Promise<"passed" | "failed"> => {
		if (++verifierRuns !== 1) throw new Error("Goal 2.5 Verifier count exceeded");
		verifierResult = await runExternalVerifierV0B({
			projectRoot: options.projectRoot,
			runRoot,
			workspaceRoot,
			attemptId: `${ids.run}-attempt`,
			task,
			verifierSnapshotPath,
			verifierSnapshotRef,
			outputPath: "verifier/output.txt",
			workspaceEnvironmentKey: "V35_WORKSPACE",
		});
		if (verifierResult.status === "invalid") throw new Error("Goal 2.5 external Verifier result invalid");
		writeOnceJson(runRoot, "verifier/result.json", verifierResult);
		return verifierResult.status;
	};
	const outcome = checkpointRef
		? await handoffGoal25VerifierV35({
			runRoot,
			checkpointRef,
			sessionRoot: resolve(options.prepared.pairRoot, "sessions"),
			sessionEvidenceRoot: options.prepared.pairRoot,
			workspaceRoot,
			taskPolicy: GOAL2_TASK_POLICY_V35,
			protectedBefore,
			expectedRunId: ids.run,
			expectedSessionId: ids.session,
			expectedToolInterfaceSha256: runtime.tool_interface_sha256,
			runVerifier,
		})
		: await handoffGoal25SettledVerifierV35({
			runRoot,
			handoffRef: settledHandoffRef!,
			sessionRoot: resolve(options.prepared.pairRoot, "sessions"),
			sessionEvidenceRoot: options.prepared.pairRoot,
			workspaceRoot,
			taskPolicy: GOAL2_TASK_POLICY_V35,
			protectedBefore,
			expectedRunId: ids.run,
			expectedSessionId: ids.session,
			expectedToolInterfaceSha256: runtime.tool_interface_sha256,
			runVerifier,
		});
	if (verifierRuns !== 1 || verifierResult === null) throw new Error("Goal 2.5 external Verifier did not run exactly once");
	const sessionLink = await createGoal25SessionRunLinkV35({ pairRoot: options.prepared.pairRoot, runRoot, arm: options.arm, runId: ids.run, sessionId: ids.session, session });
	const manifestBody: Omit<Goal25ArmManifestV35, "manifest_digest"> = {
		schema_version: 1,
		arm: options.arm,
		run_id: ids.run,
		session_id: ids.session,
		initial_workspace_sha256: GOAL2_WORKSPACE_DIGEST_V35,
		final_workspace_sha256: treeDigest(workspaceRoot),
		binding_digest: frozen.binding.binding_digest,
		case_authority_digest: authority.authority_digest,
		runtime_ref: artifactRef(runRoot, "runtime-v35g25.json", "application/json", false),
		first_payload_ref: firstPayloadRef,
		verifier_ref: artifactRef(runRoot, "verifier/result.json", "application/json", false),
		outcome_ref: artifactRef(runRoot, "outcome.json", "application/json", false),
		checkpoint_ref: checkpointRef,
		settled_handoff_ref: settledHandoffRef,
		session_link_ref: sessionLink.ref,
		session_ref_root: "pair_root",
		session_ref: sessionLink.link.session_ref,
		session_entry_count: sessionLink.link.session_entry_count,
		session_entries_sha256: sessionLink.link.session_entries_sha256,
		trajectory_outcome: outcome.trajectory_outcome,
		task_outcome: outcome.task_outcome,
		request_attempts: runtime.request_attempts,
		provider_dispatches: runtime.provider_dispatches,
		input_tokens: runtime.input_tokens,
		output_tokens: runtime.output_tokens,
		tool_calls: runtime.tool_calls,
		cost_usd: runtime.cost_usd,
		tool_interface_sha256: runtime.tool_interface_sha256,
	};
	if (
		runtime.request_attempts > 17 || runtime.provider_dispatches > 16 || runtime.tool_calls > 24 ||
		runtime.input_tokens + runtime.output_tokens > 131_072 || runtime.cost_usd > 0.20
	) throw new Error(`Goal 2.5 ${options.arm} execution budget exceeded`);
	const manifest = { ...manifestBody, manifest_digest: digestObject(manifestBody) };
	const localManifestRef = writeOnceJson(runRoot, "goal25-manifest.json", manifest);
	return { manifest, ref: artifactRef(options.prepared.pairRoot, resolve(runRoot, localManifestRef.path), "application/json", false), firstPayload };
}

export function createGoal25RealPairPortFactoryV35(options: {
	credentialResolver: OpaqueCredentialResolverV1;
}): (arm: Goal25ArmV35, counters: Goal25AccessCountersV35) => Goal25ExecutionPortV35 {
	const constructed = new Set<Goal25ArmV35>();
	return (arm, counters) => {
		if (constructed.has(arm)) throw new Error(`Goal 2.5 ${arm} one-Run authority was already constructed`);
		constructed.add(arm);
		return createGoal25DeepSeekExecutionPortV35({
			authority: createOneRunProviderAuthorityV1B({ authorized: true, resolver: options.credentialResolver }),
			accessCounters: counters,
		});
	};
}

export async function executeGoal25RealPairV35(options: {
	projectRoot: string;
	prepared: PreparedGoal25PairV35;
	expectedExecutionBaseline: string;
	credentialResolver: OpaqueCredentialResolverV1;
}): Promise<Goal25ComparisonV35> {
	return await executeGoal25PairV35({
		projectRoot: options.projectRoot,
		prepared: options.prepared,
		expectedExecutionBaseline: options.expectedExecutionBaseline,
		sourceIdentityVerifier: assertGoal25PinnedPiSourceV35,
		executionPortFactory: createGoal25RealPairPortFactoryV35({ credentialResolver: options.credentialResolver }),
	});
}

export async function executeGoal25PairV35(options: {
	projectRoot: string;
	prepared: PreparedGoal25PairV35;
	executionPortFactory: (arm: Goal25ArmV35, counters: Goal25AccessCountersV35) => Goal25ExecutionPortV35;
	expectedExecutionBaseline: string;
	sourceIdentityVerifier: () => void;
}): Promise<Goal25ComparisonV35> {
	const counters: Goal25AccessCountersV35 = { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 };
	try {
		assertExecutionBaseline(options.projectRoot, options.expectedExecutionBaseline);
		options.sourceIdentityVerifier();
		const base = await executeArm({ ...options, arm: "base", accessCounters: counters });
		if (!base.manifest.task_outcome || base.manifest.task_outcome === "invalid") throw new Error("Goal 2.5 Base did not close with a valid Task Outcome");
		assertExecutionBaseline(options.projectRoot, options.expectedExecutionBaseline);
		options.sourceIdentityVerifier();
		const candidate = await executeArm({ ...options, arm: "candidate", accessCounters: counters });
		const fairness = compareGoal25FirstProviderPayloadsV35(base.firstPayload, candidate.firstPayload);
		const providerDispatches = base.manifest.provider_dispatches + candidate.manifest.provider_dispatches;
		const inputTokens = base.manifest.input_tokens + candidate.manifest.input_tokens;
		const outputTokens = base.manifest.output_tokens + candidate.manifest.output_tokens;
		const costUsd = base.manifest.cost_usd + candidate.manifest.cost_usd;
		if (counters.credential_reads > 2 || counters.network_calls > 32 || counters.external_provider_calls > 32 || counters.real_model_calls > 32 || providerDispatches > 32 || costUsd > 0.40) throw new Error("Goal 2.5 pair access budget exceeded");
		const body: Omit<Goal25ComparisonV35, "comparison_digest"> = {
			schema_version: 1,
			pair_id: GOAL25_PAIR_ID_V35,
			arm_order: ["base", "candidate"],
			base_manifest_ref: base.ref,
			candidate_manifest_ref: candidate.ref,
			tool_interface_sha256: fairness.tool_interface_sha256,
			payload_fairness_digest: fairness.fairness_digest,
			base_task_outcome: base.manifest.task_outcome,
			candidate_task_outcome: candidate.manifest.task_outcome,
			...counters,
			provider_dispatches: providerDispatches,
			input_tokens: inputTokens,
			output_tokens: outputTokens,
			cost_usd: costUsd,
		};
		const comparison = { ...body, comparison_digest: digestObject(body) };
		writeOnceJson(options.prepared.pairRoot, "comparison.json", comparison);
		return comparison;
	} catch (error) {
		writeOnceJson(options.prepared.pairRoot, "pause.json", {
			schema_version: 1,
			pair_id: GOAL25_PAIR_ID_V35,
			status: "invalid_pair",
			reason: error instanceof Error ? error.message : String(error),
			...counters,
		});
		throw error;
	}
}
