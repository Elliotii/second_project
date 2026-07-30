import assert from "node:assert/strict";
import test from "node:test";
import { buildOutcomeV0B, type OutcomeSignalsV0B } from "../src/outcome/builder.ts";
import { fauxSequenceHardBoundV0B } from "../src/pi/pi-adapter-v0b.ts";

function signals(patch: Partial<OutcomeSignalsV0B> = {}): OutcomeSignalsV0B {
	return {
		runId: "run-outcome",
		attemptId: "attempt-outcome",
		evidenceValid: true,
		verifierStatus: "passed",
		agentTerminalReason: "assistant_final",
		evidenceIndexRef: "evidence-index.json",
		...patch,
	};
}

test("Outcome Builder implements the accepted causal precedence", () => {
	const cases: Array<[Partial<OutcomeSignalsV0B>, string, string | null]> = [
		[{ evidenceValid: false, verifierStatus: "invalid", infrastructureBlocked: true, userCancelled: true, budgetExhausted: true }, "invalid", "evidence"],
		[{ verifierStatus: "invalid", infrastructureBlocked: true, userCancelled: true, budgetExhausted: true }, "invalid", "verifier"],
		[{ infrastructureBlocked: true, userCancelled: true, budgetExhausted: true }, "invalid", "infrastructure"],
		[{ userCancelled: true, budgetExhausted: true }, "cancelled", "user"],
		[{ budgetExhausted: true }, "failed", "budget"],
		[{ verifierStatus: "passed" }, "passed", null],
		[{ verifierStatus: "failed" }, "failed", "agent"],
	];
	for (const [patch, status, failureClass] of cases) {
		const outcome = buildOutcomeV0B(signals(patch));
		assert.equal(outcome.status, status);
		assert.equal(outcome.failure_class, failureClass);
		assert.equal(outcome.attempt_count, 1);
		assert.equal(outcome.recovery_triggered, false);
	}
});

test("fixed Faux routes have preflight-provable provider and Tool hard bounds", () => {
	assert.deepEqual(fauxSequenceHardBoundV0B("repair"), { provider_requests: 8, tool_calls: 7 });
	assert.deepEqual(fauxSequenceHardBoundV0B("no_repair"), { provider_requests: 1, tool_calls: 0 });
	assert.ok(fauxSequenceHardBoundV0B("repair").provider_requests <= 12);
	assert.ok(fauxSequenceHardBoundV0B("repair").tool_calls <= 12);
});
