import type { ArtifactRefV0B } from "../contracts/v0b-types.ts";
import type { FrozenEvidenceV3, ImprovementOpportunityV3, TrajectoryEventV3 } from "../contracts/v3-types.ts";
import { validateArtifactRef } from "../evidence/artifacts.ts";
import { digestObject, stableJson } from "../hash.ts";

const SHA256 = /^[a-f0-9]{64}$/;
const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;

function object(value: unknown, label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value as Record<string, unknown>;
}

function exact(value: unknown, required: readonly string[], optional: readonly string[], label: string): Record<string, unknown> {
	const record = object(value, label);
	const allowed = new Set([...required, ...optional]);
	for (const key of Object.keys(record)) if (!allowed.has(key)) throw new Error(`${label} contains unknown key: ${key}`);
	for (const key of required) if (!Object.hasOwn(record, key)) throw new Error(`${label} is missing key: ${key}`);
	return record;
}

function nonNegativeInteger(value: unknown, label: string): number {
	if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error(`${label} must be a non-negative integer`);
	return value as number;
}

function validateRef(root: string, value: unknown, label: string): ArtifactRefV0B {
	const errors = validateArtifactRef(root, value);
	if (errors.length !== 0) throw new Error(`${label}: ${errors.join("; ")}`);
	return value as ArtifactRefV0B;
}

export function evidenceDigestV3(evidence: Omit<FrozenEvidenceV3, "evidence_digest">): string {
	return digestObject(evidence);
}

function validateEvent(root: string, value: unknown, expectedSeq: number): TrajectoryEventV3 {
	const base = object(value, "trajectory event");
	if (base.seq !== expectedSeq) throw new Error("trajectory seq must be contiguous and ordered");
	if (base.kind === "check_call") {
		exact(base, ["seq", "kind", "call_id", "command_id", "argv_sha256"], [], "check_call");
		if (!ID.test(String(base.call_id)) || !ID.test(String(base.command_id)) || !SHA256.test(String(base.argv_sha256))) throw new Error("invalid check_call identity");
	} else if (base.kind === "check_result") {
		exact(base, ["seq", "kind", "call_id", "result_id", "command_id", "argv_sha256", "exit_code", "output_ref"], [], "check_result");
		if (!ID.test(String(base.call_id)) || !ID.test(String(base.result_id)) || !ID.test(String(base.command_id)) || !SHA256.test(String(base.argv_sha256))) throw new Error("invalid check_result identity");
		if (!Number.isSafeInteger(base.exit_code)) throw new Error("check_result exit_code must be an integer");
		validateRef(root, base.output_ref, "check_result output_ref");
	} else if (base.kind === "edit_call") {
		exact(base, ["seq", "kind", "call_id"], [], "edit_call");
		if (!ID.test(String(base.call_id))) throw new Error("invalid edit_call identity");
	} else if (base.kind === "edit_result") {
		exact(base, ["seq", "kind", "call_id", "result_id", "edit_ref"], [], "edit_result");
		if (!ID.test(String(base.call_id)) || !ID.test(String(base.result_id))) throw new Error("invalid edit_result identity");
		validateRef(root, base.edit_ref, "edit_result edit_ref");
	} else {
		throw new Error("unknown trajectory event kind");
	}
	return value as TrajectoryEventV3;
}

export function validateFrozenEvidenceV3(root: string, value: unknown): FrozenEvidenceV3 {
	const record = exact(value, ["schema_version", "evidence_id", "evidence_digest", "source_run_ids", "validity", "outcome", "task_context", "evidence_refs"], ["usage", "comparison", "trajectory"], "frozen evidence");
	if (record.schema_version !== 1 || !ID.test(String(record.evidence_id)) || !SHA256.test(String(record.evidence_digest))) throw new Error("invalid frozen evidence identity");
	if (!Array.isArray(record.source_run_ids) || record.source_run_ids.length === 0 || record.source_run_ids.some((id) => !ID.test(String(id)))) throw new Error("invalid source_run_ids");
	const validity = exact(record.validity, ["integrity_valid", "terminal_valid", "lineage_closed", "attribution"], [], "validity");
	if ([validity.integrity_valid, validity.terminal_valid, validity.lineage_closed].some((entry) => typeof entry !== "boolean")) throw new Error("invalid evidence validity flags");
	if (!["agent", "verifier", "none", "infrastructure", "evidence", "user"].includes(String(validity.attribution))) throw new Error("invalid evidence attribution");
	const outcome = exact(record.outcome, ["status", "verifier_status"], [], "outcome");
	if (!["passed", "failed", "invalid", "cancelled"].includes(String(outcome.status)) || !["passed", "failed", "invalid", "missing"].includes(String(outcome.verifier_status))) throw new Error("invalid outcome status");
	const context = exact(record.task_context, ["task_kind", "failure_family"], [], "task_context");
	if (!ID.test(String(context.task_kind)) || !(context.failure_family === null || ID.test(String(context.failure_family)))) throw new Error("invalid task context");
	if (!Array.isArray(record.evidence_refs) || record.evidence_refs.length === 0) throw new Error("evidence_refs must be non-empty");
	for (const [index, ref] of record.evidence_refs.entries()) validateRef(root, ref, `evidence_refs[${index}]`);
	if (record.usage !== undefined) {
		const usage = exact(record.usage, ["provider_calls", "tool_calls"], [], "usage");
		nonNegativeInteger(usage.provider_calls, "provider_calls");
		nonNegativeInteger(usage.tool_calls, "tool_calls");
	}
	if (record.comparison !== undefined) {
		const comparison = exact(record.comparison, ["peer_run_id", "common_verifier", "peer_verifier_status", "vector"], [], "comparison");
		if (!ID.test(String(comparison.peer_run_id)) || comparison.common_verifier !== true || comparison.peer_verifier_status !== "passed") throw new Error("invalid comparison identity");
		const vector = exact(comparison.vector, ["provider_calls", "tool_calls"], [], "comparison vector");
		for (const key of ["provider_calls", "tool_calls"] as const) {
			const metric = exact(vector[key], ["peer", "observed"], [], `${key} metric`);
			nonNegativeInteger(metric.peer, `${key}.peer`);
			nonNegativeInteger(metric.observed, `${key}.observed`);
		}
	}
	if (record.trajectory !== undefined) {
		const trajectory = exact(record.trajectory, ["events"], [], "trajectory");
		if (!Array.isArray(trajectory.events)) throw new Error("trajectory events must be an array");
		trajectory.events.forEach((event, index) => validateEvent(root, event, index + 1));
	}
	const evidence = value as FrozenEvidenceV3;
	const { evidence_digest: declared, ...body } = evidence;
	if (evidenceDigestV3(body) !== declared) throw new Error("frozen evidence digest mismatch");
	return structuredClone(evidence);
}

