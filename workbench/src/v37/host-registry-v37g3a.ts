import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { RegisteredFollowUpExecutionProfileV37 } from "../contracts/v37-types.ts";
import type { HostRegistryEntryV37G3A, HostRegistryIndexV37G3A, LoadedRegisteredCaseV37G3A } from "../contracts/v37g3a-types.ts";
import { digestObject, fileSha256, stableJson } from "../hash.ts";
import { validateRegisteredCaseManifestV37, validateRegistrationEnvelopeV37 } from "./host-registry-v37.ts";

export const V37_G3A_REGISTRY_LOCATION = "workbench/config/v37/g3a/registered-cases/registry-v1.json" as const;
export const V37_G3A_CONFIGURATION_BASELINE_ID = "v37-g3a-host-registry-v1" as const;
export const V37_G3A_LOADER_CONTRACT_ID = "v37-g3a-host-registry-loader-v1" as const;
const HOST_ROOT = resolve(import.meta.dirname, "../../..");
const SHA256 = /^[a-f0-9]{64}$/;
const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;

function exact(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	const record = value as Record<string, unknown>;
	if (stableJson(Object.keys(record).sort()) !== stableJson([...keys].sort())) throw new Error(`${label} exact-key validation failed`);
	return record;
}

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function hostRoot(projectRoot: string): string {
	const owned = realpathSync.native(HOST_ROOT);
	let supplied: string;
	try { supplied = realpathSync.native(resolve(projectRoot)); } catch { throw new Error("caller projectRoot does not identify the loader-owned Host checkout"); }
	if (supplied.toLowerCase() !== owned.toLowerCase()) throw new Error("caller projectRoot cannot select an alternate Host registry baseline");
	return owned;
}

function fixedFile(root: string, location: string, label: string): string {
	if (typeof location !== "string" || isAbsolute(location) || location.includes("\0") || location.replaceAll("\\", "/").split("/").includes("..")) throw new Error(`${label} location invalid`);
	const target = resolve(root, location);
	if (!contained(root, target)) throw new Error(`${label} escapes Host root`);
	let cursor = root;
	for (const segment of relative(root, target).split(sep).filter(Boolean)) {
		cursor = resolve(cursor, segment);
		if (!existsSync(cursor)) throw new Error(`${label} is missing`);
		const stats = lstatSync(cursor);
		if (stats.isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
	}
	const stats = lstatSync(target);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`${label} must be an ordinary singly linked file`);
	if (!contained(realpathSync.native(root), realpathSync.native(target))) throw new Error(`${label} real path escapes Host root`);
	return target;
}

function readJson(root: string, location: string, label: string): unknown {
	return JSON.parse(readFileSync(fixedFile(root, location, label), "utf8"));
}

function validateEntry(value: unknown): HostRegistryEntryV37G3A {
	const entry = exact(value, ["case_id", "manifest_version", "manifest_location", "manifest_body_digest", "envelope_locations", "envelope_digests", "current_registration_digest", "follow_up_execution_profile_location", "follow_up_execution_profile_digest"], "Host registry entry");
	if (!ID.test(String(entry.case_id)) || !Number.isSafeInteger(entry.manifest_version) || Number(entry.manifest_version) < 1 || typeof entry.manifest_location !== "string" || !SHA256.test(String(entry.manifest_body_digest)) || !Array.isArray(entry.envelope_locations) || !Array.isArray(entry.envelope_digests) || entry.envelope_locations.length < 1 || entry.envelope_locations.length !== entry.envelope_digests.length || entry.envelope_locations.some((item) => typeof item !== "string") || entry.envelope_digests.some((item) => !SHA256.test(String(item))) || !SHA256.test(String(entry.current_registration_digest)) || typeof entry.follow_up_execution_profile_location !== "string" || !SHA256.test(String(entry.follow_up_execution_profile_digest))) throw new Error("Host registry entry invalid");
	return structuredClone(value) as HostRegistryEntryV37G3A;
}

