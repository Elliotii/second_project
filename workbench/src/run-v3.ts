import { readFileSync } from "node:fs";
import type { Session, SessionMetadata } from "@earendil-works/pi-agent-core";
import type { ArtifactRefV0B, TaskSpecV0B } from "./contracts/v0b-types.ts";
import type { Goal3RunManifestV3 } from "./contracts/v3g3-types.ts";
import type { BoundedTaskPolicy } from "./types.ts";
import { artifactRef, writeOnceBytes, writeOnceJson } from "./evidence/artifacts.ts";
import { digestObject, sha256, stableJson } from "./hash.ts";
import { createGoal3FauxExecutionPortV3, executeBoundDirectPiV3, type Goal3ExecutionPortV3 } from "./pi/pi-adapter-v3.ts";
import { GOAL3_BUDGET_PROFILE_DIGEST_V3, GOAL3_BUDGET_PROFILE_V3, goal3ToolProfileDigestV3 } from "./pi/runtime-profile-v3.ts";
import type { BoundedToolRestrictions } from "./pi/tool-profile.ts";
import type { FrozenBindingResultV3 } from "./state/binding-v3.ts";
import { inspectGoal3CaseAuthorityV3 } from "./state/case-authority-v3.ts";
import { runExternalVerifierV0B } from "./verifier/runner.ts";

export async function executeGoal3RunV3(options: { projectRoot: string; runRoot: string; runId: string; caseId: string; caseAuthorityPath: string; workspaceRoot: string; taskPrompt: string; taskPolicy: BoundedTaskPolicy; verifierTask: TaskSpecV0B; verifierSourcePath: string; frozen: FrozenBindingResultV3; executionPort?: Goal3ExecutionPortV3; executionSession?: Session<SessionMetadata>; toolRestrictions?: BoundedToolRestrictions; beforeProviderPayload?: (payload: unknown) => void; verifierWorkspaceEnvironmentKey?: "V0B_WORKSPACE" | "V0C_WORKSPACE" | "V1_WORKSPACE" | "V35_WORKSPACE" }): Promise<{ manifest: Goal3RunManifestV3; manifestRef: ArtifactRefV0B }> {
	const caseAuthority = inspectGoal3CaseAuthorityV3({ authorityPath: options.caseAuthorityPath, expectedProjectId: options.frozen.binding.project_id });
	const trustedTask = options.frozen.binding.binding_context.trusted_task_identity;
	const verifierTaskPolicy: BoundedTaskPolicy = { writable_paths: options.verifierTask.writable_paths, protected_paths: options.verifierTask.protected_paths, command_descriptors: options.verifierTask.command_descriptors };
	const runtimeTaskPolicy: BoundedTaskPolicy = { writable_paths: options.taskPolicy.writable_paths, protected_paths: options.taskPolicy.protected_paths, command_descriptors: options.taskPolicy.command_descriptors };
	if (trustedTask.task_id !== options.verifierTask.task_id || trustedTask.case_id !== options.caseId || caseAuthority.authority_digest !== options.frozen.binding.case_authority_digest || caseAuthority.task_prompt_sha256 !== sha256(options.taskPrompt) || caseAuthority.verifier_id !== options.verifierTask.verifier_id || caseAuthority.verifier_sha256 !== options.verifierTask.verifier_sha256 || caseAuthority.tool_profile_id !== options.verifierTask.tool_profile_id || stableJson(runtimeTaskPolicy) !== stableJson(verifierTaskPolicy) || caseAuthority.tool_profile_digest !== goal3ToolProfileDigestV3(runtimeTaskPolicy) || caseAuthority.budget_profile_id !== GOAL3_BUDGET_PROFILE_V3.profile_id || caseAuthority.budget_profile_digest !== GOAL3_BUDGET_PROFILE_DIGEST_V3) throw new Error("frozen Case Authority does not match the Run authority plane");
	const verifierBytes = readFileSync(options.verifierSourcePath);
	if (sha256(verifierBytes) !== caseAuthority.verifier_sha256) throw new Error("Goal 3 verifier source identity mismatch before dispatch");
	const verifierPath = writeOnceBytes(options.runRoot, "verifier/source.mjs", verifierBytes);
	const verifierRef = artifactRef(options.runRoot, verifierPath, "text/javascript; charset=utf-8", false);
	if (verifierRef.sha256 !== options.verifierTask.verifier_sha256) throw new Error("Goal 3 verifier source identity mismatch");
	const executionPort = options.executionPort ?? createGoal3FauxExecutionPortV3();
	let runtime;
	try { runtime = await executeBoundDirectPiV3({ runRoot: options.runRoot, runId: options.runId, workspaceRoot: options.workspaceRoot, taskPrompt: options.taskPrompt, taskPolicy: options.taskPolicy, frozen: options.frozen, caseAuthority, executionPort, executionSession: options.executionSession, toolRestrictions: options.toolRestrictions, beforeProviderPayload: options.beforeProviderPayload }); }
	finally { await executionPort.close(); }
	const verifier = await runExternalVerifierV0B({ projectRoot: options.projectRoot, runRoot: options.runRoot, workspaceRoot: options.workspaceRoot, attemptId: `${options.runId}-attempt`, task: options.verifierTask, verifierSnapshotPath: verifierPath, verifierSnapshotRef: verifierRef, outputPath: "verifier/output.txt", workspaceEnvironmentKey: options.verifierWorkspaceEnvironmentKey });
	writeOnceJson(options.runRoot, "verifier/result.json", verifier);
	const body: Omit<Goal3RunManifestV3, "manifest_digest"> = {
		schema_version: 1,
		run_id: options.runId,
		case_id: options.caseId,
		task_id: options.verifierTask.task_id,
		task_prompt_sha256: sha256(options.taskPrompt),
		binding_ref_sha256: options.frozen.bindingRef.sha256,
		binding_digest: options.frozen.binding.binding_digest,
		case_authority_digest: caseAuthority.authority_digest,
		runtime_path: runtime.runtime_path,
		provider_kind: runtime.provider_kind,
		provider_id: runtime.provider_id,
		model_id: runtime.model_id,
		provider_profile_digest: runtime.provider_profile_digest,
		dispatch_attempts: runtime.dispatch_attempts,
		provider_dispatches: runtime.provider_dispatches,
		credential_reads: runtime.credential_reads,
		network_calls: runtime.network_calls,
		external_provider_calls: runtime.external_provider_calls,
		real_model_calls: runtime.real_model_calls,
		provider_requests: runtime.provider_requests,
		input_tokens: runtime.input_tokens,
		output_tokens: runtime.output_tokens,
		cost_usd: runtime.cost_usd,
		verifier_status: verifier.status === "passed" ? "passed" : "failed",
	};
	const manifest: Goal3RunManifestV3 = { ...body, manifest_digest: digestObject(body) };
	return { manifest, manifestRef: writeOnceJson(options.runRoot, "manifest.json", manifest) };
}
