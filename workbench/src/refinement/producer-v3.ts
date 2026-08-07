import type { ApplicabilityV3, HarnessEditV3, ImprovementOpportunityV3, RefinementCandidateV3, RefinementProposalV3 } from "../contracts/v3-types.ts";
import { digestObject, stableJson } from "../hash.ts";
import { sameEvidenceRefsV3 } from "./evidence-v3.ts";

const SHA256 = /^[a-f0-9]{64}$/;
const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONTROLLED_CONTEXT = /^[a-z0-9][a-z0-9._:-]{0,63}$/;

function exact(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	const record = value as Record<string, unknown>;
	if (Object.keys(record).length !== keys.length || keys.some((key) => !Object.hasOwn(record, key))) throw new Error(`${label} exact-key validation failed`);
	return record;
}

function text(value: unknown, label: string, maxBytes = 4096): string {
	if (typeof value !== "string" || value.trim() !== value || value.length === 0 || Buffer.byteLength(value, "utf8") > maxBytes || value.includes("\0")) throw new Error(`${label} is invalid`);
	return value;
}

function applicability(value: unknown): ApplicabilityV3 {
	const record = exact(value, ["task_kinds", "failure_families"], "applicability");
	for (const key of ["task_kinds", "failure_families"] as const) {
		if (!Array.isArray(record[key]) || record[key].length > 4 || record[key].some((entry) => typeof entry !== "string" || !CONTROLLED_CONTEXT.test(entry))) throw new Error(`invalid applicability ${key}`);
		if (new Set(record[key] as string[]).size !== record[key].length) throw new Error(`duplicate applicability ${key}`);
	}
	if ((record.task_kinds as string[]).length === 0) throw new Error("at least one task_kind is required");
	return structuredClone(value) as ApplicabilityV3;
}

function edit(value: unknown): HarnessEditV3 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("edit must be an object");
	const kind = (value as Record<string, unknown>).kind;
	if (kind === "prompt_addendum") {
		const record = exact(value, ["kind", "entry_id", "content", "applicability"], "prompt_addendum edit");
		if (!ID.test(String(record.entry_id))) throw new Error("invalid prompt entry_id");
		text(record.content, "prompt addendum", 8192);
		applicability(record.applicability);
		return structuredClone(value) as HarnessEditV3;
	}
	if (kind === "adaptive_skill") {
		const record = exact(value, ["kind", "entry_id", "skill_name", "description", "markdown_body", "applicability"], "adaptive_skill edit");
		if (!ID.test(String(record.entry_id)) || !SKILL_NAME.test(String(record.skill_name))) throw new Error("invalid adaptive Skill identity");
		text(record.description, "Skill description", 512);
		text(record.markdown_body, "Skill markdown body", 16384);
		applicability(record.applicability);
		return structuredClone(value) as HarnessEditV3;
	}
	throw new Error("authority-targeting or unknown edit kind rejected");
}

export function validateProposalAndBuildCandidateV3(options: { rawProposal: unknown; opportunity: ImprovementOpportunityV3; currentBaseStateDigest: string; derivation: "deterministic_fixture" | "model_proposal" }): RefinementCandidateV3 {
	const raw = exact(options.rawProposal, ["schema_version", "proposal_id", "evidence_digest", "expected_base_state_digest", "diagnosis", "lesson", "edits"], "proposal");
	if (raw.schema_version !== 1 || !ID.test(String(raw.proposal_id)) || !SHA256.test(String(raw.evidence_digest)) || !SHA256.test(String(raw.expected_base_state_digest))) throw new Error("invalid proposal identity");
	if (raw.evidence_digest !== options.opportunity.evidence_identity.evidence_digest) throw new Error("proposal evidence is stale or unrelated");
	if (raw.expected_base_state_digest !== options.currentBaseStateDigest) throw new Error("stale expected base state rejected");
	const diagnosis = exact(raw.diagnosis, ["pattern_id", "statement", "evidence_refs"], "diagnosis");
	if (diagnosis.pattern_id !== options.opportunity.trigger) throw new Error("diagnosis pattern does not match opportunity");
	text(diagnosis.statement, "diagnosis statement");
	if (!Array.isArray(diagnosis.evidence_refs) || !sameEvidenceRefsV3(diagnosis.evidence_refs as never, options.opportunity.evidence_refs)) throw new Error("diagnosis evidence refs do not match frozen evidence");
	const lesson = exact(raw.lesson, ["statement", "expected_outcome", "applicability"], "lesson");
	text(lesson.statement, "lesson statement");
	text(lesson.expected_outcome, "expected outcome");
	const lessonApplicability = applicability(lesson.applicability);
	if (!Array.isArray(raw.edits) || raw.edits.length < 1 || raw.edits.length > 2) throw new Error("Candidate must contain one or two coherent edits");
	const edits = raw.edits.map(edit);
	if (new Set(edits.map((entry) => entry.entry_id)).size !== edits.length) throw new Error("duplicate Candidate entry_id");
	for (const entry of edits) if (stableJson(entry.applicability) !== stableJson(lessonApplicability)) throw new Error("edit applicability must match the Lesson");
	const evidenceIdentity = structuredClone(options.opportunity.evidence_identity);
	const diagnosisObject = { diagnosis_id: `diag-${digestObject({ opportunity_id: options.opportunity.opportunity_id, statement: diagnosis.statement }).slice(0, 32)}`, opportunity_id: options.opportunity.opportunity_id, pattern_id: options.opportunity.trigger, evidence_identity: evidenceIdentity, evidence_refs: structuredClone(options.opportunity.evidence_refs), statement: diagnosis.statement as string, derivation: options.derivation };
	const lessonObject = { lesson_id: `lesson-${digestObject({ diagnosis_id: diagnosisObject.diagnosis_id, statement: lesson.statement }).slice(0, 32)}`, diagnosis_id: diagnosisObject.diagnosis_id, evidence_identity: evidenceIdentity, statement: lesson.statement as string, expected_outcome: lesson.expected_outcome as string, applicability: lessonApplicability };
	const base = { schema_version: 1 as const, proposal_id: raw.proposal_id as string, source_opportunity_id: options.opportunity.opportunity_id, evidence_identity: evidenceIdentity, diagnosis: diagnosisObject, lesson: lessonObject, expected_base_state_digest: raw.expected_base_state_digest as string, edits };
	const candidateDigest = digestObject(base);
	return { ...base, candidate_id: `candidate-${candidateDigest.slice(0, 32)}`, candidate_digest: candidateDigest };
}

