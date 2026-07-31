import assert from "node:assert/strict";
import { resolve } from "node:path";
import { inspectRunV0C } from "../src/inspect-v0c.ts";
import { createPiRunHandleV0C } from "../src/pi/pi-adapter-v0c.ts";
import { createRealExecutionAuthorityV0C, STAGE2_MAXIMUM_BUDGET_V0C } from "../src/pi/real-provider-route-v0c.ts";
import { runV0CProductSurface } from "../src/product-surface-v0c.ts";
import { executeV0CRun } from "../src/run-v0c.ts";

const projectRoot = resolve(import.meta.dirname, "../..");
const taskPath = "fixtures/manifests/v0-c-parse-duration-public.json";
const observe = "fixtures/manifests/v0-c-observe-only-faux.json";
const recover = "fixtures/manifests/v0-c-recover-once-faux.json";
const authoritative = {};

for (const [name, strategyPath, scenario] of [
	["observe_pass", observe, "observe_pass"],
	["recover_once_pass", recover, "recover_once_pass"],
	["recover_once_fail", recover, "recover_once_fail"],
]) {
	const run = await executeV0CRun({ projectRoot, taskPath, strategyPath, scenario });
	assert.ok(run.outcome, `${name} must commit`);
	const inspected = await inspectRunV0C(projectRoot, run.run_id);
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	authoritative[name] = { run_id: run.run_id, status: run.outcome.status, attempts: run.attempt_ids.length };
}
const fakeReal = await runV0CProductSurface({
	projectRoot,
	taskPath,
	strategyPath: "fixtures/manifests/v0-c-recover-once-deepseek-v4-flash.json",
	dryRun: false,
	scenario: "recover_once_pass",
	realExecution: {
		authority: createRealExecutionAuthorityV0C("deterministic_injected_test"),
		resolveCredential: async () => ({ credential_handle: Object.freeze({ kind: "non-secret-test-handle" }), real_credential_reads: 0 }),
		createHandle: (options) => createPiRunHandleV0C(options),
		budget: structuredClone(STAGE2_MAXIMUM_BUDGET_V0C),
	},
});
assert.equal(fakeReal.mode, "execution");
if (fakeReal.mode !== "execution") throw new Error("fake real Product Surface mode mismatch");
assert.equal(fakeReal.result.external_provider_calls, 0);
assert.equal(fakeReal.result.credential_reads, 0);
const fakeRealInspect = await inspectRunV0C(projectRoot, fakeReal.result.run_id);
assert.equal(fakeRealInspect.integrity_valid, true, fakeRealInspect.errors.join("; "));
authoritative.real_profile_injected_fake = {
	run_id: fakeReal.result.run_id,
	status: fakeReal.result.outcome?.status,
	attempts: fakeReal.result.attempt_ids.length,
};
process.stdout.write(`${JSON.stringify({ schema_version: 1, authoritative, external_provider_calls: 0, real_model_calls: 0 })}\n`);
