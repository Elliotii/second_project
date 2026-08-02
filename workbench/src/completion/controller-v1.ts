import type { StrategyIdV1, VerifierStatusV1 } from "../contracts/v1-types.ts";

export function decideV1Intervention(input: {
	strategy_id: StrategyIdV1;
	verifier_status: VerifierStatusV1;
	evidence_valid: boolean;
	budget_available: boolean;
	is_child: boolean;
	child_attempt_count: number;
}): { decision: "stop" | "create_child"; reason: string } {
	if (!input.evidence_valid) return { decision: "stop", reason: "evidence_invalid" };
	if (input.verifier_status === "invalid") return { decision: "stop", reason: "verifier_invalid" };
	if (input.verifier_status === "infrastructure_error") return { decision: "stop", reason: "infrastructure_error" };
	if (input.verifier_status === "cancelled") return { decision: "stop", reason: "cancelled" };
	if (input.verifier_status === "passed") return { decision: "stop", reason: "verified_pass" };
	if (input.strategy_id !== "skill_plus_runtime_control") return { decision: "stop", reason: "non_intervention_arm" };
	if (!input.budget_available) return { decision: "stop", reason: "budget_exhausted" };
	if (input.is_child || input.child_attempt_count !== 0) return { decision: "stop", reason: "recovery_slot_unavailable" };
	return { decision: "create_child", reason: "eligible_failed_initial" };
}
