import {
	V2A_STRATEGY_ORDER,
	type CandidateOrderingV2A,
	type CandidatePathV2A,
	type SelectionDecisionV2A,
} from "../contracts/v2-types.ts";

function isEligible(candidate: CandidatePathV2A): boolean {
	return Object.values(candidate.hard_gates).every(Boolean);
}

function ordering(candidate: CandidatePathV2A): CandidateOrderingV2A {
	return {
		candidate_path_id: candidate.candidate_path_id,
		allowed_semantic_diff_size: candidate.allowed_semantic_diff_size,
		tokens: candidate.budget_usage.tokens,
		tool_calls: candidate.budget_usage.tool_calls,
		active_execution_time_ms: candidate.budget_usage.active_execution_time_ms,
		strategy_order: V2A_STRATEGY_ORDER.indexOf(candidate.strategy_id),
	};
}

function compare(left: CandidateOrderingV2A, right: CandidateOrderingV2A): number {
	return (
		left.allowed_semantic_diff_size - right.allowed_semantic_diff_size ||
		left.tokens - right.tokens ||
		left.tool_calls - right.tool_calls ||
		left.active_execution_time_ms - right.active_execution_time_ms ||
		left.strategy_order - right.strategy_order
	);
}

export function selectCandidateV2A(
	recoveryGroupId: string,
	candidates: readonly CandidatePathV2A[],
): SelectionDecisionV2A {
	if (candidates.length !== 2) throw new Error("V2-A selector requires exactly two Candidate paths");
	if (new Set(candidates.map((candidate) => candidate.candidate_path_id)).size !== 2) {
		throw new Error("V2-A selector rejects duplicate Candidate identity");
	}
	if (candidates.some((candidate) => candidate.recovery_group_id !== recoveryGroupId)) {
		throw new Error("V2-A selector rejects cross-group Candidate identity");
	}
	const eligible = candidates.filter(isEligible);
	const ordered = eligible.map(ordering).sort(compare);
	const selected = ordered[0]?.candidate_path_id ?? null;
	const allInvalid = candidates.every((candidate) => !candidate.evidence_valid);
	const tiedBeforeStrategy =
		ordered.length > 1 &&
		ordered[0]!.allowed_semantic_diff_size === ordered[1]!.allowed_semantic_diff_size &&
		ordered[0]!.tokens === ordered[1]!.tokens &&
		ordered[0]!.tool_calls === ordered[1]!.tool_calls &&
		ordered[0]!.active_execution_time_ms === ordered[1]!.active_execution_time_ms;
	return {
		schema_version: "v2a-selection-decision-v1",
		recovery_group_id: recoveryGroupId,
		evaluated_candidate_ids: candidates.map((candidate) => candidate.candidate_path_id),
		eligible_candidate_ids: eligible.map((candidate) => candidate.candidate_path_id),
		rejected_candidate_ids: candidates.filter((candidate) => !isEligible(candidate)).map((candidate) => candidate.candidate_path_id),
		selected_candidate_id: selected,
		hard_gate_results: Object.fromEntries(candidates.map((candidate) => [candidate.candidate_path_id, structuredClone(candidate.hard_gates)])),
		secondary_ordering: ordered,
		comparison_reason:
			ordered.length === 0
				? ["no Candidate passed every Hard Gate"]
				: [
					"eligible Candidates only",
					"allowed semantic diff size",
					"tokens",
					"tool calls",
					"active execution time",
					"fixed strategy order",
				],
		terminal_reason: selected === null ? (allInvalid ? "all_invalid" : "no_passing_candidate") : tiedBeforeStrategy ? "tie_resolved" : "selected",
	};
}
