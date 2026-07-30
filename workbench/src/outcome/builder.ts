import type { OutcomeV0B, VerifierResultV0B } from "../contracts/v0b-types.ts";

export interface OutcomeSignalsV0B {
	runId: string;
	attemptId: string;
	evidenceValid: boolean;
	verifierStatus: VerifierResultV0B["status"] | null;
	infrastructureBlocked?: boolean;
	userCancelled?: boolean;
	budgetExhausted?: boolean;
	agentTerminalReason: string;
	evidenceIndexRef: string;
}

export function buildOutcomeV0B(signals: OutcomeSignalsV0B): OutcomeV0B {
	const base = {
		schema_version: 1 as const,
		run_id: signals.runId,
		final_attempt_id: signals.attemptId,
		initial_verifier_status: signals.verifierStatus,
		final_verifier_status: signals.verifierStatus,
		recovery_triggered: false as const,
		attempt_count: 1 as const,
		evidence_index_ref: signals.evidenceIndexRef,
	};
	if (!signals.evidenceValid) {
		return { ...base, status: "invalid", failure_class: "evidence", terminal_reason: "evidence_validation_failed" };
	}
	if (signals.verifierStatus === "invalid") {
		return { ...base, status: "invalid", failure_class: "verifier", terminal_reason: "verifier_invalid" };
	}
	if (signals.infrastructureBlocked) {
		return { ...base, status: "invalid", failure_class: "infrastructure", terminal_reason: "infrastructure_blocked" };
	}
	if (signals.userCancelled) {
		return { ...base, status: "cancelled", failure_class: "user", terminal_reason: "user_cancelled" };
	}
	if (signals.budgetExhausted) {
		return { ...base, status: "failed", failure_class: "budget", terminal_reason: "budget_exhausted" };
	}
	if (signals.verifierStatus === "passed") {
		return { ...base, status: "passed", failure_class: null, terminal_reason: signals.agentTerminalReason };
	}
	if (signals.verifierStatus === "failed") {
		return { ...base, status: "failed", failure_class: "agent", terminal_reason: signals.agentTerminalReason };
	}
	return { ...base, status: "invalid", failure_class: "infrastructure", terminal_reason: "missing_verifier_result" };
}
