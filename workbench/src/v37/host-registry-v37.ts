import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type {
	CaseRegistrationEnvelopeV37,
	ContentSpecV37,
	HostRegistryIndexV37,
	LoadedRegisteredCaseV37,
	RegisteredCaseManifestBodyV37,
	StateStoreScopeSpecV37,
} from "../contracts/v37-types.ts";
import { digestObject, fileSha256, sha256, stableJson } from "../hash.ts";

export const V37_REGISTRY_LOCATION = "workbench/config/v37/registered-cases/registry-v2.json" as const;
export const V37_MANIFEST_LOCATION = "workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v2.json" as const;
export const V37_ENVELOPE_LOCATION = "workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.v2.r1.json" as const;
export const V37_CONFIGURATION_BASELINE_ID = "v37-g1-host-registry-v2" as const;
export const V37_LOADER_CONTRACT_ID = "v37-host-registry-loader-v1" as const;
const V37_HOST_PROJECT_ROOT = resolve(import.meta.dirname, "../../..");

const SHA256 = /^[a-f0-9]{64}$/;
const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
const FOLLOW_UP_TASK_BODY = "Update `src/policy.mjs` so `clampRetries` returns `0` for negative integer inputs and preserves non-negative integer inputs. Do not modify verifier files.";
const FOLLOW_UP_SOURCE_BYTES = "export function clampRetries(value) {\n  return value;\n}\n";
const FOLLOW_UP_VERIFIER_BYTES = "import assert from \"node:assert/strict\";\nimport test from \"node:test\";\nimport { clampRetries } from \"../src/policy.mjs\";\n\ntest(\"clampRetries follows the registered boundary contract\", () => {\n  assert.equal(clampRetries(-1), 0);\n  assert.equal(clampRetries(0), 0);\n  assert.equal(clampRetries(2), 2);\n});\n";
const FOLLOW_UP_VERIFIER_COMMAND = "node --test verifier/follow-up.test.mjs";

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

function fixedProjectFile(projectRoot: string, relativePath: string, label: string): string {
	if (isAbsolute(relativePath) || relativePath.replaceAll("\\", "/").split("/").includes("..") || relativePath.includes("\0")) throw new Error(`${label} must be project-relative`);
	const root = resolve(projectRoot);
	const rootStats = lstatSync(root);
	if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) throw new Error("project root must be an ordinary directory");
	const target = resolve(root, relativePath);
	if (!contained(root, target)) throw new Error(`${label} escapes project root`);
	let cursor = root;
	for (const segment of relative(root, target).split(sep).filter(Boolean)) {
		cursor = resolve(cursor, segment);
		if (!existsSync(cursor)) throw new Error(`${label} is missing`);
		if (lstatSync(cursor).isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
	}
	const stats = lstatSync(target);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`${label} must be an ordinary singly linked file`);
	if (!contained(realpathSync.native(root), realpathSync.native(target))) throw new Error(`${label} real path escapes project root`);
	return target;
}

function readJson(projectRoot: string, relativePath: string, label: string): unknown {
	return JSON.parse(readFileSync(fixedProjectFile(projectRoot, relativePath, label), "utf8"));
}

function hostProjectRoot(projectRoot: string): string {
	const owned = realpathSync.native(V37_HOST_PROJECT_ROOT);
	let supplied: string;
	try {
		supplied = realpathSync.native(resolve(projectRoot));
	} catch {
		throw new Error("caller projectRoot does not identify the loader-owned Host checkout");
	}
	if (supplied.toLowerCase() !== owned.toLowerCase()) throw new Error("caller projectRoot cannot select an alternate Host registry baseline");
	return owned;
}

function loaderContractFingerprint(projectRoot: string): string {
	return digestObject({
		loader_contract_id: V37_LOADER_CONTRACT_ID,
		loader_source_sha256: fileSha256(fixedProjectFile(projectRoot, "workbench/src/v37/host-registry-v37.ts", "Host registry loader source")),
		registry_location: V37_REGISTRY_LOCATION,
		manifest_location: V37_MANIFEST_LOCATION,
		first_envelope_location: V37_ENVELOPE_LOCATION,
		root_resolution: "module_owned_candidate_checkout_v1",
	});
}

