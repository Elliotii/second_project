import { lstatSync, mkdirSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import type { ActiveStateIdentityV3, StateDecisionV3 } from "../contracts/v3g2-types.ts";
import type { AdmissionRegistryV3, CandidateAdmissionV3 } from "../contracts/v3g3-types.ts";
import type { RefinementCandidateV3, StagedHarnessStateV3 } from "../contracts/v3-types.ts";
import { resolveRunRelative, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, fileSha256, stableJson } from "../hash.ts";
import { semanticStateEntriesV3, stagedStateDigestV3 } from "../state/identity-v3.ts";

const SHA256 = /^[a-f0-9]{64}$/;
const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
const SOURCE_CANDIDATE_REF = "fixtures/v3/goal1-real-candidate.json" as const;
const SOURCE_STATE_REF = "fixtures/v3/goal1-real-staged-state.json" as const;

function candidateBody(candidate: RefinementCandidateV3): Omit<RefinementCandidateV3, "candidate_id" | "candidate_digest"> {
	const { candidate_id: _id, candidate_digest: _digest, ...body } = candidate;
	return body;
}

function admissionBody(admission: CandidateAdmissionV3): Omit<CandidateAdmissionV3, "admission_digest"> {
	const { admission_digest: _digest, ...body } = admission;
	return body;
}

function semanticPayload(candidate: RefinementCandidateV3): unknown {
	return {
		schema_version: candidate.schema_version,
		proposal_id: candidate.proposal_id,
		source_opportunity_id: candidate.source_opportunity_id,
		evidence_identity: candidate.evidence_identity,
		diagnosis: candidate.diagnosis,
		lesson: candidate.lesson,
		edits: candidate.edits,
	};
}

function assertSource(candidate: RefinementCandidateV3, state: StagedHarnessStateV3): void {
	const body = candidateBody(candidate);
	if (digestObject(body) !== candidate.candidate_digest || candidate.candidate_id !== `candidate-${candidate.candidate_digest.slice(0, 32)}`) throw new Error("source Candidate identity mismatch");
	if (stagedStateDigestV3(state) !== state.state_digest) throw new Error("source staged State identity mismatch");
	if (state.candidate_id !== candidate.candidate_id || state.candidate_digest !== candidate.candidate_digest || state.expected_base_state_digest !== candidate.expected_base_state_digest || stableJson(semanticStateEntriesV3(state.entries)) !== stableJson([...candidate.edits].sort((a, b) => a.entry_id.localeCompare(b.entry_id)))) throw new Error("source Candidate/State semantic lineage mismatch");
}

function derive(candidate: RefinementCandidateV3, targetDigest: string): RefinementCandidateV3 {
	const body = { ...candidateBody(candidate), expected_base_state_digest: targetDigest };
	const candidateDigest = digestObject(body);
	return { ...body, candidate_id: `candidate-${candidateDigest.slice(0, 32)}`, candidate_digest: candidateDigest };
}

export function deriveCandidateAdmissionV3(options: { projectId: string; sourceCandidate: RefinementCandidateV3; sourceState: StagedHarnessStateV3; targetActive: ActiveStateIdentityV3 }): { admission: CandidateAdmissionV3; admittedCandidate: RefinementCandidateV3 } {
	assertSource(options.sourceCandidate, options.sourceState);
	if (!ID.test(options.projectId) || !SHA256.test(options.targetActive.state_digest) || !Number.isSafeInteger(options.targetActive.binding_revision) || !Number.isSafeInteger(options.targetActive.state_version)) throw new Error("invalid admission target identity");
	const admittedCandidate = derive(options.sourceCandidate, options.targetActive.state_digest);
	const admittedStagedBody = {
		candidate_id: admittedCandidate.candidate_id,
		candidate_digest: admittedCandidate.candidate_digest,
		evidence_identity: admittedCandidate.evidence_identity,
		expected_base_state_digest: admittedCandidate.expected_base_state_digest,
		entries: [...admittedCandidate.edits].sort((a, b) => a.entry_id.localeCompare(b.entry_id)),
	};
	const body: Omit<CandidateAdmissionV3, "admission_digest"> = {
		schema_version: 1,
		project_id: options.projectId,
		original_candidate_id: options.sourceCandidate.candidate_id,
		original_candidate_digest: options.sourceCandidate.candidate_digest,
		original_staged_state_digest: options.sourceState.state_digest,
		evidence_identity: structuredClone(options.sourceCandidate.evidence_identity),
		original_accepted_base_sentinel_digest: options.sourceCandidate.expected_base_state_digest,
		target_active: structuredClone(options.targetActive),
		semantic_payload_digest: digestObject(semanticPayload(options.sourceCandidate)),
		semantic_preservation: true,
		admitted_candidate_id: admittedCandidate.candidate_id,
		admitted_candidate_digest: admittedCandidate.candidate_digest,
		admitted_staged_state_digest: digestObject(admittedStagedBody),
	};
	return { admission: { ...body, admission_digest: digestObject(body) }, admittedCandidate };
}

export function admitCandidateV3(options: { admissionRoot: string; projectId: string; sourceCandidate: RefinementCandidateV3; sourceState: StagedHarnessStateV3; targetActive: ActiveStateIdentityV3 }): { admission: CandidateAdmissionV3; admittedCandidate: RefinementCandidateV3; path: string } {
	const derived = deriveCandidateAdmissionV3(options);
	mkdirSync(options.admissionRoot, { recursive: true });
	writeOnceJson(options.admissionRoot, `${derived.admission.admission_digest}.json`, derived.admission);
	return { ...derived, path: resolve(options.admissionRoot, `${derived.admission.admission_digest}.json`) };
}

export function inspectCandidateAdmissionV3(options: { admissionPath: string; expectedProjectId: string; sourceCandidate: RefinementCandidateV3; sourceState: StagedHarnessStateV3; expectedCurrentActive: ActiveStateIdentityV3 }): { integrity_valid: boolean; errors: string[]; admission: CandidateAdmissionV3 | null } {
	const errors: string[] = [];
	let admission: CandidateAdmissionV3 | null = null;
	try {
		const stats = lstatSync(options.admissionPath);
		if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("admission must be an ordinary file");
		admission = JSON.parse(readFileSync(options.admissionPath, "utf8")) as CandidateAdmissionV3;
		if (stableJson(Object.keys(admission).sort()) !== stableJson(["schema_version", "project_id", "original_candidate_id", "original_candidate_digest", "original_staged_state_digest", "evidence_identity", "original_accepted_base_sentinel_digest", "target_active", "semantic_payload_digest", "semantic_preservation", "admitted_candidate_id", "admitted_candidate_digest", "admitted_staged_state_digest", "admission_digest"].sort())) throw new Error("admission exact-key validation failed");
		if (admission.admission_digest !== digestObject(admissionBody(admission))) throw new Error("admission content identity mismatch");
		const expected = deriveCandidateAdmissionV3({ projectId: options.expectedProjectId, sourceCandidate: options.sourceCandidate, sourceState: options.sourceState, targetActive: options.expectedCurrentActive });
		if (stableJson(admission) !== stableJson(expected.admission)) throw new Error("admission is stale, cross-project, forged, semantically changed, or mismatched");
	} catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
	return { integrity_valid: errors.length === 0, errors, admission };
}

function registryBody(registry: AdmissionRegistryV3): Omit<AdmissionRegistryV3, "registry_digest"> {
	const { registry_digest: _digest, ...body } = registry;
	return body;
}

function ordinaryFile(path: string, label: string): void {
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`${label} must be an ordinary file`);
}

