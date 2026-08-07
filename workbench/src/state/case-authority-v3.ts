import { lstatSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, parse, resolve } from "node:path";
import type { BindingContextV3, Goal3CaseAuthorityV3, Goal3ProviderProfileV3, TrustedFailureLineageV3 } from "../contracts/v3g3-types.ts";
import { writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, stableJson } from "../hash.ts";
import { GOAL3_BUDGET_PROFILE_DIGEST_V3, GOAL3_BUDGET_PROFILE_V3, GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3, GOAL3_FAUX_PROVIDER_PROFILE_V3, GOAL3_TOOL_PROFILE_ID_V3 } from "../pi/runtime-profile-v3.ts";

const CONTROLLED = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;

function authorityBody(value: Goal3CaseAuthorityV3): Omit<Goal3CaseAuthorityV3, "authority_digest"> {
	const { authority_digest: _digest, ...body } = value;
	return body;
}

function validateFailureLineage(value: TrustedFailureLineageV3 | null): void {
	if (value === null) return;
	if (stableJson(Object.keys(value).sort()) !== stableJson(["source_run_id", "failure_family", "lineage_digest"].sort()) ||
		!CONTROLLED.test(value.source_run_id) || !CONTROLLED.test(value.failure_family) ||
		value.lineage_digest !== digestObject({ source_run_id: value.source_run_id, failure_family: value.failure_family })) {
		throw new Error("Case Authority failure lineage invalid");
	}
}

function validateProviderProfile(value: Goal3ProviderProfileV3): void {
	if (stableJson(Object.keys(value).sort()) !== stableJson(["provider_kind", "provider_id", "model_id", "api", "endpoint", "thinking_level", "retry", "fallback", "profile_digest"].sort())) throw new Error("Case Authority provider profile exact-key validation failed");
	const { profile_digest: _digest, ...body } = value;
	if (!CONTROLLED.test(value.provider_id) || !CONTROLLED.test(value.model_id) || value.thinking_level !== "off" || value.retry !== false || value.fallback !== false || value.profile_digest !== digestObject(body)) throw new Error("Case Authority provider profile invalid");
}

export function buildBindingContextFromCaseAuthorityV3(authority: Goal3CaseAuthorityV3): BindingContextV3 {
	return {
		trusted_task_identity: {
			task_id: authority.task_id,
			case_id: authority.case_id,
			task_kind: authority.task_kind,
			identity_digest: digestObject({ task_id: authority.task_id, case_id: authority.case_id, task_kind: authority.task_kind }),
		},
		trusted_failure_lineage: structuredClone(authority.allowed_failure_lineage),
	};
}

export function freezeGoal3CaseAuthorityV3(options: {
	authorityRoot: string;
	projectId: string;
	taskId: string;
	caseId: string;
	taskKind: string;
	allowedFailureLineage: TrustedFailureLineageV3 | null;
	taskPromptSha256: string;
	verifierId: string;
	verifierSha256: string;
	toolProfileId: string;
	toolProfileDigest: string;
	budgetProfileId: string;
	budgetProfileDigest: string;
	providerProfile: Goal3ProviderProfileV3;
}): { authority: Goal3CaseAuthorityV3; path: string } {
	const body: Omit<Goal3CaseAuthorityV3, "authority_digest"> = {
		schema_version: 1,
		project_id: options.projectId,
		task_id: options.taskId,
		case_id: options.caseId,
		task_kind: options.taskKind,
		allowed_failure_lineage: structuredClone(options.allowedFailureLineage),
		task_prompt_sha256: options.taskPromptSha256,
		verifier_id: options.verifierId,
		verifier_sha256: options.verifierSha256,
		tool_profile_id: options.toolProfileId,
		tool_profile_digest: options.toolProfileDigest,
		budget_profile_id: options.budgetProfileId,
		budget_profile_digest: options.budgetProfileDigest,
		provider_profile: structuredClone(options.providerProfile),
	};
	const authority = { ...body, authority_digest: digestObject(body) };
	validateGoal3CaseAuthorityV3(authority);
	mkdirSync(options.authorityRoot, { recursive: true });
	writeOnceJson(options.authorityRoot, `${options.caseId}.json`, authority);
	return { authority, path: resolve(options.authorityRoot, `${options.caseId}.json`) };
}

export function validateGoal3CaseAuthorityV3(value: Goal3CaseAuthorityV3): void {
	if (stableJson(Object.keys(value).sort()) !== stableJson(["schema_version", "project_id", "task_id", "case_id", "task_kind", "allowed_failure_lineage", "task_prompt_sha256", "verifier_id", "verifier_sha256", "tool_profile_id", "tool_profile_digest", "budget_profile_id", "budget_profile_digest", "provider_profile", "authority_digest"].sort())) throw new Error("Case Authority exact-key validation failed");
	if (value.schema_version !== 1 || ![value.project_id, value.task_id, value.case_id, value.task_kind, value.verifier_id, value.tool_profile_id, value.budget_profile_id].every((entry) => CONTROLLED.test(entry)) || ![value.task_prompt_sha256, value.verifier_sha256, value.tool_profile_digest, value.budget_profile_digest, value.authority_digest].every((entry) => SHA256.test(entry))) throw new Error("Case Authority identity invalid");
	validateFailureLineage(value.allowed_failure_lineage);
	validateProviderProfile(value.provider_profile);
	if (value.tool_profile_id !== GOAL3_TOOL_PROFILE_ID_V3 || value.budget_profile_id !== GOAL3_BUDGET_PROFILE_V3.profile_id || value.budget_profile_digest !== GOAL3_BUDGET_PROFILE_DIGEST_V3 || ![GOAL3_FAUX_PROVIDER_PROFILE_V3, GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3].some((profile) => stableJson(profile) === stableJson(value.provider_profile))) throw new Error("Case Authority runtime profile is not a frozen Goal 3 profile");
	if (value.authority_digest !== digestObject(authorityBody(value))) throw new Error("Case Authority content identity mismatch");
}

export function inspectGoal3CaseAuthorityV3(options: { authorityPath: string; expectedProjectId: string }): Goal3CaseAuthorityV3 {
	const path = resolve(options.authorityPath);
	let parent = dirname(path); const root = parse(path).root;
	while (parent !== root) { const parentStats = lstatSync(parent); if (!parentStats.isDirectory() || parentStats.isSymbolicLink()) throw new Error("Case Authority path contains a symlink or junction"); parent = dirname(parent); }
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("Case Authority must be an ordinary write-once file");
	const authority = JSON.parse(readFileSync(path, "utf8")) as Goal3CaseAuthorityV3;
	validateGoal3CaseAuthorityV3(authority);
	if (authority.project_id !== options.expectedProjectId) throw new Error("Case Authority project mismatch");
	return authority;
}

export function assertContextAuthorizedByCaseV3(context: BindingContextV3, authority: Goal3CaseAuthorityV3): void {
	if (stableJson(context) !== stableJson(buildBindingContextFromCaseAuthorityV3(authority))) throw new Error("binding context is not authorized by frozen Case Authority");
}