export function validateHostRegistryIndexV37G3A(value: unknown): HostRegistryIndexV37G3A {
	const registry = exact(value, ["schema_version", "kind", "configuration_baseline_id", "loader_contract_id", "digest_algorithm", "entries", "registry_index_digest"], "Host registry index");
	if (registry.schema_version !== 1 || registry.kind !== "v37_host_registry_index" || registry.configuration_baseline_id !== V37_G3A_CONFIGURATION_BASELINE_ID || registry.loader_contract_id !== V37_G3A_LOADER_CONTRACT_ID || registry.digest_algorithm !== "sha256_over_canonical_utf8_json_v1" || !Array.isArray(registry.entries) || registry.entries.length < 2 || registry.entries.length > 3 || !SHA256.test(String(registry.registry_index_digest))) throw new Error("Host registry index identity invalid");
	const entries = registry.entries.map(validateEntry);
	const ids = entries.map((entry) => entry.case_id);
	if (new Set(ids).size !== ids.length || stableJson(ids) !== stableJson([...ids].sort())) throw new Error("Host registry entries must be unique canonical ascending case_id order");
	const { registry_index_digest: declared, ...body } = registry;
	if (digestObject(body) !== declared) throw new Error("Host registry index digest mismatch");
	return { ...(structuredClone(registry) as unknown as HostRegistryIndexV37G3A), entries };
}

function validateProfile(value: unknown): RegisteredFollowUpExecutionProfileV37 {
	const profile = exact(value, ["schema_version", "kind", "profile_id", "case_id", "manifest_body_digest", "parent_provider_profile_digest", "parent_tool_profile_digest", "parent_command_profile_digest", "parent_budget_profile_digest", "parent_stop_condition_profile_digest", "provider_profile", "provider_profile_digest", "tool_profile", "tool_profile_digest", "command_profile", "command_profile_digest", "budget_profile", "budget_profile_digest", "stop_condition_profile", "stop_condition_profile_digest", "follow_up_execution_profile_digest"], "follow-up execution profile");
	if (profile.schema_version !== 1 || profile.kind !== "v37_registered_follow_up_execution_profile" || !ID.test(String(profile.profile_id)) || !ID.test(String(profile.case_id))) throw new Error("follow-up execution profile identity invalid");
	for (const key of ["manifest_body_digest", "parent_provider_profile_digest", "parent_tool_profile_digest", "parent_command_profile_digest", "parent_budget_profile_digest", "parent_stop_condition_profile_digest", "provider_profile_digest", "tool_profile_digest", "command_profile_digest", "budget_profile_digest", "stop_condition_profile_digest", "follow_up_execution_profile_digest"] as const) if (!SHA256.test(String(profile[key]))) throw new Error(`follow-up execution profile ${key} invalid`);
	for (const [bodyKey, digestKey] of [["provider_profile", "provider_profile_digest"], ["tool_profile", "tool_profile_digest"], ["command_profile", "command_profile_digest"], ["budget_profile", "budget_profile_digest"], ["stop_condition_profile", "stop_condition_profile_digest"]] as const) if (digestObject(profile[bodyKey]) !== profile[digestKey]) throw new Error(`follow-up execution profile ${digestKey} mismatch`);
	const { follow_up_execution_profile_digest: declared, ...body } = profile;
	if (digestObject(body) !== declared) throw new Error("follow-up execution profile digest mismatch");
	return structuredClone(value) as RegisteredFollowUpExecutionProfileV37;
}

function loaderFingerprint(root: string): string {
	return digestObject({ loader_contract_id: V37_G3A_LOADER_CONTRACT_ID, loader_source_sha256: fileSha256(fixedFile(root, "workbench/src/v37/host-registry-v37g3a.ts", "G3A loader source")), registry_location: V37_G3A_REGISTRY_LOCATION, root_resolution: "module_owned_candidate_checkout_v1" });
}