function projectRelative(projectRoot: string, path: string): string {
	const value = relative(resolve(projectRoot), resolve(path)).split(sep).join("/");
	if (value.startsWith("../") || value === "..") throw new Error("Admission registry reference escapes project root");
	return value;
}

export function freezeAdmissionRegistryV3(options: { registryRoot: string; projectRoot: string; projectId: string; admissionPaths: readonly string[] }): { registry: AdmissionRegistryV3; path: string } {
	mkdirSync(options.registryRoot, { recursive: true });
	const sourceCandidatePath = resolve(options.projectRoot, SOURCE_CANDIDATE_REF);
	const sourceStatePath = resolve(options.projectRoot, SOURCE_STATE_REF);
	ordinaryFile(sourceCandidatePath, "source Candidate fixture"); ordinaryFile(sourceStatePath, "source State fixture");
	const entries = options.admissionPaths.map((path) => {
		ordinaryFile(path, "admission");
		const admission = JSON.parse(readFileSync(path, "utf8")) as CandidateAdmissionV3;
		const admissionDirectory = resolve(options.registryRoot, "admissions");
		mkdirSync(admissionDirectory, { recursive: true });
		const frozenRef = writeOnceJson(admissionDirectory, `${admission.admission_digest}.json`, admission);
		const frozenPath = resolve(admissionDirectory, frozenRef.path);
		return {
			admitted_candidate_digest: admission.admitted_candidate_digest,
			admission_digest: admission.admission_digest,
			admission_ref: projectRelative(options.registryRoot, frozenPath),
			admission_file_sha256: fileSha256(frozenPath),
			source_candidate_ref: SOURCE_CANDIDATE_REF,
			source_candidate_sha256: fileSha256(sourceCandidatePath),
			source_state_ref: SOURCE_STATE_REF,
			source_state_sha256: fileSha256(sourceStatePath),
		};
	}).sort((a, b) => a.admitted_candidate_digest.localeCompare(b.admitted_candidate_digest));
	if (new Set(entries.map((entry) => entry.admitted_candidate_digest)).size !== entries.length) throw new Error("Admission registry contains duplicate Candidate identity");
	const body: Omit<AdmissionRegistryV3, "registry_digest"> = { schema_version: 1, project_id: options.projectId, entries };
	const registry = { ...body, registry_digest: digestObject(body) };
	writeOnceJson(options.registryRoot, "registry.json", registry);
	return { registry, path: resolve(options.registryRoot, "registry.json") };
}

