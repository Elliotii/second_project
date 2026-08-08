import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { formatSkillInvocation, JsonlSessionRepo, type JsonlSessionMetadata, type Session } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import type { VerifierResultV0B } from "../contracts/v0b-types.ts";
import type { DirectPiRuntimeEvidenceV3 } from "../contracts/v3g3-types.ts";
import type { Goal2ArmManifestV35, Goal2ArmV35, Goal2ComparisonV35, Goal2EfficiencyLabelV35, Goal2FirstProviderPayloadEvidenceV35, Goal2ResultLabelV35, Goal2SessionRecordV35 } from "../contracts/v35g2-types.ts";
import { artifactRef, readJsonArtifact, writeOnceBytes, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, sha256, treeDigest } from "../hash.ts";
import { createGoal3DeepSeekExecutionPortV3, type Goal3ExecutionPortV3, type Goal3RealAccessCountersV3 } from "../pi/pi-adapter-v3.ts";
import { GOAL3_BUDGET_PROFILE_V3 } from "../pi/runtime-profile-v3.ts";
import { createOneRunProviderAuthorityV1B, type OpaqueCredentialResolverV1 } from "../provider/fixed-provider-v1.ts";
import { executeGoal3RunV3 } from "../run-v3.ts";
import { readProtectedBytes } from "../pi/tool-profile.ts";
import { createTemporaryWorkspace } from "../workspace/temp-copy.ts";
import { assertFrozenGoal2CaseBytesV35, GOAL2_BASE_RUN_ID_V35, GOAL2_BASE_SESSION_ID_V35, GOAL2_CANDIDATE_RUN_ID_V35, GOAL2_CANDIDATE_SESSION_ID_V35, GOAL2_CASE_AUTHORITY_DIGEST_V35, GOAL2_CASE_ID_V35, GOAL2_COMPARISON_ID_V35, GOAL2_EFFECTIVE_TOOL_SURFACE_DIGEST_V35, GOAL2_PROJECT_ID_V35, GOAL2_TASK_POLICY_V35, GOAL2_TOOL_RESTRICTIONS_V35, GOAL2_WORKSPACE_DIGEST_V35, goal2FixturePathsV35, goal2VerifierTaskV35, materializeGoal2CaseAuthorityV35, requireFrozenInstructionV35 } from "./case-v35g2.ts";
import { freezeGoal2RunBindingV35, inspectGoal2StateSelectionV35, materializeGoal2StateSelectionV35 } from "./state-selection-v35g2.ts";
import { createGoal2FirstProviderPayloadCaptureV35, goal2PayloadFairnessDigestV35, validateGoal2FirstPayloadEvidenceV35 } from "./payload-fairness-v35g2.ts";

interface PreparedPairV35 {
	pairRoot: string;
	caseAuthorityPath: string;
	selectionAuthorityRoot: string;
	baseWorkspace: string;
	candidateWorkspace: string;
}

interface PairExecutionOptionsV35 extends PreparedPairV35 {
	projectRoot: string;
	expectedImplementationCommit: string;
	executionPortFactory: (arm: Goal2ArmV35, counters: Goal3RealAccessCountersV3) => Goal3ExecutionPortV3;
	sourceIdentityVerifier?: () => void;
}

const IDS = {
	base: { session: GOAL2_BASE_SESSION_ID_V35, run: GOAL2_BASE_RUN_ID_V35 },
	candidate: { session: GOAL2_CANDIDATE_SESSION_ID_V35, run: GOAL2_CANDIDATE_RUN_ID_V35 },
} as const;

function portable(value: string): string { return value.split(sep).join("/"); }
function withoutDigest<T extends Record<string, unknown>>(value: T, key: string): Record<string, unknown> { const copy = { ...value }; delete copy[key]; return copy; }
function armManifestPath(pairRoot: string, arm: Goal2ArmV35): string { return resolve(pairRoot, "runs", IDS[arm].run, "goal2-manifest.json"); }

