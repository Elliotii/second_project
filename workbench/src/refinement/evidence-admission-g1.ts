import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, readdirSync } from "node:fs";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import type { ArtifactRefV0B, FailureClassV0B } from "../contracts/v0b-types.ts";
import type {
	TrustedEvidenceAdmissionRecordG1,
	TrustedEvidenceAdmissionResultG1,
	TrustedEvidenceHostApprovalG1,
	TrustedEvidenceHostRegistrationG1,
	TrustedEvidenceSourceG1,
	TrustedEvidenceSourceInventoryItemG1,
} from "../contracts/final-capstone-g1-types.ts";
import type { FrozenEvidenceV3 } from "../contracts/v3-types.ts";
import type { FrozenRunBindingV3, DirectPiRuntimeEvidenceV3 } from "../contracts/v3g3-types.ts";
import { artifactRef, readJsonArtifact, validateArtifactRef, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, fileSha256, sha256, stableJson } from "../hash.ts";
import { inspectRunV0B } from "../inspect-v0b.ts";
import { inspectRunV0C } from "../inspect-v0c.ts";
import { inspectRunV2A } from "../inspect-v2.ts";
import { inspectGoal3RunV3 } from "../inspect-v3.ts";
import { projectImprovementOpportunityV3, validateFrozenEvidenceV3 } from "./evidence-v3.ts";

const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const POLICY_ID = "final-capstone-g1-trusted-evidence-admission-v1" as const;
const FIXED_HOST_APPROVALS_G1 = Object.freeze({
	"final-capstone-g1-project/g1-host-v0-pass": Object.freeze({ approval_id: "fixed-approval-g1-host-v0-pass", registration_digest: "bb20f847ebace33b73d9f5fe51bbf5055f6b92cbd23c03a8a6dcd8b118383156" }),
	"final-capstone-g1-project/g1-host-v0-fail": Object.freeze({ approval_id: "fixed-approval-g1-host-v0-fail", registration_digest: "ce813c062e3905e805fa860e6ddcbd7a6c9a20222ee0e7806363c69673606ce1" }),
	"final-capstone-g1-project/g1-host-v2": Object.freeze({ approval_id: "fixed-approval-g1-host-v2", registration_digest: "45cb66f63a9f1e4fb5203e33f92606d702405b495afad9c48cf08fb43e73b557" }),
	"final-capstone-g1-v3-project/g1-host-v3": Object.freeze({ approval_id: "fixed-approval-g1-host-v3", registration_digest: "fbf18fdd320e4c076024cf2366c6b49a1e479d69e7cd9fabfd8b079937d480c5" }),
	"final-capstone-g1-v3-project/g1-host-v3-negative": Object.freeze({ approval_id: "fixed-approval-g1-host-v3-negative", registration_digest: "365dc532234a44c4d9b0cabc9e39c2e94989989f5b4ead7a2b7b230a753b9ff8" }),
	"final-capstone-g1-project/g1-host-v0-pass-immutability": Object.freeze({ approval_id: "fixed-approval-g1-host-v0-pass-immutability", registration_digest: "acd7652e90fbf1837976a8a9e98b9b7487c4598aeb9dac85d74ae56a1d404f99" }),
} as const);

type Derivation = {
	sourceRunIds: string[];
	status: "passed" | "failed";
	verifierStatus: "passed" | "failed";
	attribution: FrozenEvidenceV3["validity"]["attribution"];
	usage?: FrozenEvidenceV3["usage"];
	provenance: Record<string, unknown>;
};

function object(value: unknown, label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value as Record<string, unknown>;
}

function exact(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
	const record = object(value, label);
	if (stableJson(Object.keys(record).sort()) !== stableJson([...keys].sort())) throw new Error(`${label} exact-key validation failed`);
	return record;
}

