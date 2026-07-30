import assert from "node:assert/strict";
import test from "node:test";
import { scanPreterminalEvidenceV0B } from "../src/evidence/secret-scan.ts";

test("preterminal scanner reports only safe rule metadata for forbidden content", () => {
	const forbidden = "Bearer V0B_SYNTHETIC_SECRET_VALUE";
	const result = scanPreterminalEvidenceV0B({
		files: [],
		objects: [{ scope_label: "synthetic_probe", value: { authorization: forbidden } }],
	});
	assert.equal(result.status, "rejected");
	assert.equal(result.match_count, 1);
	assert.deepEqual(result.matches, [{ scope_label: "synthetic_probe", rule_id: "bearer_credential" }]);
	assert.doesNotMatch(JSON.stringify(result), /V0B_SYNTHETIC_SECRET_VALUE/);
});

test("scanner failure is explicit and cannot produce a passed scan result", () => {
	assert.throws(
		() =>
			scanPreterminalEvidenceV0B({
				files: [],
				objects: [],
				faultInjection: "scanner_error",
			}),
		/fixed scanner failure injection/,
	);
});