function gitIdentity(projectRoot: string, expectedCommit: string): void {
	const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: projectRoot, encoding: "utf8", windowsHide: true });
	const status = spawnSync("git", ["status", "--short"], { cwd: projectRoot, encoding: "utf8", windowsHide: true });
	if (head.status !== 0 || head.stdout.trim() !== expectedCommit || status.status !== 0 || status.stdout.trim() !== "") throw new Error("Goal 2 implementation source is not the frozen clean commit");
}

function workspaceId(arm: Goal2ArmV35): string { return `v35-g2-stable-unique-${arm}-workspace-01`; }

export async function prepareGoal2PairV35(options: { projectRoot: string; pairRoot: string; historicalStateRoot: string }): Promise<PreparedPairV35> {
	assertFrozenGoal2CaseBytesV35(options.projectRoot);
	if (existsSync(options.pairRoot)) throw new Error("Goal 2 pair root already exists");
	mkdirSync(options.pairRoot, { recursive: true });
	const authorityRoot = resolve(options.pairRoot, "authority");
	mkdirSync(authorityRoot);
	const caseAuthority = materializeGoal2CaseAuthorityV35({ projectRoot: options.projectRoot, authorityRoot: resolve(authorityRoot, "case") });
	const selection = await materializeGoal2StateSelectionV35({ sourceStateRoot: options.historicalStateRoot, authorityRoot: resolve(authorityRoot, "state-selection") });
	mkdirSync(resolve(options.pairRoot, "workspaces"));
	const fixture = goal2FixturePathsV35(options.projectRoot);
	const makeWorkspace = (arm: Goal2ArmV35): string => {
		const targetRoot = resolve(options.pairRoot, "workspaces", arm);
		createTemporaryWorkspace({ projectRoot: options.projectRoot, sourceRoot: fixture.workspace, targetRoot, workspaceId: workspaceId(arm), task: { ...GOAL2_TASK_POLICY_V35, workspace_source_digest: GOAL2_WORKSPACE_DIGEST_V35 } });
		return targetRoot;
	};
	const baseWorkspace = makeWorkspace("base");
	const candidateWorkspace = makeWorkspace("candidate");
	if (treeDigest(baseWorkspace) !== GOAL2_WORKSPACE_DIGEST_V35 || treeDigest(candidateWorkspace) !== GOAL2_WORKSPACE_DIGEST_V35) throw new Error("Goal 2 arm Workspace fairness failed");
	const preflightBody = { schema_version: 1, project_id: GOAL2_PROJECT_ID_V35, case_id: GOAL2_CASE_ID_V35, case_authority_digest: caseAuthority.authority.authority_digest, state_selection_digest: selection.authority.authority_digest, initial_workspace_digest: GOAL2_WORKSPACE_DIGEST_V35, arm_order: ["base", "candidate"], session_ids: [GOAL2_BASE_SESSION_ID_V35, GOAL2_CANDIDATE_SESSION_ID_V35], run_ids: [GOAL2_BASE_RUN_ID_V35, GOAL2_CANDIDATE_RUN_ID_V35], credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0, real_cost_usd: 0 };
	writeOnceJson(options.pairRoot, "preflight.json", { ...preflightBody, preflight_digest: digestObject(preflightBody) });
	return { pairRoot: resolve(options.pairRoot), caseAuthorityPath: caseAuthority.path, selectionAuthorityRoot: resolve(authorityRoot, "state-selection"), baseWorkspace, candidateWorkspace };
}

async function createFreshSession(repo: JsonlSessionRepo, arm: Goal2ArmV35, workspaceRoot: string): Promise<Session<JsonlSessionMetadata>> {
	const id = IDS[arm].session;
	if ((await repo.list()).some((entry) => entry.id === id)) throw new Error("Goal 2 Session identity is not fresh");
	const session = await repo.create({ cwd: workspaceRoot, id, metadata: { schema_version: 1, project_id: GOAL2_PROJECT_ID_V35, workspace_id: workspaceId(arm), arm } });
	if ((await session.getEntries()).length !== 0 || (await session.buildContext()).messages.length !== 0) throw new Error("Goal 2 fresh Session contains prior context");
	return session;
}