function portable(path: string): string {
	return path.split(sep).join("/");
}

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function safeProjectPath(projectRoot: string, path: string, label: string): string {
	if (typeof path !== "string" || path.length === 0 || path.includes("\0") || isAbsolute(path) || path.replaceAll("\\", "/").split("/").includes("..") || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(path)) {
		throw new Error(`${label} must be project-relative`);
	}
	const root = resolve(projectRoot);
	const target = resolve(root, path);
	if (!contained(root, target)) throw new Error(`${label} escapes project root`);
	let current = root;
	for (const segment of relative(root, target).split(sep).filter(Boolean)) {
		current = resolve(current, segment);
		if (!existsSync(current)) break;
		const stats = lstatSync(current);
		if (stats.isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
	}
	if (!existsSync(target)) throw new Error(`${label} is missing`);
	const realRoot = realpathSync.native(root);
	const realTarget = realpathSync.native(target);
	if (!contained(realRoot, realTarget)) throw new Error(`${label} real path escapes project root`);
	return target;
}

function mediaType(path: string): string {
	switch (extname(path).toLowerCase()) {
		case ".json": return "application/json";
		case ".jsonl": return "application/x-ndjson";
		case ".md": return "text/markdown; charset=utf-8";
		case ".mjs": case ".js": return "text/javascript; charset=utf-8";
		case ".ts": return "text/typescript; charset=utf-8";
		default: return "application/octet-stream";
	}
}

function inventoryTree(anchor: string, treeRoot: string, role: TrustedEvidenceSourceInventoryItemG1["source_role"]): TrustedEvidenceSourceInventoryItemG1[] {
	const results: TrustedEvidenceSourceInventoryItemG1[] = [];
	const visit = (directory: string): void => {
		for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
			const path = resolve(directory, entry.name);
			const stats = lstatSync(path);
			if (stats.isSymbolicLink()) throw new Error(`source inventory contains a symlink or junction: ${portable(relative(anchor, path))}`);
			if (stats.isDirectory()) { visit(path); continue; }
			if (!stats.isFile()) throw new Error(`source inventory contains unsupported file kind: ${portable(relative(anchor, path))}`);
			if (stats.nlink !== 1) throw new Error(`source inventory contains prohibited hardlink: ${portable(relative(anchor, path))}`);
			const ref = artifactRef(anchor, path, mediaType(path), false);
			results.push({ ...ref, source_role: role });
		}
	};
	const stats = lstatSync(treeRoot);
	if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error("source inventory root must be an ordinary directory");
	visit(treeRoot);
	return results;
}

function inventoryFile(anchor: string, path: string, role: TrustedEvidenceSourceInventoryItemG1["source_role"]): TrustedEvidenceSourceInventoryItemG1 {
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("source inventory file must be ordinary, link-free, and singly linked");
	return { ...artifactRef(anchor, path, mediaType(path), false), source_role: role };
}

function uniqueInventory(items: TrustedEvidenceSourceInventoryItemG1[]): TrustedEvidenceSourceInventoryItemG1[] {
	const sorted = [...items].sort((a, b) => a.path.localeCompare(b.path));
	for (let index = 1; index < sorted.length; index += 1) if (sorted[index - 1]!.path === sorted[index]!.path) throw new Error(`source inventory role overlap: ${sorted[index]!.path}`);
	if (sorted.length === 0) throw new Error("source inventory must be non-empty");
	return sorted;
}

function sourceFamilyKeys(source: Record<string, unknown>): readonly string[] {
	switch (source.family) {
		case "verifier_backed": return ["family", "generation", "source_project_root", "run_id"];
		case "v2a_recovery_comparison": return ["family", "run_root"];
		case "v3g3_bound_state_followup": return ["family", "bundle_root", "run_root", "state_root", "candidate_admission_registry_root", "case_authority_path", "immutable_base_prompt", "immutable_base_prompt_sha256"];
		default: throw new Error("unknown source family");
	}
}