export function deriveRegistryTrustRootDigestV37(loaded: Pick<LoadedRegisteredCaseV37, "registry" | "manifest" | "envelopes" | "loader_contract_fingerprint">, envelopeCount = loaded.envelopes.length): string {
	if (!Number.isSafeInteger(envelopeCount) || envelopeCount < 1 || envelopeCount > loaded.envelopes.length) throw new Error("registry trust-root envelope prefix invalid");
	const entry = loaded.registry.entries[0]!;
	const envelopes = loaded.envelopes.slice(0, envelopeCount);
	const trustRoot = {
		configuration_baseline_id: loaded.registry.configuration_baseline_id,
		registry_location: V37_REGISTRY_LOCATION,
		loader_contract_id: loaded.registry.loader_contract_id,
		loader_contract_fingerprint: loaded.loader_contract_fingerprint,
		digest_algorithm: loaded.registry.digest_algorithm,
		allowed_digest_inventory: {
			case_id: entry.case_id,
			manifest_version: entry.manifest_version,
			manifest_location: entry.manifest_location,
			manifest_body_digest: loaded.manifest.manifest_body_digest,
			envelope_locations: entry.envelope_locations.slice(0, envelopeCount),
			envelope_digests: envelopes.map((envelope) => envelope.registration_digest),
			current_registration_digest: envelopes.at(-1)!.registration_digest,
		},
	};
	return digestObject(trustRoot);
}

function validateSpec(value: unknown, label: string): ContentSpecV37 {
	const spec = exact(value, ["spec_id", "body", "spec_digest"], label);
	if (!ID.test(String(spec.spec_id)) || !SHA256.test(String(spec.spec_digest)) || digestObject(spec.body) !== spec.spec_digest) throw new Error(`${label} identity/digest mismatch`);
	return structuredClone(value) as ContentSpecV37;
}

function validateApplicability(value: unknown): void {
	const record = exact(value, ["task_kinds", "failure_families"], "state applicability");
	for (const key of ["task_kinds", "failure_families"] as const) {
		if (!Array.isArray(record[key]) || record[key].some((entry) => !ID.test(String(entry))) || new Set(record[key] as unknown[]).size !== record[key].length) throw new Error(`state applicability ${key} invalid`);
	}
	if ((record.task_kinds as unknown[]).length === 0) throw new Error("state applicability needs a task kind");
}

function validateCandidatePolicy(value: ContentSpecV37): void {
	const policy = exact(value.body, ["candidate_type", "max_prompt_bytes", "leakage_indicators", "generic_prompt_addendum_templates"], "Candidate policy body");
	if (policy.candidate_type !== "prompt_addendum" || !Number.isSafeInteger(policy.max_prompt_bytes) || Number(policy.max_prompt_bytes) < 1 || Number(policy.max_prompt_bytes) > 16_384) throw new Error("Candidate policy identity/content bound invalid");
	if (!Array.isArray(policy.leakage_indicators) || policy.leakage_indicators.length === 0 || policy.leakage_indicators.some((indicator) => typeof indicator !== "string" || indicator.length === 0) || new Set(policy.leakage_indicators).size !== policy.leakage_indicators.length) throw new Error("Candidate policy leakage indicators invalid");
	if (!Array.isArray(policy.generic_prompt_addendum_templates) || policy.generic_prompt_addendum_templates.length === 0 || policy.generic_prompt_addendum_templates.length > 16) throw new Error("Candidate policy generic template inventory invalid");
	const templateIds = new Set<string>();
	const contentDigests = new Set<string>();
	for (const rawTemplate of policy.generic_prompt_addendum_templates) {
		const template = exact(rawTemplate, ["template_id", "content", "content_sha256"], "Candidate generic prompt-addendum template");
		if (!ID.test(String(template.template_id)) || typeof template.content !== "string" || template.content.length === 0 || Buffer.byteLength(template.content, "utf8") > Number(policy.max_prompt_bytes) || !SHA256.test(String(template.content_sha256)) || sha256(template.content) !== template.content_sha256) throw new Error("Candidate generic prompt-addendum template identity/content invalid");
		if (templateIds.has(String(template.template_id)) || contentDigests.has(String(template.content_sha256))) throw new Error("Candidate generic prompt-addendum template inventory contains duplicates");
		templateIds.add(String(template.template_id));
		contentDigests.add(String(template.content_sha256));
	}
}