function semanticDiffLines(initial: string, final: string): number {
	if (initial === final) return 0;
	const left = initial.split(/\r?\n/); const right = final.split(/\r?\n/); const length = Math.max(left.length, right.length);
	let changed = 0; for (let index = 0; index < length; index++) if (left[index] !== right[index]) changed++;
	return changed;
}

async function executeArm(options: PairExecutionOptionsV35 & { arm: Goal2ArmV35; repo: JsonlSessionRepo; counters: Goal3RealAccessCountersV3 }): Promise<Goal2ArmManifestV35> {
	const ids = IDS[options.arm];
	const workspaceRoot = options.arm === "base" ? options.baseWorkspace : options.candidateWorkspace;
	const runRoot = resolve(options.pairRoot, "runs", ids.run);
	if (existsSync(runRoot)) throw new Error("Goal 2 Run identity already exists");
	mkdirSync(runRoot, { recursive: true });
	const initialDigest = treeDigest(workspaceRoot);
	if (initialDigest !== GOAL2_WORKSPACE_DIGEST_V35) throw new Error("Goal 2 arm initial Workspace drift");
	const protectedBefore = digestObject(readProtectedBytes(workspaceRoot, GOAL2_TASK_POLICY_V35));
	const initialSubject = readFileSync(resolve(workspaceRoot, "src/subject.ts"), "utf8");
	const session = await createFreshSession(options.repo, options.arm, workspaceRoot);
	const metadata = await session.getMetadata();
	const frozen = await freezeGoal2RunBindingV35({ arm: options.arm, selectionAuthorityRoot: options.selectionAuthorityRoot, caseAuthorityPath: options.caseAuthorityPath, runRoot });
	const taskPrompt = requireFrozenInstructionV35(options.projectRoot);
	const skillWrapper = frozen.adaptiveSkill === null ? null : formatSkillInvocation(frozen.adaptiveSkill);
	if (skillWrapper !== null && sha256(skillWrapper) !== frozen.binding.adaptive_skill_wrapper_sha256) throw new Error("Goal 2 frozen Skill wrapper bytes drifted");
	const expectedLastUserText = skillWrapper === null ? taskPrompt : `${skillWrapper}\n\n${taskPrompt}`;
	const payloadCapture = createGoal2FirstProviderPayloadCaptureV35({ arm: options.arm, runId: ids.run, taskPrompt, expectedLastUserText, skillWrapperSha256: skillWrapper === null ? null : sha256(skillWrapper) });
	const started = Date.now();
	const result = await executeGoal3RunV3({ projectRoot: options.projectRoot, runRoot, runId: ids.run, caseId: GOAL2_CASE_ID_V35, caseAuthorityPath: options.caseAuthorityPath, workspaceRoot, taskPrompt, taskPolicy: GOAL2_TASK_POLICY_V35, verifierTask: goal2VerifierTaskV35(options.projectRoot), verifierSourcePath: goal2FixturePathsV35(options.projectRoot).verifier, frozen, executionPort: options.executionPortFactory(options.arm, options.counters), executionSession: session, toolRestrictions: GOAL2_TOOL_RESTRICTIONS_V35, beforeProviderPayload: payloadCapture.observe, verifierWorkspaceEnvironmentKey: "V35_WORKSPACE" });
	const elapsedMs = Math.max(0, Date.now() - started);
	const firstProviderPayload = payloadCapture.requireEvidence();
	if (!validateGoal2FirstPayloadEvidenceV35(firstProviderPayload)) throw new Error("Goal 2 first Provider payload evidence digest invalid");
	const firstProviderPayloadRef = writeOnceJson(runRoot, "first-provider-payload.json", firstProviderPayload);
	const runtime = readJsonArtifact<DirectPiRuntimeEvidenceV3>(runRoot, "runtime.json");
	const verifier = readJsonArtifact<VerifierResultV0B>(runRoot, "verifier/result.json");
	if (runtime.session_id !== ids.session || runtime.run_id !== ids.run || runtime.binding_digest !== frozen.binding.binding_digest || verifier.status === "invalid") throw new Error("Goal 2 arm runtime/Session/Verifier lineage invalid");
	const entries = await session.getEntries();
	if (entries.length < 2) throw new Error("Goal 2 persistent Session did not record the Run turn");
	const sessionRef = portable(relative(options.pairRoot, resolve(metadata.path)));
	const sessionRecordBody: Omit<Goal2SessionRecordV35, "record_digest"> = { schema_version: 1, project_id: GOAL2_PROJECT_ID_V35, arm: options.arm, session_id: ids.session, session_ref: sessionRef, workspace_id: workspaceId(options.arm), run_id: ids.run, run_ref: portable(relative(options.pairRoot, resolve(runRoot, "goal2-manifest.json"))), created_at: metadata.createdAt, session_entry_count_after_run: entries.length, session_entries_sha256_after_run: digestObject(entries) };
	const sessionRecord = { ...sessionRecordBody, record_digest: digestObject(sessionRecordBody) };
	const sessionRecordRef = writeOnceJson(runRoot, "session-record.json", sessionRecord);
	const protectedAfter = digestObject(readProtectedBytes(workspaceRoot, GOAL2_TASK_POLICY_V35));
	if (protectedAfter !== protectedBefore) throw new Error("Goal 2 protected Workspace bytes changed");
	const finalSubject = readFileSync(resolve(workspaceRoot, "src/subject.ts"), "utf8");
	const finalSubjectPath = writeOnceBytes(runRoot, "workspace/final-subject.ts", finalSubject);
	const runtimeRef = artifactRef(runRoot, "runtime.json", "application/json", false);
	const verifierRef = artifactRef(runRoot, "verifier/result.json", "application/json", false);
	const v3ManifestRef = artifactRef(runRoot, "manifest.json", "application/json", false);
	const bindingRef = artifactRef(runRoot, "binding.json", "application/json", false);
	const selection = await inspectGoal2StateSelectionV35({ authorityRoot: options.selectionAuthorityRoot });
	const manifestBody: Omit<Goal2ArmManifestV35, "manifest_digest"> = { schema_version: 1, project_id: GOAL2_PROJECT_ID_V35, case_id: GOAL2_CASE_ID_V35, arm: options.arm, run_id: ids.run, session_id: ids.session, workspace_id: workspaceId(options.arm), initial_workspace_digest: initialDigest, final_workspace_digest: treeDigest(workspaceRoot), protected_before_digest: protectedBefore, protected_after_digest: protectedAfter, task_prompt_sha256: result.manifest.task_prompt_sha256, state_selection_digest: selection.authority.authority_digest, binding_digest: frozen.binding.binding_digest, case_authority_digest: result.manifest.case_authority_digest, effective_tool_surface_digest: GOAL2_EFFECTIVE_TOOL_SURFACE_DIGEST_V35, v3_manifest_ref: v3ManifestRef, binding_ref: bindingRef, final_subject_ref: artifactRef(runRoot, finalSubjectPath, "text/typescript; charset=utf-8", false), runtime_ref: runtimeRef, verifier_ref: verifierRef, session_record_ref: artifactRef(runRoot, sessionRecordRef.path, "application/json", false), first_provider_payload_ref: artifactRef(runRoot, firstProviderPayloadRef.path, "application/json", false), verifier_status: verifier.status, external_verifier_runs: 1, provider_requests: runtime.provider_requests, tool_calls: runtime.tool_calls, tokens: runtime.input_tokens + runtime.output_tokens, cost_usd: runtime.cost_usd, elapsed_ms: elapsedMs, semantic_diff_lines: semanticDiffLines(initialSubject, finalSubject) };
	const manifest = { ...manifestBody, manifest_digest: digestObject(manifestBody) };
	writeOnceJson(runRoot, "goal2-manifest.json", manifest);
	return manifest;
}