export function validateHostRegistrationG1(value: unknown, expectedProjectId: string): TrustedEvidenceHostRegistrationG1 {
	const record = exact(value, ["schema_version", "registration_id", "project_id", "source", "trusted_task_context", "expected_inspector", "registration_digest"], "Host registration");
	if (record.schema_version !== 1 || !ID.test(String(record.registration_id)) || !ID.test(String(record.project_id)) || record.project_id !== expectedProjectId) throw new Error("Host registration project/identity mismatch");
	const source = object(record.source, "source"); exact(source, sourceFamilyKeys(source), "source");
	if (source.family === "verifier_backed" && !["v0b", "v0c"].includes(String(source.generation))) throw new Error("unknown verifier-backed generation");
	const context = exact(record.trusted_task_context, ["task_kind", "failure_family"], "trusted task context");
	if (!ID.test(String(context.task_kind)) || !(context.failure_family === null || ID.test(String(context.failure_family)))) throw new Error("invalid trusted task context");
	const inspector = exact(record.expected_inspector, ["inspector_id", "inspector_fingerprint"], "expected Inspector");
	if (!ID.test(String(inspector.inspector_id)) || !SHA256.test(String(inspector.inspector_fingerprint))) throw new Error("expected Inspector identity is invalid");
	if (!SHA256.test(String(record.registration_digest))) throw new Error("Host registration digest is invalid");
	const { registration_digest: declared, ...body } = record;
	if (digestObject(body) !== declared) throw new Error("Host registration digest mismatch");
	return structuredClone(record) as unknown as TrustedEvidenceHostRegistrationG1;
}

function fixedHostApprovalG1(registration: TrustedEvidenceHostRegistrationG1): TrustedEvidenceHostApprovalG1 {
	const key = `${registration.project_id}/${registration.registration_id}` as keyof typeof FIXED_HOST_APPROVALS_G1;
	const approved = FIXED_HOST_APPROVALS_G1[key];
	if (!approved || approved.registration_digest !== registration.registration_digest) throw new Error("Host-owned approval root does not approve this registration identity/digest");
	return {
		schema_version: 1,
		approval_id: approved.approval_id,
		project_id: registration.project_id,
		approved_registration_id: registration.registration_id,
		approved_registration_digest: registration.registration_digest,
		authority: "host_fixed_approval",
		adaptation_eligible: true,
		policy_id: POLICY_ID,
	};
}

function inspectorFiles(source: TrustedEvidenceSourceG1): { id: string; paths: string[] } {
	if (source.family === "verifier_backed") return source.generation === "v0b"
		? { id: "inspect-run-v0b", paths: ["workbench/src/inspect-v0b.ts"] }
		: { id: "inspect-run-v0c", paths: ["workbench/src/inspect-v0c.ts"] };
	if (source.family === "v2a_recovery_comparison") return { id: "inspect-run-v2a", paths: ["workbench/src/inspect-v2.ts"] };
	return { id: "inspect-goal3-run-v3-binding-v3", paths: ["workbench/src/inspect-v3.ts", "workbench/src/state/binding-v3.ts"] };
}

export function inspectorIdentityG1(projectRoot: string, source: TrustedEvidenceSourceG1): { inspector_id: string; inspector_fingerprint: string } {
	const spec = inspectorFiles(source);
	const files = spec.paths.map((path) => ({ path, sha256: fileSha256(safeProjectPath(projectRoot, path, "Inspector source")) }));
	return { inspector_id: spec.id, inspector_fingerprint: digestObject(files) };
}

function attribution(failureClass: FailureClassV0B): FrozenEvidenceV3["validity"]["attribution"] {
	if (failureClass === null) return "none";
	if (failureClass === "budget") return "infrastructure";
	return failureClass;
}

