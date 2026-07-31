import { randomUUID } from "node:crypto";
import type {
	CompletionDecisionV0C,
	FailurePacketV0C,
	RunBudgetV0C,
	StrategySpecV0C,
	TaskSpecV0C,
} from "../contracts/v0c-types.ts";
import type { VerifierResultV0B } from "../contracts/v0b-types.ts";

export interface ControllerSignalsV0C {
	runId: string;
	attemptId: string;
	isChild: boolean;
	task: TaskSpecV0C;
	strategy: StrategySpecV0C;
	evidenceValid: boolean;
	verifierStatus: VerifierResultV0B["status"] | null;
	infrastructureBlocked?: boolean;
	userCancelled?: boolean;
	budgetExhausted?: boolean;
	childStartReserveAvailable: boolean;
	recoverySlotConsumed: 0 | 1;
	budget: RunBudgetV0C;
	failurePacket?: FailurePacketV0C | null;
}

export function decideCompletionV0C(signals: ControllerSignalsV0C): CompletionDecisionV0C {
	let decision: CompletionDecisionV0C["decision"];
	let reason: CompletionDecisionV0C["reason"];
	let slotAfter = signals.recoverySlotConsumed;
	if (!signals.evidenceValid) {
		decision = "stop_invalid";
		reason = "evidence_invalid";
	} else if (signals.verifierStatus === "invalid" || signals.verifierStatus === null) {
		decision = "stop_invalid";
		reason = "verifier_invalid";
	} else if (signals.infrastructureBlocked) {
		decision = "stop_invalid";
		reason = "infrastructure_blocked";
	} else if (signals.userCancelled) {
		decision = "stop_cancelled";
		reason = "user_cancelled";
	} else if (signals.budgetExhausted) {
		decision = "stop_failed";
		reason = "budget_exhausted";
	} else if (signals.verifierStatus === "passed") {
		decision = "stop_passed";
		reason = "verifier_passed";
	} else if (signals.isChild || signals.strategy.completion_policy_id === "observe_only") {
		decision = "stop_failed";
		reason = "verifier_failed_policy_stop";
	} else if (signals.task.acceptance_visibility !== "public_external") {
		decision = "stop_failed";
		reason = "verifier_failed_hidden_acceptance";
	} else if (signals.recoverySlotConsumed !== 0) {
		decision = "stop_failed";
		reason = "recovery_slot_unavailable";
	} else if (!signals.childStartReserveAvailable) {
		decision = "stop_failed";
		reason = "child_start_reserve_insufficient";
	} else {
		decision = "recover_once";
		reason = "verifier_failed_recover_once";
		slotAfter = 1;
	}
	return {
		schema_version: 1,
		decision_id: `decision-${randomUUID()}`,
		run_id: signals.runId,
		after_attempt_id: signals.attemptId,
		decision,
		reason,
		evidence_valid: signals.evidenceValid,
		verifier_status: signals.verifierStatus,
		recovery_slot_before: signals.recoverySlotConsumed,
		recovery_slot_after: slotAfter,
		budget_snapshot: structuredClone(signals.budget),
		failure_packet_id: signals.failurePacket?.failure_packet_id ?? null,
		created_at: new Date().toISOString(),
	};
}

export function outcomeSignalsForDecisionV0C(decision: CompletionDecisionV0C): {
	status: "passed" | "failed" | "invalid" | "cancelled";
	failureClass: "agent" | "verifier" | "infrastructure" | "evidence" | "budget" | "user" | null;
	terminalReason: string;
} {
	switch (decision.reason) {
		case "verifier_passed":
			return { status: "passed", failureClass: null, terminalReason: "verifier_passed" };
		case "verifier_invalid":
			return { status: "invalid", failureClass: "verifier", terminalReason: "verifier_invalid" };
		case "infrastructure_blocked":
			return { status: "invalid", failureClass: "infrastructure", terminalReason: "infrastructure_blocked" };
		case "user_cancelled":
			return { status: "cancelled", failureClass: "user", terminalReason: "user_cancelled" };
		case "budget_exhausted":
		case "child_start_reserve_insufficient":
			return { status: "failed", failureClass: "budget", terminalReason: decision.reason };
		case "evidence_invalid":
		case "failure_packet_invalid":
			return { status: "invalid", failureClass: "evidence", terminalReason: decision.reason };
		default:
			return { status: "failed", failureClass: "agent", terminalReason: decision.reason };
	}
}