function loadAdmissionRegistryV3(options: { registryRoot: string; projectRoot: string; expectedProjectId: string }): { registry: AdmissionRegistryV3; sourceCandidate: RefinementCandidateV3; sourceState: StagedHarnessStateV3 } {
	const registryPath = resolve(options.registryRoot, "registry.json"); ordinaryFile(registryPath, "Admission registry");
	const registry = JSON.parse(readFileSync(registryPath, "utf8")) as AdmissionRegistryV3;
	if (stableJson(Object.keys(registry).sort()) !== stableJson(["schema_version", "project_id", "entries", "registry_digest"].sort()) || registry.schema_version !== 1 || registry.project_id !== options.expectedProjectId || registry.registry_digest !== digestObject(registryBody(registry))) throw new Error("Admission registry identity mismatch");
	const sorted = [...registry.entries].sort((a, b) => a.admitted_candidate_digest.localeCompare(b.admitted_candidate_digest));
	if (stableJson(sorted) !== stableJson(registry.entries) || new Set(sorted.map((entry) => entry.admitted_candidate_digest)).size !== sorted.length) throw new Error("Admission registry ordering/uniqueness invalid");
	const sourceCandidatePath = resolve(options.projectRoot, SOURCE_CANDIDATE_REF); const sourceStatePath = resolve(options.projectRoot, SOURCE_STATE_REF);
	ordinaryFile(sourceCandidatePath, "source Candidate fixture"); ordinaryFile(sourceStatePath, "source State fixture");
	return { registry, sourceCandidate: JSON.parse(readFileSync(sourceCandidatePath, "utf8")) as RefinementCandidateV3, sourceState: JSON.parse(readFileSync(sourceStatePath, "utf8")) as StagedHarnessStateV3 };
}

export function inspectPromotionAdmissionLineageV3(options: { registryRoot: string; projectRoot: string; expectedProjectId: string; decision: StateDecisionV3 }): string | null {
	if (options.decision.kind !== "promotion" || !options.decision.candidate_digest) throw new Error("Admission lineage requires a promotion decision");
	if (!options.decision.prior_active) throw new Error("promotion admission target identity missing");
	const loaded = loadAdmissionRegistryV3(options);
	const expected = deriveCandidateAdmissionV3({ projectId: options.expectedProjectId, sourceCandidate: loaded.sourceCandidate, sourceState: loaded.sourceState, targetActive: options.decision.prior_active });
	if (options.decision.candidate_digest !== expected.admittedCandidate.candidate_digest) return null;
	const entry = loaded.registry.entries.find((value) => value.admitted_candidate_digest === options.decision.candidate_digest);
	if (!entry) throw new Error("required admitted Candidate lineage omitted from registry");
	if (stableJson(Object.keys(entry).sort()) !== stableJson(["admitted_candidate_digest", "admission_digest", "admission_ref", "admission_file_sha256", "source_candidate_ref", "source_candidate_sha256", "source_state_ref", "source_state_sha256"].sort()) || entry.source_candidate_ref !== SOURCE_CANDIDATE_REF || entry.source_state_ref !== SOURCE_STATE_REF) throw new Error("Admission registry entry shape invalid");
	const admissionPath = resolveRunRelative(options.registryRoot, entry.admission_ref); ordinaryFile(admissionPath, "registered admission");
	if (fileSha256(admissionPath) !== entry.admission_file_sha256 || fileSha256(resolve(options.projectRoot, entry.source_candidate_ref)) !== entry.source_candidate_sha256 || fileSha256(resolve(options.projectRoot, entry.source_state_ref)) !== entry.source_state_sha256) throw new Error("Admission registry artifact digest mismatch");
	const inspected = inspectCandidateAdmissionV3({ admissionPath, expectedProjectId: options.expectedProjectId, sourceCandidate: loaded.sourceCandidate, sourceState: loaded.sourceState, expectedCurrentActive: options.decision.prior_active });
	if (!inspected.integrity_valid || !inspected.admission || inspected.admission.admission_digest !== entry.admission_digest) throw new Error(`registered admission inspection failed: ${inspected.errors.join("; ")}`);
	return inspected.admission.admission_digest;
}