async function verifierDerivation(projectRoot: string, source: Extract<TrustedEvidenceSourceG1, { family: "verifier_backed" }>): Promise<{ anchor: string; inventory: TrustedEvidenceSourceInventoryItemG1[]; derivation: Derivation }> {
	const anchor = safeProjectPath(projectRoot, source.source_project_root, "source project root");
	if (!ID.test(source.run_id)) throw new Error("source Run ID is invalid");
	const runRoot = safeProjectPath(anchor, `.runs/${source.generation === "v0b" ? "v0-b" : "v0-c"}/runs/${source.run_id}`, "source Run root");
	if (source.generation === "v0b") {
		const inspected = await inspectRunV0B(anchor, source.run_id);
		if (!inspected.integrity_valid || !inspected.committed || !["passed", "failed"].includes(String(inspected.status)) || !inspected.verifier || !["passed", "failed"].includes(inspected.verifier.status)) throw new Error(`verifier-backed V0-B source rejected: ${inspected.errors.join("; ") || "nonterminal or invalid Verifier"}`);
		return { anchor, inventory: inventoryTree(anchor, runRoot, "run_artifact"), derivation: { sourceRunIds: [source.run_id], status: inspected.status as "passed" | "failed", verifierStatus: inspected.verifier.status as "passed" | "failed", attribution: attribution(inspected.failure_class), provenance: { generation: "v0b", committed: true, terminal: { status: inspected.status, reason: inspected.terminal_reason }, outcome: { status: inspected.status, failure_class: inspected.failure_class }, verifier: inspected.verifier, identity: inspected.identity } } };
	}
	const inspected = await inspectRunV0C(anchor, source.run_id);
	const verifierStatus = inspected.attempts.at(-1)?.verifier_status;
	if (!inspected.integrity_valid || !inspected.committed || !["passed", "failed"].includes(String(inspected.status)) || !["passed", "failed"].includes(String(verifierStatus))) throw new Error(`verifier-backed V0-C source rejected: ${inspected.errors.join("; ") || "nonterminal or invalid Verifier"}`);
	return { anchor, inventory: inventoryTree(anchor, runRoot, "run_artifact"), derivation: { sourceRunIds: [source.run_id], status: inspected.status as "passed" | "failed", verifierStatus: verifierStatus as "passed" | "failed", attribution: attribution(inspected.failure_class), provenance: { generation: "v0c", committed: true, terminal: { status: inspected.status, reason: inspected.terminal_reason }, outcome: { status: inspected.status, failure_class: inspected.failure_class }, verifier: { status: verifierStatus }, attempts: inspected.attempts, recovery: inspected.recovery } } };
}

function v2Derivation(projectRoot: string, source: Extract<TrustedEvidenceSourceG1, { family: "v2a_recovery_comparison" }>): { anchor: string; inventory: TrustedEvidenceSourceInventoryItemG1[]; derivation: Derivation } {
	const runRoot = safeProjectPath(projectRoot, source.run_root, "V2 Run root");
	const inspected = inspectRunV2A({ projectRoot, runRoot });
	if (!inspected.integrity_valid || !inspected.terminal_valid || !inspected.terminal || inspected.terminal.outcome !== "recovery_selected" || !inspected.recovery_seed || inspected.candidates.length !== 2 || !inspected.selection?.selected_candidate_id) throw new Error(`V2 Recovery/Comparison source rejected: ${inspected.errors.join("; ") || "incomplete recovery selection"}`);
	const selected = inspected.candidates.find((candidate) => candidate.candidate_path_id === inspected.selection!.selected_candidate_id);
	const peer = inspected.candidates.find((candidate) => candidate.candidate_path_id !== inspected.selection!.selected_candidate_id);
	if (!selected || !peer || selected.verifier_status !== "passed" || peer.verifier_status !== "passed" || selected.common_artifact_digest !== peer.common_artifact_digest) throw new Error("V2 comparison requires two common-Verifier passing arms");
	return { anchor: runRoot, inventory: inventoryTree(runRoot, runRoot, "run_artifact"), derivation: { sourceRunIds: [inspected.terminal.run_id], status: "passed", verifierStatus: "passed", attribution: "none", usage: { provider_calls: selected.budget_usage.faux_provider_dispatches, tool_calls: selected.budget_usage.tool_calls }, provenance: { terminal: inspected.terminal, outcome: { status: "passed", attribution: "none" }, verifier: { common: true, selected_status: selected.verifier_status, peer_status: peer.verifier_status }, recovery_group_id: inspected.recovery_seed.recovery_group_id, recovery_seed_id: inspected.recovery_seed.recovery_seed_id, common_artifact_digest: selected.common_artifact_digest, candidate_paths: inspected.candidates.map((candidate) => ({ candidate_path_id: candidate.candidate_path_id, strategy_id: candidate.strategy_id, verifier_status: candidate.verifier_status, evidence_valid: candidate.evidence_valid, hard_gates: candidate.hard_gates, budget_usage: candidate.budget_usage, common_artifact_digest: candidate.common_artifact_digest })), selection: inspected.selection, frozen_evidence_comparison: "omitted_candidate_paths_are_not_peer_runs" } } };
}