export function deterministicFixtureProposalV3(options: { opportunity: ImprovementOpportunityV3; currentBaseStateDigest: string; kind: "prompt_addendum" | "adaptive_skill" }): RefinementProposalV3 {
	const applicability = { task_kinds: [options.opportunity.task_context.task_kind], failure_families: options.opportunity.task_context.failure_family === null ? [] : [options.opportunity.task_context.failure_family] };
	const shared = { schema_version: 1 as const, proposal_id: `fixture-${options.opportunity.trigger}-${options.kind}`, evidence_digest: options.opportunity.evidence_identity.evidence_digest, expected_base_state_digest: options.currentBaseStateDigest, diagnosis: { pattern_id: options.opportunity.trigger, statement: `Frozen evidence demonstrates ${options.opportunity.trigger}.`, evidence_refs: structuredClone(options.opportunity.evidence_refs) }, lesson: { statement: "Preserve the observed constraint as bounded harness guidance.", expected_outcome: "The same failure pattern is avoided without changing evaluation authority.", applicability } };
	const edits: HarnessEditV3[] = options.kind === "prompt_addendum"
		? [{ kind: "prompt_addendum", entry_id: `prompt-${options.opportunity.trigger}`, content: "Before reporting completion, run the task-declared frozen check and use its result as the completion fact.", applicability }]
		: [{ kind: "adaptive_skill", entry_id: `skill-${options.opportunity.trigger}`, skill_name: `adaptive-${options.opportunity.trigger.replaceAll("_", "-")}`, description: "Apply evidence-grounded verification guidance for this bounded task family.", markdown_body: "Inspect the task and preserve protected files. Run the frozen check after the edit. If it fails, use only its bounded public output for one focused correction, then run the same check again.", applicability }];
	return { ...shared, edits };
}

export interface BoundedProposalPortV3 {
	propose(frozenInput: Readonly<{ schema_version: 1; opportunity: ImprovementOpportunityV3; expected_base_state_digest: string }>): Promise<unknown>;
}

function deepFreeze<T>(value: T): Readonly<T> {
	if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
		for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
		Object.freeze(value);
	}
	return value;
}

export function createBoundedModelBackedProducerV3(options: { port: BoundedProposalPortV3; inputBytesMax?: number; outputBytesMax?: number }) {
	const inputBytesMax = options.inputBytesMax ?? 64 * 1024;
	const outputBytesMax = options.outputBytesMax ?? 32 * 1024;
	return async (opportunity: ImprovementOpportunityV3, currentBaseStateDigest: string): Promise<RefinementCandidateV3> => {
		const input = deepFreeze({ schema_version: 1 as const, opportunity: structuredClone(opportunity), expected_base_state_digest: currentBaseStateDigest });
		if (Buffer.byteLength(stableJson(input), "utf8") > inputBytesMax) throw new Error("bounded producer input limit exceeded");
		const raw = await options.port.propose(input);
		let serialized: string;
		try { serialized = stableJson(raw); } catch { throw new Error("model proposal is not JSON serializable"); }
		if (Buffer.byteLength(serialized, "utf8") > outputBytesMax) throw new Error("bounded producer output limit exceeded");
		return validateProposalAndBuildCandidateV3({ rawProposal: raw, opportunity, currentBaseStateDigest, derivation: "model_proposal" });
	};
}