function validateStateScope(value: unknown): StateStoreScopeSpecV37 {
	const scope = exact(value, ["configured_location", "project_id", "runtime_base_prompt_digest", "initial_state_digest", "state_store_scope_digest"], "State Store scope");
	if (typeof scope.configured_location !== "string" || isAbsolute(scope.configured_location) || scope.configured_location.replaceAll("\\", "/").split("/").includes("..") || !ID.test(String(scope.project_id)) || !SHA256.test(String(scope.runtime_base_prompt_digest)) || !SHA256.test(String(scope.initial_state_digest)) || !SHA256.test(String(scope.state_store_scope_digest))) throw new Error("State Store scope identity invalid");
	const { state_store_scope_digest: declared, ...body } = scope;
	if (digestObject(body) !== declared) throw new Error("State Store scope digest mismatch");
	return structuredClone(value) as StateStoreScopeSpecV37;
}

function validateFrozenFollowUp(manifest: Record<string, unknown>): void {
	const task = exact((manifest.follow_up_task_spec as ContentSpecV37).body, ["task_id", "task_kind", "failure_family", "task_body", "task_body_sha256"], "follow-up task body");
	if (task.task_id !== "v37-g1-det-follow-up-clamp-retries" || task.task_kind !== "typescript-maintenance" || task.failure_family !== "verifier-failure" || task.task_body !== FOLLOW_UP_TASK_BODY || task.task_body_sha256 !== sha256(FOLLOW_UP_TASK_BODY)) throw new Error("follow-up task identity/bytes mismatch");
	const source = exact((manifest.follow_up_source_baseline_spec as ContentSpecV37).body, ["source_baseline_id", "source_path", "source_bytes", "source_sha256"], "follow-up source body");
	if (source.source_baseline_id !== "v37-g1-det-follow-up-source-v1" || source.source_path !== "src/policy.mjs" || source.source_bytes !== FOLLOW_UP_SOURCE_BYTES || source.source_sha256 !== sha256(FOLLOW_UP_SOURCE_BYTES)) throw new Error("follow-up source identity/bytes mismatch");
	const verifier = exact((manifest.follow_up_verifier_spec as ContentSpecV37).body, ["verifier_id", "verifier_path", "verifier_bytes", "verifier_sha256", "verifier_command", "verifier_command_sha256"], "follow-up verifier body");
	if (verifier.verifier_id !== "v37-g1-det-follow-up-verifier-v1" || verifier.verifier_path !== "verifier/follow-up.test.mjs" || verifier.verifier_bytes !== FOLLOW_UP_VERIFIER_BYTES || verifier.verifier_sha256 !== sha256(FOLLOW_UP_VERIFIER_BYTES) || verifier.verifier_command !== FOLLOW_UP_VERIFIER_COMMAND || verifier.verifier_command_sha256 !== sha256(FOLLOW_UP_VERIFIER_COMMAND)) throw new Error("follow-up verifier identity/bytes mismatch");
}

