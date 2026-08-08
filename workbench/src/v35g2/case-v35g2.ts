import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { TaskSpecV0B } from "../contracts/v0b-types.ts";
import type { TrustedFailureLineageV3 } from "../contracts/v3g3-types.ts";
import type { BoundedTaskPolicy } from "../types.ts";
import { digestObject, fileSha256, sha256, treeDigest } from "../hash.ts";
import { GOAL3_BUDGET_PROFILE_DIGEST_V3, GOAL3_BUDGET_PROFILE_V3, GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3, GOAL3_TOOL_PROFILE_ID_V3, goal3ToolProfileDigestV3 } from "../pi/runtime-profile-v3.ts";
import type { BoundedToolRestrictions } from "../pi/tool-profile.ts";
import { freezeGoal3CaseAuthorityV3 } from "../state/case-authority-v3.ts";

export const GOAL2_PROJECT_ID_V35 = "v35-g2-adaptive-skill-project";
export const GOAL2_TASK_ID_V35 = "v35-stable-unique";
export const GOAL2_CASE_ID_V35 = "v35-g2-stable-unique-case-01";
export const GOAL2_TASK_KIND_V35 = "typescript-maintenance";
export const GOAL2_FAILURE_FAMILY_V35 = "prior-pass";
export const GOAL2_FAILURE_SOURCE_RUN_ID_V35 = "v35-g2-stable-unique-reference-calibration";
export const GOAL2_WORKSPACE_DIGEST_V35 = "4a45c560541f561143fc17302576970c521febc4ae81f2f384be2708faa89922";
export const GOAL2_INSTRUCTION_SHA256_V35 = "96b1bf32248b220af6fc44021e57c314dbb57d32d37ae45505ca2ac1c9954c62";
export const GOAL2_VERIFIER_ID_V35 = "v35-stable-unique-verifier";
export const GOAL2_VERIFIER_SHA256_V35 = "470e9a49f27ebf3a14bd8d104f4e0a4a0e62a018e649352e56bfc418fa2a2fef";
export const GOAL2_REFERENCE_SHA256_V35 = "083640cc7a47940ba184f7f031379531602f7d9924a8a8c018a8b534cce2d8c4";
export const GOAL2_TOOL_PROFILE_DIGEST_V35 = "f5bae96962e5f920df282b3255bdea49b847bd5b3570aaed923770d4d2227859";
export const GOAL2_CASE_AUTHORITY_DIGEST_V35 = "43c2b1c2967826e61b236d3546f693a93424a127e25a5da9f4a0180617848fff";
export const GOAL2_SELECTED_STATE_DIGEST_V35 = "0f6c5d44c815a0d1b267d7fdf2e0c01f50eb640d06da72fe9ff8fab343249927";
export const GOAL2_SKILL_NAME_V35 = "adaptive-inefficient-success";
export const GOAL2_SKILL_SOURCE_SHA256_V35 = "152d00670b47b598cd54e4ba74a8eea580b16869e108b9027ebd3aee96f740c3";
export const GOAL2_SKILL_WRAPPER_SHA256_V35 = "329cca959c9f293d6d8e2dd56a89df14e21e069fd517633e405eb9893b675928";
export const GOAL2_BASE_SESSION_ID_V35 = "v35-g2-stable-unique-base-session-01";
export const GOAL2_BASE_RUN_ID_V35 = "v35-g2-stable-unique-base-run-01";
export const GOAL2_CANDIDATE_SESSION_ID_V35 = "v35-g2-stable-unique-candidate-session-01";
export const GOAL2_CANDIDATE_RUN_ID_V35 = "v35-g2-stable-unique-candidate-run-01";
export const GOAL2_COMPARISON_ID_V35 = "v35-g2-stable-unique-comparison-01";

export const GOAL2_TASK_POLICY_V35: BoundedTaskPolicy = {
	writable_paths: ["src/subject.ts"],
	protected_paths: ["package.json", "test/public.test.mjs"],
	command_descriptors: [{ command_id: "public_test", executable: "current_node_executable", argv: ["--test", "test/public.test.mjs"], cwd: "workspace", timeout_seconds: 15, max_combined_output_bytes: 51_200 }],
};

export const GOAL2_TOOL_RESTRICTIONS_V35: BoundedToolRestrictions = {
	allowed_tool_names: ["workspace_read", "workspace_write", "run_command"],
	readable_paths: ["src/subject.ts"],
	allow_repository_commands: false,
};
export const GOAL2_EFFECTIVE_TOOL_SURFACE_DIGEST_V35 = digestObject(GOAL2_TOOL_RESTRICTIONS_V35);

export function goal2FixturePathsV35(projectRoot: string): { root: string; workspace: string; instruction: string; verifier: string; reference: string } {
	const root = resolve(projectRoot, "fixtures/v3-5/goal2/v35-stable-unique");
	return { root, workspace: resolve(root, "workspace"), instruction: resolve(root, "instruction.txt"), verifier: resolve(root, "verifier/v35-stable-unique.mjs"), reference: resolve(root, "reference/subject.ts") };
}