function repeatedFailure(root: string, evidence: FrozenEvidenceV3): Record<string, string | number | boolean> | null {
	const events = evidence.trajectory?.events;
	if (events?.length !== 6) return null;
	const [call1, result1, editCall, editResult, call2, result2] = events;
	if (call1?.kind !== "check_call" || result1?.kind !== "check_result" || editCall?.kind !== "edit_call" || editResult?.kind !== "edit_result" || call2?.kind !== "check_call" || result2?.kind !== "check_result") return null;
	if (call1.call_id !== result1.call_id || call2.call_id !== result2.call_id || editCall.call_id !== editResult.call_id) return null;
	if (new Set([result1.result_id, editResult.result_id, result2.result_id]).size !== 3) return null;
	if (call1.command_id !== result1.command_id || call2.command_id !== result2.command_id || call1.command_id !== call2.command_id) return null;
	if (call1.argv_sha256 !== result1.argv_sha256 || call2.argv_sha256 !== result2.argv_sha256 || call1.argv_sha256 !== call2.argv_sha256) return null;
	if (result1.exit_code === 0 || result2.exit_code === 0) return null;
	for (const ref of [result1.output_ref, editResult.edit_ref, result2.output_ref]) if (validateArtifactRef(root, ref).length !== 0) return null;
	return { command_id: call1.command_id, argv_sha256: call1.argv_sha256, first_exit_code: result1.exit_code, second_exit_code: result2.exit_code, intervention_linked: true };
}

export function projectImprovementOpportunityV3(root: string, value: unknown): ImprovementOpportunityV3 | null {
	let evidence: FrozenEvidenceV3;
	try {
		evidence = validateFrozenEvidenceV3(root, value);
	} catch {
		return null;
	}
	const valid = evidence.validity.integrity_valid && evidence.validity.terminal_valid && evidence.validity.lineage_closed;
	if (!valid || ["invalid", "cancelled"].includes(evidence.outcome.status) || evidence.outcome.verifier_status === "missing" || ["infrastructure", "evidence", "user"].includes(evidence.validity.attribution)) return null;
	let trigger: ImprovementOpportunityV3["trigger"];
	let observations: ImprovementOpportunityV3["observations"];
	const structural = repeatedFailure(root, evidence);
	if (structural !== null) {
		trigger = "structural_trajectory_pathology";
		observations = structural;
	} else if (evidence.trajectory !== undefined) {
		return null;
	} else if (evidence.outcome.status === "failed" && evidence.outcome.verifier_status === "failed" && ["agent", "verifier"].includes(evidence.validity.attribution)) {
		trigger = "hard_failure";
		observations = { verifier_failed: true, terminal_valid: true };
	} else if (evidence.outcome.status === "passed" && evidence.outcome.verifier_status === "passed" && evidence.comparison !== undefined) {
		const { provider_calls, tool_calls } = evidence.comparison.vector;
		const strictlyWorse = provider_calls.observed > provider_calls.peer || (provider_calls.observed === provider_calls.peer && tool_calls.observed > tool_calls.peer);
		if (!strictlyWorse) return null;
		trigger = "inefficient_success";
		observations = { peer_run_id: evidence.comparison.peer_run_id, provider_calls_peer: provider_calls.peer, provider_calls_observed: provider_calls.observed, tool_calls_peer: tool_calls.peer, tool_calls_observed: tool_calls.observed };
	} else {
		return null;
	}
	const identity = { evidence_id: evidence.evidence_id, evidence_digest: evidence.evidence_digest };
	const opportunityBase = { schema_version: 1 as const, trigger, source_run_ids: [...evidence.source_run_ids], evidence_identity: identity, evidence_refs: structuredClone(evidence.evidence_refs), observations, derivation: "deterministic_projection" as const, task_context: structuredClone(evidence.task_context) };
	return { ...opportunityBase, opportunity_id: `opp-${digestObject(opportunityBase).slice(0, 32)}` };
}

export function sameEvidenceRefsV3(left: ArtifactRefV0B[], right: ArtifactRefV0B[]): boolean {
	return stableJson(left) === stableJson(right);
}
