import assert from "node:assert/strict";
import test from "node:test";
import { runGates } from "./driver.ts";

test("G003 Gates B-E: deterministic baseline, one-cycle recovery, ordering, and fairness", { timeout: 45_000 }, async () => {
	const result = await runGates();
	assert.equal(result.baseline.initialVerification.status, "failed");
	assert.equal(result.baseline.finalVerification.status, "failed");
	assert.equal(result.baseline.providerCallCount, 2);
	assert.equal(result.candidate.initialVerification.status, "failed");
	assert.equal(result.candidate.finalVerification.status, "passed");
	assert.equal(result.candidate.providerCallCount, 4);
	assert.equal(result.baselineDigest, result.candidateDigest);
});