export function validateRegisteredCaseManifestV37(value: unknown): RegisteredCaseManifestBodyV37 {
	const fields = [
		"schema_version", "kind", "case_id", "manifest_version", "project_id", "source_baseline_spec", "primary_task_spec", "primary_verifier_spec", "problem_trigger_spec",
		"recovery_a_strategy_spec", "recovery_b_strategy_spec", "comparison_profile_spec", "candidate_policy_spec", "regression_pack_spec", "state_applicability", "state_store_scope_spec",
		"follow_up_task_spec", "follow_up_source_baseline_spec", "follow_up_verifier_spec", "provider_profile_spec", "tool_profile_spec", "command_profile_spec", "budget_profile_spec",
		"stop_condition_profile_spec", "runtime_base_prompt_spec", "manifest_body_digest",
	] as const;
	const manifest = exact(value, fields, "Manifest Body");
	if (manifest.schema_version !== 1 || manifest.kind !== "v37_registered_case_manifest_body" || !ID.test(String(manifest.case_id)) || !Number.isSafeInteger(manifest.manifest_version) || Number(manifest.manifest_version) < 1 || !ID.test(String(manifest.project_id)) || !SHA256.test(String(manifest.manifest_body_digest))) throw new Error("Manifest identity invalid");
	for (const field of fields.filter((field) => field.endsWith("_spec") && field !== "state_store_scope_spec")) validateSpec(manifest[field], `Manifest ${field}`);
	validateCandidatePolicy(manifest.candidate_policy_spec as ContentSpecV37);
	validateApplicability(manifest.state_applicability);
	const scope = validateStateScope(manifest.state_store_scope_spec);
	if (scope.project_id !== manifest.project_id) throw new Error("Manifest/State scope project mismatch");
	validateFrozenFollowUp(manifest);
	const runtime = validateSpec(manifest.runtime_base_prompt_spec, "Manifest runtime_base_prompt_spec");
	if (!runtime.body || typeof runtime.body !== "object" || Array.isArray(runtime.body) || typeof (runtime.body as Record<string, unknown>).prompt !== "string" || digestObject(runtime.body) !== runtime.spec_digest) throw new Error("runtime base prompt spec invalid");
	const prompt = (runtime.body as { prompt: string }).prompt;
	if (sha256(prompt) !== scope.runtime_base_prompt_digest) throw new Error("runtime base prompt/State scope digest mismatch");
	const { manifest_body_digest: declared, ...body } = manifest;
	if (digestObject(body) !== declared) throw new Error("Manifest Body digest mismatch");
	return structuredClone(value) as RegisteredCaseManifestBodyV37;
}

export function validateRegistrationEnvelopeV37(value: unknown): CaseRegistrationEnvelopeV37 {
	const envelope = exact(value, ["schema_version", "kind", "case_id", "manifest_version", "approved_manifest_body_digest", "registration_revision", "previous_registration_digest", "registration_status", "approval_record_id", "approval_policy_id", "approved_at", "disabled_at", "registration_digest"], "Registration Envelope");
	if (envelope.schema_version !== 1 || envelope.kind !== "v37_case_registration_envelope" || !ID.test(String(envelope.case_id)) || !Number.isSafeInteger(envelope.manifest_version) || !Number.isSafeInteger(envelope.registration_revision) || !SHA256.test(String(envelope.approved_manifest_body_digest)) || !(envelope.previous_registration_digest === null || SHA256.test(String(envelope.previous_registration_digest))) || !["accepted", "disabled"].includes(String(envelope.registration_status)) || !ID.test(String(envelope.approval_record_id)) || envelope.approval_policy_id !== "v37-main-reviewed-case-registration-v1" || Number.isNaN(Date.parse(String(envelope.approved_at))) || !(envelope.disabled_at === null || !Number.isNaN(Date.parse(String(envelope.disabled_at)))) || !SHA256.test(String(envelope.registration_digest))) throw new Error("Registration Envelope identity invalid");
	if ((envelope.registration_status === "accepted") !== (envelope.disabled_at === null)) throw new Error("Registration Envelope status/timestamp mismatch");
	const { registration_digest: declared, ...body } = envelope;
	if (digestObject(body) !== declared) throw new Error("Registration Envelope digest mismatch");
	return structuredClone(value) as CaseRegistrationEnvelopeV37;
}