async function v3Derivation(projectRoot: string, expectedProjectId: string, source: Extract<TrustedEvidenceSourceG1, { family: "v3g3_bound_state_followup" }>, taskContext: TrustedEvidenceHostRegistrationG1["trusted_task_context"]): Promise<{ anchor: string; inventory: TrustedEvidenceSourceInventoryItemG1[]; derivation: Derivation }> {
	const anchor = safeProjectPath(projectRoot, source.bundle_root, "V3 source bundle root");
	const runRoot = safeProjectPath(anchor, source.run_root, "V3 Run root");
	const stateRoot = safeProjectPath(anchor, source.state_root, "V3 State root");
	const registryRoot = safeProjectPath(anchor, source.candidate_admission_registry_root, "V3 candidate admission registry root");
	const authorityPath = safeProjectPath(anchor, source.case_authority_path, "V3 Case Authority path");
	if (!SHA256.test(source.immutable_base_prompt_sha256) || sha256(source.immutable_base_prompt) !== source.immutable_base_prompt_sha256) throw new Error("V3 immutable base prompt identity mismatch");
	const options = { projectRoot, stateRoot, admissionRegistryRoot: registryRoot, caseAuthorityPath: authorityPath, runRoot, expectedProjectId, immutableBasePrompt: source.immutable_base_prompt, immutableBasePromptSha256: source.immutable_base_prompt_sha256 };
	const inspected = await inspectGoal3RunV3(options);
	if (!inspected.integrity_valid || !inspected.manifest || !["passed", "failed"].includes(inspected.manifest.verifier_status)) throw new Error(`V3 bound-State source rejected: ${inspected.errors.join("; ")}`);
	const binding = readJsonArtifact<FrozenRunBindingV3>(runRoot, "binding.json");
	const boundFailureFamily = binding.binding_context.trusted_failure_lineage?.failure_family ?? null;
	if (binding.project_id !== expectedProjectId || binding.binding_context.trusted_task_identity.task_kind !== taskContext.task_kind || boundFailureFamily !== taskContext.failure_family || binding.active_state_digest.length !== 64 || binding.case_authority_digest !== inspected.manifest.case_authority_digest) throw new Error("V3 bound State/project/task identity is ambiguous or mismatched");
	if (binding.active_state_version <= 0 || binding.bound_entries.length === 0 || binding.lineage === null || binding.lineage.version_digest !== binding.active_state_digest) throw new Error("V3 bound-State follow-up requires a promoted non-base State, applicable bound entry, and promotion lineage");
	const hasPrompt = binding.bound_entries.some((entry) => entry.kind === "prompt_addendum");
	const hasSkill = binding.bound_entries.some((entry) => entry.kind === "adaptive_skill");
	const expectedRuntimePath = hasSkill && binding.adaptive_skill_name !== null ? "adaptive_skill" : hasPrompt && binding.adaptive_skill_name === null ? "prompt_addendum" : null;
	if (expectedRuntimePath === null || inspected.manifest.runtime_path !== expectedRuntimePath) throw new Error("V3 runtime path is inconsistent with the promoted bound State");
	const runtime = readJsonArtifact<DirectPiRuntimeEvidenceV3>(runRoot, "runtime.json");
	const inventory = uniqueInventory([
		...inventoryTree(anchor, runRoot, "run_artifact"),
		...inventoryTree(anchor, stateRoot, "state_artifact"),
		...inventoryTree(anchor, registryRoot, "candidate_admission_artifact"),
		inventoryFile(anchor, authorityPath, "case_authority_artifact"),
	]);
	return { anchor, inventory, derivation: { sourceRunIds: [inspected.manifest.run_id], status: inspected.manifest.verifier_status, verifierStatus: inspected.manifest.verifier_status, attribution: inspected.manifest.verifier_status === "failed" ? "verifier" : "none", usage: { provider_calls: runtime.provider_dispatches, tool_calls: runtime.tool_calls }, provenance: { terminal: { settled_events: runtime.settled_events, verifier_status: inspected.manifest.verifier_status }, outcome: { status: inspected.manifest.verifier_status, attribution: inspected.manifest.verifier_status === "failed" ? "verifier" : "none" }, verifier: { status: inspected.manifest.verifier_status }, manifest: inspected.manifest, pointer_drift_observed: inspected.pointer_drift_observed, state: { active_binding_revision: binding.active_binding_revision, active_state_version: binding.active_state_version, active_state_digest: binding.active_state_digest, active_decision_id: binding.active_decision_id }, binding: { binding_digest: binding.binding_digest, binding_context_digest: binding.binding_context_digest, bound_entries: binding.bound_entries, lineage: binding.lineage }, case_authority_digest: binding.case_authority_digest } } };
}