function dominates(left: Goal2ArmManifestV35, right: Goal2ArmManifestV35): boolean {
	const a = [left.provider_requests, left.tool_calls, left.tokens, left.cost_usd, left.elapsed_ms, left.semantic_diff_lines];
	const b = [right.provider_requests, right.tool_calls, right.tokens, right.cost_usd, right.elapsed_ms, right.semantic_diff_lines];
	return a.every((value, index) => value <= b[index]!) && a.some((value, index) => value < b[index]!);
}

function labels(base: Goal2ArmManifestV35, candidate: Goal2ArmManifestV35): { result: Goal2ResultLabelV35; efficiency: Goal2EfficiencyLabelV35 } {
	const result: Goal2ResultLabelV35 = base.verifier_status === "failed" && candidate.verifier_status === "passed" ? "positive_skill_effect" : base.verifier_status === "passed" && candidate.verifier_status === "failed" ? "negative_skill_effect" : base.verifier_status === "passed" ? "both_passed" : "both_failed";
	const efficiency: Goal2EfficiencyLabelV35 = result !== "both_passed" ? "not_applicable" : dominates(base, candidate) ? "base_efficiency_dominant" : dominates(candidate, base) ? "candidate_efficiency_dominant" : "mixed_or_no_material_difference";
	return { result, efficiency };
}