function validateRegistry(value: unknown): HostRegistryIndexV37 {
	const registry = exact(value, ["schema_version", "kind", "configuration_baseline_id", "loader_contract_id", "digest_algorithm", "entries", "registry_index_digest"], "Host registry index");
	if (registry.schema_version !== 1 || registry.kind !== "v37_host_registry_index" || registry.configuration_baseline_id !== V37_CONFIGURATION_BASELINE_ID || registry.loader_contract_id !== V37_LOADER_CONTRACT_ID || registry.digest_algorithm !== "sha256_over_canonical_utf8_json_v1" || !SHA256.test(String(registry.registry_index_digest)) || !Array.isArray(registry.entries) || registry.entries.length !== 1) throw new Error("Host registry index identity invalid");
	const entry = exact(registry.entries[0], ["case_id", "manifest_version", "manifest_location", "manifest_body_digest", "envelope_locations", "envelope_digests", "current_registration_digest"], "Host registry entry");
	if (!ID.test(String(entry.case_id)) || !Number.isSafeInteger(entry.manifest_version) || entry.manifest_location !== V37_MANIFEST_LOCATION || !SHA256.test(String(entry.manifest_body_digest)) || !Array.isArray(entry.envelope_locations) || !Array.isArray(entry.envelope_digests) || entry.envelope_locations.length === 0 || entry.envelope_locations.length !== entry.envelope_digests.length || entry.envelope_locations[0] !== V37_ENVELOPE_LOCATION || entry.envelope_locations.some((item) => typeof item !== "string") || entry.envelope_digests.some((item) => !SHA256.test(String(item))) || !SHA256.test(String(entry.current_registration_digest))) throw new Error("Host registry entry invalid");
	const { registry_index_digest: declared, ...body } = registry;
	if (digestObject(body) !== declared) throw new Error("Host registry index digest mismatch");
	return structuredClone(value) as HostRegistryIndexV37;
}

export function loadRegisteredCaseFromHostRegistryV37(options: { projectRoot: string; caseId: string; allowDisabledHistorical?: boolean }): LoadedRegisteredCaseV37 {
	const optionKeys = Object.keys(options).sort();
	const allowedOptionKeys = new Set(["projectRoot", "caseId", "allowDisabledHistorical"]);
	if (optionKeys.some((key) => !allowedOptionKeys.has(key))) throw new Error("caller registry/digest override rejected");
	if (!ID.test(options.caseId)) throw new Error("case_id invalid");
	const projectRoot = hostProjectRoot(options.projectRoot);
	const registry = validateRegistry(readJson(projectRoot, V37_REGISTRY_LOCATION, "Host registry index"));
	const entry = registry.entries[0]!;
	if (entry.case_id !== options.caseId) throw new Error("Case is not present in fixed Host registry");
	const manifest = validateRegisteredCaseManifestV37(readJson(projectRoot, entry.manifest_location, "Manifest Body"));
	if (manifest.case_id !== entry.case_id || manifest.manifest_version !== entry.manifest_version || manifest.manifest_body_digest !== entry.manifest_body_digest) throw new Error("registry/Manifest identity mismatch");
	const envelopes: CaseRegistrationEnvelopeV37[] = [];
	for (const [index, location] of entry.envelope_locations.entries()) {
		const envelope = validateRegistrationEnvelopeV37(readJson(projectRoot, location, `Registration Envelope ${index + 1}`));
		if (envelope.registration_digest !== entry.envelope_digests[index] || envelope.case_id !== manifest.case_id || envelope.manifest_version !== manifest.manifest_version || envelope.approved_manifest_body_digest !== manifest.manifest_body_digest || envelope.registration_revision !== index + 1 || envelope.previous_registration_digest !== (index === 0 ? null : envelopes[index - 1]!.registration_digest)) throw new Error("Registration Envelope chain mismatch");
		envelopes.push(envelope);
	}
	const current = envelopes.at(-1)!;
	if (current.registration_digest !== entry.current_registration_digest) throw new Error("current Registration Envelope mismatch");
	const historicalReadOnly = current.registration_status === "disabled";
	if (historicalReadOnly && !options.allowDisabledHistorical) throw new Error("Case registration is disabled");
	const loaderFingerprint = loaderContractFingerprint(projectRoot);
	const loaded = { manifest, envelopes, current_envelope: current, registry, loader_contract_fingerprint: loaderFingerprint, registry_trust_root_digest: "", historical_read_only: historicalReadOnly };
	loaded.registry_trust_root_digest = deriveRegistryTrustRootDigestV37(loaded);
	return loaded;
}