function frozenRefs(inventory: TrustedEvidenceSourceInventoryItemG1[]): ArtifactRefV0B[] {
	return inventory.map(({ source_role: _role, ...ref }) => ref);
}

function withoutAdmissionDigest(record: TrustedEvidenceAdmissionRecordG1): Omit<TrustedEvidenceAdmissionRecordG1, "admission_digest"> {
	const { admission_digest: _digest, ...body } = record;
	return body;
}

export async function deriveTrustedEvidenceAdmissionG1(options: { projectRoot: string; expectedProjectId: string; registration: unknown }): Promise<{ record: TrustedEvidenceAdmissionRecordG1; sourceAnchor: string }> {
	const registration = validateHostRegistrationG1(options.registration, options.expectedProjectId);
	const currentInspector = inspectorIdentityG1(options.projectRoot, registration.source);
	if (stableJson(currentInspector) !== stableJson(registration.expected_inspector)) throw new Error("stale Inspector fingerprint");
	const prepared = registration.source.family === "verifier_backed"
		? await verifierDerivation(options.projectRoot, registration.source)
		: registration.source.family === "v2a_recovery_comparison"
			? v2Derivation(options.projectRoot, registration.source)
			: await v3Derivation(options.projectRoot, registration.project_id, registration.source, registration.trusted_task_context);
	const hostApproval = fixedHostApprovalG1(registration);
	const inventory = uniqueInventory(prepared.inventory);
	for (const item of inventory) if (validateArtifactRef(prepared.anchor, item).length !== 0) throw new Error(`source Artifact invalid: ${item.path}`);
	const inventoryDigest = digestObject(inventory);
	const evidenceSeed = { registration_digest: registration.registration_digest, source_inventory_digest: inventoryDigest, source_run_ids: prepared.derivation.sourceRunIds };
	const evidenceId = `evidence-${digestObject(evidenceSeed).slice(0, 32)}`;
	const frozenBody: Omit<FrozenEvidenceV3, "evidence_digest"> = {
		schema_version: 1,
		evidence_id: evidenceId,
		source_run_ids: prepared.derivation.sourceRunIds,
		validity: { integrity_valid: true, terminal_valid: true, lineage_closed: true, attribution: prepared.derivation.attribution },
		outcome: { status: prepared.derivation.status, verifier_status: prepared.derivation.verifierStatus },
		task_context: structuredClone(registration.trusted_task_context),
		evidence_refs: frozenRefs(inventory),
		...(prepared.derivation.usage ? { usage: prepared.derivation.usage } : {}),
	};
	const frozen: FrozenEvidenceV3 = { ...frozenBody, evidence_digest: digestObject(frozenBody) };
	validateFrozenEvidenceV3(prepared.anchor, frozen);
	const projected = projectImprovementOpportunityV3(prepared.anchor, frozen);
	const admissionSeed = { project_id: registration.project_id, registration_digest: registration.registration_digest, evidence_id: frozen.evidence_id, evidence_digest: frozen.evidence_digest };
	const admissionId = `admission-${digestObject(admissionSeed).slice(0, 32)}`;
	const body: Omit<TrustedEvidenceAdmissionRecordG1, "admission_digest"> = {
		schema_version: 1,
		admission_id: admissionId,
		project_id: registration.project_id,
		registration_id: registration.registration_id,
		registration_digest: registration.registration_digest,
		source_family: registration.source.family,
		source_run_ids: [...prepared.derivation.sourceRunIds],
		source_anchor: portable(relative(resolve(options.projectRoot), prepared.anchor)) || ".",
		inspector: { ...currentInspector, integrity_valid: true, terminal_valid: true },
		source_inventory: inventory,
		source_inventory_digest: inventoryDigest,
		provenance: prepared.derivation.provenance,
		trusted_task_context: structuredClone(registration.trusted_task_context),
		host_eligibility: hostApproval,
		frozen_evidence: frozen,
		projector_result: projected ?? "no_opportunity",
	};
	const record: TrustedEvidenceAdmissionRecordG1 = { ...body, admission_digest: digestObject(body) };
	return { record, sourceAnchor: prepared.anchor };
}