export function goal2FailureLineageV35(): TrustedFailureLineageV3 {
	const body = { source_run_id: GOAL2_FAILURE_SOURCE_RUN_ID_V35, failure_family: GOAL2_FAILURE_FAMILY_V35 };
	return { ...body, lineage_digest: "3af4e1e3d58ec2e9927d71bd3f39ad88cc09d22e37ce5f0049ae46fe080aac40" };
}

export function assertFrozenGoal2CaseBytesV35(projectRoot: string): void {
	const paths = goal2FixturePathsV35(projectRoot);
	if (treeDigest(paths.workspace) !== GOAL2_WORKSPACE_DIGEST_V35 || fileSha256(paths.instruction) !== GOAL2_INSTRUCTION_SHA256_V35 || fileSha256(paths.verifier) !== GOAL2_VERIFIER_SHA256_V35 || fileSha256(paths.reference) !== GOAL2_REFERENCE_SHA256_V35) throw new Error("Goal 2 frozen fixture identity mismatch");
	if (goal3ToolProfileDigestV3(GOAL2_TASK_POLICY_V35) !== GOAL2_TOOL_PROFILE_DIGEST_V35 || GOAL3_BUDGET_PROFILE_DIGEST_V3 !== "6b20b55e7930b193b7975c15668bba883961c9d3976e9d200b45cfd69d96be21" || GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.profile_digest !== "6b90b83a047ce7745fc92a6f1ef99dd7f7ea6e046a5107e060f4b041e864cf32") throw new Error("Goal 2 frozen runtime profile identity mismatch");
}

export function goal2VerifierTaskV35(projectRoot: string): TaskSpecV0B {
	assertFrozenGoal2CaseBytesV35(projectRoot);
	return { schema_version: 1, task_id: GOAL2_TASK_ID_V35, instruction_ref: "fixtures/v3-5/goal2/v35-stable-unique/instruction.txt", instruction_sha256: GOAL2_INSTRUCTION_SHA256_V35, workspace_source_ref: "fixtures/v3-5/goal2/v35-stable-unique/workspace", workspace_source_digest: GOAL2_WORKSPACE_DIGEST_V35, writable_paths: [...GOAL2_TASK_POLICY_V35.writable_paths], protected_paths: [...GOAL2_TASK_POLICY_V35.protected_paths], verifier_id: GOAL2_VERIFIER_ID_V35, verifier_ref: "fixtures/v3-5/goal2/v35-stable-unique/verifier/v35-stable-unique.mjs", verifier_sha256: GOAL2_VERIFIER_SHA256_V35, acceptance_visibility: "hidden_external", tool_profile_id: GOAL3_TOOL_PROFILE_ID_V3, command_descriptors: structuredClone(GOAL2_TASK_POLICY_V35.command_descriptors), verifier_command: { executable: "current_node_executable", argv: [], cwd: "project", timeout_ms: 30_000, output_limit_bytes: 51_200 } };
}

export function materializeGoal2CaseAuthorityV35(options: { projectRoot: string; authorityRoot: string }): ReturnType<typeof freezeGoal3CaseAuthorityV3> {
	assertFrozenGoal2CaseBytesV35(options.projectRoot);
	const taskPrompt = requireFrozenInstructionV35(options.projectRoot);
	const frozen = freezeGoal3CaseAuthorityV3({ authorityRoot: options.authorityRoot, projectId: GOAL2_PROJECT_ID_V35, taskId: GOAL2_TASK_ID_V35, caseId: GOAL2_CASE_ID_V35, taskKind: GOAL2_TASK_KIND_V35, allowedFailureLineage: goal2FailureLineageV35(), taskPromptSha256: sha256(taskPrompt), verifierId: GOAL2_VERIFIER_ID_V35, verifierSha256: GOAL2_VERIFIER_SHA256_V35, toolProfileId: GOAL3_TOOL_PROFILE_ID_V3, toolProfileDigest: GOAL2_TOOL_PROFILE_DIGEST_V35, budgetProfileId: GOAL3_BUDGET_PROFILE_V3.profile_id, budgetProfileDigest: GOAL3_BUDGET_PROFILE_DIGEST_V3, providerProfile: GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3 });
	if (frozen.authority.authority_digest !== GOAL2_CASE_AUTHORITY_DIGEST_V35) throw new Error("Goal 2 frozen Case Authority digest mismatch");
	return frozen;
}

export function requireFrozenInstructionV35(projectRoot: string): string {
	const path = goal2FixturePathsV35(projectRoot).instruction;
	if (fileSha256(path) !== GOAL2_INSTRUCTION_SHA256_V35) throw new Error("Goal 2 instruction identity mismatch");
	return readFileSync(path, "utf8");
}