export function deriveRegistryTrustRootDigestV37G3A(loaded: Pick<LoadedRegisteredCaseV37G3A, "manifest" | "envelopes" | "registry_entry" | "loader_contract_fingerprint" | "follow_up_execution_profile">, envelopeCount = loaded.envelopes.length): string {
	if (!Number.isSafeInteger(envelopeCount) || envelopeCount < 1 || envelopeCount > loaded.envelopes.length) throw new Error("registry trust-root envelope prefix invalid");
	const entry = loaded.registry_entry;
	const envelopes = loaded.envelopes.slice(0, envelopeCount);
	return digestObject({ configuration_baseline_id: V37_G3A_CONFIGURATION_BASELINE_ID, registry_location: V37_G3A_REGISTRY_LOCATION, loader_contract_id: V37_G3A_LOADER_CONTRACT_ID, loader_contract_fingerprint: loaded.loader_contract_fingerprint, digest_algorithm: "sha256_over_canonical_utf8_json_v1", allowed_digest_inventory: { case_id: entry.case_id, manifest_version: entry.manifest_version, manifest_location: entry.manifest_location, manifest_body_digest: loaded.manifest.manifest_body_digest, envelope_locations: entry.envelope_locations.slice(0, envelopeCount), envelope_digests: envelopes.map((item) => item.registration_digest), current_registration_digest: envelopes.at(-1)!.registration_digest, follow_up_execution_profile_location: entry.follow_up_execution_profile_location, follow_up_execution_profile_digest: loaded.follow_up_execution_profile.follow_up_execution_profile_digest } });
}

export function loadRegisteredCaseFromHostRegistryV37G3A(options: { projectRoot: string; caseId: string; allowDisabledHistorical?: boolean }): LoadedRegisteredCaseV37G3A {
	if (Object.keys(options).some((key) => !["projectRoot", "caseId", "allowDisabledHistorical"].includes(key))) throw new Error("caller registry/digest override rejected");
	if (!ID.test(options.caseId)) throw new Error("case_id invalid");
	const root = hostRoot(options.projectRoot);
	const registry = validateHostRegistryIndexV37G3A(readJson(root, V37_G3A_REGISTRY_LOCATION, "Host registry index"));
	const entry = registry.entries.find((item) => item.case_id === options.caseId);
	if (!entry) throw new Error("Case is not present in fixed Host registry");
	const manifest = validateRegisteredCaseManifestV37(readJson(root, entry.manifest_location, "Manifest Body"));
	if (manifest.case_id !== entry.case_id || manifest.manifest_version !== entry.manifest_version || manifest.manifest_body_digest !== entry.manifest_body_digest) throw new Error("registry/Manifest identity mismatch");
	const envelopes = entry.envelope_locations.map((location, index) => {
		const envelope = validateRegistrationEnvelopeV37(readJson(root, location, `Registration Envelope ${index + 1}`));
		if (envelope.registration_digest !== entry.envelope_digests[index] || envelope.case_id !== entry.case_id || envelope.manifest_version !== entry.manifest_version || envelope.approved_manifest_body_digest !== entry.manifest_body_digest || envelope.registration_revision !== index + 1 || envelope.previous_registration_digest !== (index === 0 ? null : entry.envelope_digests[index - 1])) throw new Error("Registration Envelope chain mismatch");
		return envelope;
	});
	const current = envelopes.at(-1)!;
	if (current.registration_digest !== entry.current_registration_digest) throw new Error("current Registration Envelope mismatch");
	const historical = current.registration_status === "disabled";
	if (historical && !options.allowDisabledHistorical) throw new Error("Case registration is disabled");
	const profile = validateProfile(readJson(root, entry.follow_up_execution_profile_location, "follow-up execution profile"));
	if (profile.case_id !== entry.case_id || profile.manifest_body_digest !== manifest.manifest_body_digest || profile.follow_up_execution_profile_digest !== entry.follow_up_execution_profile_digest || profile.parent_provider_profile_digest !== manifest.provider_profile_spec.spec_digest || profile.parent_tool_profile_digest !== manifest.tool_profile_spec.spec_digest || profile.parent_command_profile_digest !== manifest.command_profile_spec.spec_digest || profile.parent_budget_profile_digest !== manifest.budget_profile_spec.spec_digest || profile.parent_stop_condition_profile_digest !== manifest.stop_condition_profile_spec.spec_digest) throw new Error("follow-up execution profile parent identity mismatch");
	const partial = { manifest, envelopes, current_envelope: current, follow_up_execution_profile: profile, registry, registry_entry: entry, loader_contract_fingerprint: loaderFingerprint(root), historical_read_only: historical };
	return { ...partial, registry_trust_root_digest: deriveRegistryTrustRootDigestV37G3A(partial) };
}