function readOrdinaryJson(path: string): unknown {
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("Host registration must be an ordinary, singly linked file");
	return JSON.parse(readFileSync(path, "utf8"));
}

export async function admitTrustedEvidenceG1(options: { projectRoot: string; admissionRoot: string; registrationPath: string; expectedProjectId: string }): Promise<TrustedEvidenceAdmissionResultG1> {
	const projectRoot = resolve(options.projectRoot);
	const admissionRoot = safeProjectPath(projectRoot, options.admissionRoot, "admission root");
	const registrationPath = safeProjectPath(projectRoot, options.registrationPath, "Host registration path");
	const derived = await deriveTrustedEvidenceAdmissionG1({ projectRoot, expectedProjectId: options.expectedProjectId, registration: readOrdinaryJson(registrationPath) });
	const relativePath = `${derived.record.admission_id}/admission.json`;
	const target = resolve(admissionRoot, relativePath);
	if (existsSync(target)) {
		const stats = lstatSync(target);
		if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("existing admission is not an ordinary singly linked file");
		if (readFileSync(target, "utf8") !== `${stableJson(derived.record)}\n`) throw new Error("write-once admission identity conflict");
		return { record: derived.record, record_path: target, idempotent_existing: true };
	}
	mkdirSync(admissionRoot, { recursive: true });
	const ref = writeOnceJson(admissionRoot, relativePath, derived.record);
	return { record: derived.record, record_path: resolve(admissionRoot, ref.path), idempotent_existing: false };
}

export function validateAdmissionEnvelopeG1(value: unknown): TrustedEvidenceAdmissionRecordG1 {
	const record = exact(value, ["schema_version", "admission_id", "project_id", "registration_id", "registration_digest", "source_family", "source_run_ids", "source_anchor", "inspector", "source_inventory", "source_inventory_digest", "provenance", "trusted_task_context", "host_eligibility", "frozen_evidence", "projector_result", "admission_digest"], "admission record") as unknown as TrustedEvidenceAdmissionRecordG1;
	if (record.schema_version !== 1 || !ID.test(record.admission_id) || !SHA256.test(record.admission_digest) || !SHA256.test(record.source_inventory_digest)) throw new Error("admission identity is invalid");
	if (digestObject(withoutAdmissionDigest(record)) !== record.admission_digest) throw new Error("admission digest mismatch");
	return record;
}
