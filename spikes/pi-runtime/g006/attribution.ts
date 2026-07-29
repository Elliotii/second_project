import type { CycleCounters } from "./observer.ts";

export type G006FailureClassification =
	| "setup"
	| "external_service"
	| "instrumentation_evidence"
	| "fairness_provenance"
	| "route"
	| "task_outcome";

export type G006Disposition =
	| "PASS_REAL_MODEL_FEASIBILITY"
	| "FAIL_REAL_MODEL_ROUTE"
	| "BLOCKED_G006_SETUP_OR_EXTERNAL_SERVICE"
	| "INVALID_G006_EVIDENCE";

export type CycleAssessment =
	| { ok: true }
	| { ok: false; classification: "instrumentation_evidence" | "route"; message: string };

export function assessCycleCounters(counters: CycleCounters, requireTool: boolean): CycleAssessment {
	if (counters.providerRequests < 1) {
		return { ok: false, classification: "route", message: "cycle made no provider request" };
	}
	if (counters.providerResponses !== counters.providerRequests) {
		return {
			ok: false,
			classification: "instrumentation_evidence",
			message: "subscriber provider-response count does not equal provider-request count",
		};
	}
	if (counters.assistantMessages !== counters.providerRequests) {
		return {
			ok: false,
			classification: "instrumentation_evidence",
			message: "assistant-message count does not equal provider-request count",
		};
	}
	if (counters.successfulAssistantMessages < 1) {
		return { ok: false, classification: "route", message: "cycle produced no successful assistant message" };
	}
	if (counters.responseIdsPresent !== counters.successfulAssistantMessages) {
		return {
			ok: false,
			classification: "instrumentation_evidence",
			message: "successful assistant message is missing response identity",
		};
	}
	if (requireTool && counters.toolStarts < 1) {
		return { ok: false, classification: "route", message: "initial cycle produced no tool call" };
	}
	if (counters.toolStarts !== counters.toolEnds) {
		return { ok: false, classification: "route", message: "tool start/end counts differ" };
	}
	if (counters.settled !== 1) {
		return { ok: false, classification: "route", message: "cycle did not settle exactly once" };
	}
	return { ok: true };
}

export function classifyErrorMessage(message: string): "external_service" | "route" {
	return /401|402|403|404|408|409|429|5\d\d|timeout|network|socket|rate|quota|balance|service|model.not.found/i.test(
		message,
	)
		? "external_service"
		: "route";
}

export function classifyVerifierStatus(status: "passed" | "failed"): "task_outcome" | undefined {
	return status === "failed" ? "task_outcome" : undefined;
}

export function dispositionForClassification(classification: G006FailureClassification): G006Disposition {
	if (classification === "setup" || classification === "external_service") {
		return "BLOCKED_G006_SETUP_OR_EXTERNAL_SERVICE";
	}
	if (classification === "route") return "FAIL_REAL_MODEL_ROUTE";
	if (classification === "instrumentation_evidence" || classification === "fairness_provenance") {
		return "INVALID_G006_EVIDENCE";
	}
	return "PASS_REAL_MODEL_FEASIBILITY";
}
