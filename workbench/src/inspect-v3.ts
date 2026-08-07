import { lstatSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { VerifierResultV0B } from "./contracts/v0b-types.ts";
import type { DirectPiRuntimeEvidenceV3, Goal3RunManifestV3 } from "./contracts/v3g3-types.ts";
import { artifactRef, readJsonArtifact, resolveRunRelative, validateArtifactRef } from "./evidence/artifacts.ts";
import { digestObject, stableJson } from "./hash.ts";
import { GOAL3_BUDGET_PROFILE_V3 } from "./pi/runtime-profile-v3.ts";
import { inspectRunBindingV3 } from "./state/binding-v3.ts";

const SHA256 = /^[a-f0-9]{64}$/;

function exactKeys(value: unknown, expected: readonly string[], label: string): void {
	if (!value || typeof value !== "object" || Array.isArray(value) || stableJson(Object.keys(value).sort()) !== stableJson([...expected].sort())) throw new Error(`${label} exact-key validation failed`);
}

function withoutDigest<T extends Record<string, unknown>>(value: T, key: keyof T): Omit<T, keyof T> & Record<string, unknown> {
	const copy = { ...value }; delete copy[key]; return copy;
}

function ordinaryJson<T>(path: string): T {
	const stats = lstatSync(path); if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("inspection artifact must be an ordinary file");
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

function deepSeekAccountingValid(runtime: DirectPiRuntimeEvidenceV3): boolean {
	if (runtime.provider_kind !== "deepseek_real") return true;
	return runtime.credential_reads === 1 &&
		runtime.provider_requests >= 1 && runtime.provider_requests <= GOAL3_BUDGET_PROFILE_V3.provider_requests_max &&
		runtime.provider_dispatches === runtime.provider_requests &&
		runtime.network_calls === runtime.provider_requests &&
		runtime.external_provider_calls === runtime.provider_requests &&
		runtime.real_model_calls === runtime.provider_requests &&
		runtime.input_tokens + runtime.output_tokens <= GOAL3_BUDGET_PROFILE_V3.token_limit &&
		runtime.cost_usd <= GOAL3_BUDGET_PROFILE_V3.cost_usd_max &&
		runtime.tool_calls <= GOAL3_BUDGET_PROFILE_V3.tool_calls_max;
}

export async function inspectGoal3RunV3(options: { projectRoot: string; stateRoot: string; admissionRegistryRoot: string; caseAuthorityPath: string; runRoot: string; expectedProjectId: string; immutableBasePrompt: string; immutableBasePromptSha256: string }): Promise<{ integrity_valid: boolean; errors: string[]; manifest: Goal3RunManifestV3 | null; pointer_drift_observed: boolean }> {
	const errors: string[] = []; let manifest: Goal3RunManifestV3 | null = null; let pointerDrift = false;
	try {
		const bindingInspection = await inspectRunBindingV3(options);
		if (!bindingInspection.integrity_valid || !bindingInspection.binding || !bindingInspection.case_authority) throw new Error(`binding inspection failed: ${bindingInspection.errors.join("; ")}`);
		const caseAuthority = bindingInspection.case_authority;
		pointerDrift = bindingInspection.current_active !== null && stableJson(bindingInspection.current_active) !== stableJson({ binding_revision: bindingInspection.binding.active_binding_revision, state_version: bindingInspection.binding.active_state_version, state_digest: bindingInspection.binding.active_state_digest });
		manifest = ordinaryJson<Goal3RunManifestV3>(resolve(options.runRoot, "manifest.json"));
		exactKeys(manifest, ["schema_version", "run_id", "case_id", "task_id", "task_prompt_sha256", "binding_ref_sha256", "binding_digest", "case_authority_digest", "runtime_path", "provider_kind", "provider_id", "model_id", "provider_profile_digest", "dispatch_attempts", "provider_dispatches", "credential_reads", "network_calls", "external_provider_calls", "real_model_calls", "provider_requests", "input_tokens", "output_tokens", "cost_usd", "verifier_status", "manifest_digest"], "Goal 3 Manifest");
		if (manifest.manifest_digest !== digestObject(withoutDigest(manifest as unknown as Record<string, unknown>, "manifest_digest"))) throw new Error("Goal 3 Manifest identity mismatch");
		const runtime = ordinaryJson<DirectPiRuntimeEvidenceV3>(resolve(options.runRoot, "runtime.json"));
		exactKeys(runtime, ["schema_version", "run_id", "binding_digest", "case_authority_digest", "runtime_path", "session_id", "settled_events", "provider_kind", "provider_id", "model_id", "provider_profile_digest", "dispatch_attempts", "provider_dispatches", "credential_reads", "network_calls", "external_provider_calls", "real_model_calls", "provider_requests", "input_tokens", "output_tokens", "cost_usd", "tool_calls", "tool_profile_digest", "task_prompt_sha256", "observed_system_prompt_sha256", "observed_user_message_sha256", "observed_skill_wrapper_sha256", "model_payload_sha256", "runtime_digest"], "Direct Pi runtime evidence");
		if (runtime.runtime_digest !== digestObject(withoutDigest(runtime as unknown as Record<string, unknown>, "runtime_digest"))) throw new Error("Direct Pi runtime identity mismatch");
		const bindingRef = artifactRef(options.runRoot, "binding.json", "application/json", false);
		if (manifest.binding_ref_sha256 !== bindingRef.sha256 || manifest.binding_digest !== bindingInspection.binding.binding_digest || runtime.binding_digest !== bindingInspection.binding.binding_digest || manifest.case_authority_digest !== caseAuthority.authority_digest || runtime.case_authority_digest !== caseAuthority.authority_digest) throw new Error("Manifest/runtime/binding/Case Authority lineage mismatch");
		const expectedPath = bindingInspection.binding.adaptive_skill_name !== null ? "adaptive_skill" : bindingInspection.binding.bound_entries.some((entry) => entry.kind === "prompt_addendum") ? "prompt_addendum" : "unbound_prompt";
		const counters = ["dispatch_attempts", "provider_dispatches", "credential_reads", "network_calls", "external_provider_calls", "real_model_calls", "provider_requests", "input_tokens", "output_tokens"] as const;
		if (counters.some((key) => !Number.isSafeInteger(runtime[key]) || runtime[key] < 0 || manifest![key] !== runtime[key]) || !Number.isSafeInteger(runtime.tool_calls) || runtime.tool_calls < 0 || !Number.isFinite(runtime.cost_usd) || runtime.cost_usd < 0 || manifest.cost_usd !== runtime.cost_usd) throw new Error("Direct Pi usage/cost counter mismatch");
		if (manifest.schema_version !== 1 || runtime.schema_version !== 1 || manifest.run_id !== runtime.run_id || manifest.case_id !== caseAuthority.case_id || manifest.task_id !== caseAuthority.task_id || manifest.task_prompt_sha256 !== runtime.task_prompt_sha256 || manifest.task_prompt_sha256 !== caseAuthority.task_prompt_sha256 || !SHA256.test(manifest.task_prompt_sha256) || manifest.runtime_path !== expectedPath || runtime.runtime_path !== expectedPath || runtime.observed_system_prompt_sha256 !== bindingInspection.binding.composed_prompt_sha256 || runtime.observed_skill_wrapper_sha256 !== bindingInspection.binding.adaptive_skill_wrapper_sha256 || runtime.settled_events !== 1 || runtime.tool_profile_digest !== caseAuthority.tool_profile_digest || manifest.provider_kind !== runtime.provider_kind || manifest.provider_id !== runtime.provider_id || manifest.model_id !== runtime.model_id || manifest.provider_profile_digest !== runtime.provider_profile_digest || runtime.provider_kind !== caseAuthority.provider_profile.provider_kind || runtime.provider_id !== caseAuthority.provider_profile.provider_id || runtime.model_id !== caseAuthority.provider_profile.model_id || runtime.provider_profile_digest !== caseAuthority.provider_profile.profile_digest || runtime.dispatch_attempts !== 1 || runtime.provider_dispatches !== runtime.provider_requests || !deepSeekAccountingValid(runtime) || (runtime.provider_kind === "faux" && (runtime.credential_reads !== 0 || runtime.network_calls !== 0 || runtime.external_provider_calls !== 0 || runtime.real_model_calls !== 0 || runtime.provider_requests !== 1 || runtime.cost_usd !== 0)) || !SHA256.test(runtime.observed_user_message_sha256) || !SHA256.test(runtime.model_payload_sha256)) throw new Error("Direct Pi treatment/runtime identity mismatch");
		const verifierSource = artifactRef(options.runRoot, "verifier/source.mjs", "text/javascript; charset=utf-8", false);
		if (verifierSource.sha256 !== caseAuthority.verifier_sha256) throw new Error("frozen Verifier source identity mismatch");
		const verifierRef = artifactRef(options.runRoot, "verifier/result.json", "application/json", false);
		if (validateArtifactRef(options.runRoot, verifierRef).length !== 0) throw new Error("Verifier result Artifact invalid");
		const verifier = readJsonArtifact<VerifierResultV0B>(options.runRoot, verifierRef.path);
		if (validateArtifactRef(options.runRoot, verifier.full_output_ref).length !== 0) throw new Error("raw Verifier authority mismatch");
		const rawLines = readFileSync(resolveRunRelative(options.runRoot, verifier.full_output_ref.path), "utf8").split(/\r?\n/).filter((line) => line.startsWith("[stdout] "));
		const raw = JSON.parse(rawLines.at(-1)?.slice("[stdout] ".length) ?? "null") as { schema_version?: unknown; verifier_id?: unknown; status?: unknown } | null;
		if (!raw || raw.schema_version !== 1 || raw.verifier_id !== verifier.verifier_id || raw.verifier_id !== caseAuthority.verifier_id || raw.status !== verifier.status || verifier.status !== manifest.verifier_status || verifier.full_output_sha256 !== verifier.full_output_ref.sha256) throw new Error("raw Verifier authority mismatch");
	} catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
	return { integrity_valid: errors.length === 0, errors, manifest, pointer_drift_observed: pointerDrift };
}