function assertArmBudgets(manifest: Goal2ArmManifestV35): void {
	if (manifest.provider_requests < 1 || manifest.provider_requests > GOAL3_BUDGET_PROFILE_V3.provider_requests_max || manifest.tool_calls > GOAL3_BUDGET_PROFILE_V3.tool_calls_max || manifest.tokens > GOAL3_BUDGET_PROFILE_V3.token_limit || manifest.cost_usd > GOAL3_BUDGET_PROFILE_V3.cost_usd_max) throw new Error("Goal 2 arm budget invalid");
}

function payloadEvidence(pairRoot: string, manifest: Goal2ArmManifestV35): Goal2FirstProviderPayloadEvidenceV35 {
	const runRoot = resolve(pairRoot, "runs", manifest.run_id);
	return readJsonArtifact<Goal2FirstProviderPayloadEvidenceV35>(runRoot, manifest.first_provider_payload_ref.path);
}

function payloadFairnessValid(base: Goal2FirstProviderPayloadEvidenceV35, candidate: Goal2FirstProviderPayloadEvidenceV35): boolean {
	return validateGoal2FirstPayloadEvidenceV35(base)
		&& validateGoal2FirstPayloadEvidenceV35(candidate)
		&& base.normalized_payload_sha256 === candidate.normalized_payload_sha256
		&& base.normalized_messages_sha256 === candidate.normalized_messages_sha256
		&& base.system_messages_sha256 === candidate.system_messages_sha256
		&& base.tools_sha256 === candidate.tools_sha256
		&& base.model_sha256 === candidate.model_sha256
		&& base.request_fields_sha256 === candidate.request_fields_sha256
		&& base.payload_top_level_keys_sha256 === candidate.payload_top_level_keys_sha256
		&& base.treatment_marker_sha256 === candidate.treatment_marker_sha256;
}

export async function executeGoal2PairV35(options: PairExecutionOptionsV35): Promise<Goal2ComparisonV35> {
	const verifySource = options.sourceIdentityVerifier ?? (() => gitIdentity(options.projectRoot, options.expectedImplementationCommit));
	verifySource();
	assertFrozenGoal2CaseBytesV35(options.projectRoot);
	const selection = await inspectGoal2StateSelectionV35({ authorityRoot: options.selectionAuthorityRoot });
	if (treeDigest(options.baseWorkspace) !== GOAL2_WORKSPACE_DIGEST_V35 || treeDigest(options.candidateWorkspace) !== GOAL2_WORKSPACE_DIGEST_V35 || existsSync(armManifestPath(options.pairRoot, "base")) || existsSync(armManifestPath(options.pairRoot, "candidate"))) throw new Error("Goal 2 frozen pair pre-dispatch state invalid");
	const repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: options.pairRoot, shellEnv: {} }), sessionsRoot: resolve(options.pairRoot, "sessions") });
	const baseCounters: Goal3RealAccessCountersV3 = { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 };
	const candidateCounters: Goal3RealAccessCountersV3 = { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 };
	const aggregate = (): Goal3RealAccessCountersV3 => ({ credential_reads: baseCounters.credential_reads + candidateCounters.credential_reads, network_calls: baseCounters.network_calls + candidateCounters.network_calls, external_provider_calls: baseCounters.external_provider_calls + candidateCounters.external_provider_calls, real_model_calls: baseCounters.real_model_calls + candidateCounters.real_model_calls });
	writeOnceJson(options.pairRoot, "execution-start.json", { schema_version: 1, implementation_commit: options.expectedImplementationCommit, source_clean: true, case_authority_digest: GOAL2_CASE_AUTHORITY_DIGEST_V35, state_selection_digest: selection.authority.authority_digest, arm_order: ["base", "candidate"] });
	try {
		const base = await executeArm({ ...options, arm: "base", repo, counters: baseCounters });
		assertArmBudgets(base);
		verifySource();
		assertFrozenGoal2CaseBytesV35(options.projectRoot);
		const candidate = await executeArm({ ...options, arm: "candidate", repo, counters: candidateCounters });
		assertArmBudgets(candidate);
		const pairCounters = aggregate();
		if (pairCounters.credential_reads > 2 || pairCounters.real_model_calls > 32 || base.cost_usd + candidate.cost_usd > 0.40 || pairCounters.network_calls !== pairCounters.real_model_calls || pairCounters.external_provider_calls !== pairCounters.real_model_calls) throw new Error("Goal 2 pair aggregate budget invalid");
		const observed = labels(base, candidate);
		const basePayload = payloadEvidence(options.pairRoot, base);
		const candidatePayload = payloadEvidence(options.pairRoot, candidate);
		const body: Omit<Goal2ComparisonV35, "comparison_digest"> = { schema_version: 1, comparison_id: GOAL2_COMPARISON_ID_V35, project_id: GOAL2_PROJECT_ID_V35, case_id: GOAL2_CASE_ID_V35, arm_order: ["base", "candidate"], base_run_id: base.run_id, candidate_run_id: candidate.run_id, base_manifest_ref: artifactRef(options.pairRoot, portable(relative(options.pairRoot, armManifestPath(options.pairRoot, "base"))), "application/json", false), candidate_manifest_ref: artifactRef(options.pairRoot, portable(relative(options.pairRoot, armManifestPath(options.pairRoot, "candidate"))), "application/json", false), state_selection_digest: selection.authority.authority_digest, case_authority_digest: base.case_authority_digest, normalized_first_provider_payload_sha256: basePayload.normalized_payload_sha256, payload_fairness_digest: goal2PayloadFairnessDigestV35(basePayload, candidatePayload), fairness_valid: base.initial_workspace_digest === candidate.initial_workspace_digest && base.task_prompt_sha256 === candidate.task_prompt_sha256 && base.case_authority_digest === candidate.case_authority_digest && base.state_selection_digest === candidate.state_selection_digest && base.protected_before_digest === base.protected_after_digest && candidate.protected_before_digest === candidate.protected_after_digest && payloadFairnessValid(basePayload, candidatePayload), result: observed.result, efficiency: observed.efficiency };
		if (!body.fairness_valid) throw new Error("Goal 2 pair fairness invalid");
		const comparison = { ...body, comparison_digest: digestObject(body) };
		writeOnceJson(options.pairRoot, "comparison.json", comparison);
		return comparison;
	} catch (error) {
		if (!existsSync(resolve(options.pairRoot, "pause.json"))) writeOnceJson(options.pairRoot, "pause.json", { schema_version: 1, status: "invalid_pair", reason: error instanceof Error ? error.message : "unknown Goal 2 pair failure", counters: aggregate() });
		throw error;
	}
}

export async function executeGoal2RealPairV35(options: PreparedPairV35 & { projectRoot: string; expectedImplementationCommit: string; credentialResolver: OpaqueCredentialResolverV1 }): Promise<Goal2ComparisonV35> {
	return await executeGoal2PairV35({ ...options, executionPortFactory: (_arm, counters) => createGoal3DeepSeekExecutionPortV3({ authority: createOneRunProviderAuthorityV1B({ authorized: true, resolver: options.credentialResolver }), counters }) });
}

export function validateGoal2ManifestDigestV35(manifest: Goal2ArmManifestV35): boolean { return manifest.manifest_digest === digestObject(withoutDigest(manifest as unknown as Record<string, unknown>, "manifest_digest")); }
