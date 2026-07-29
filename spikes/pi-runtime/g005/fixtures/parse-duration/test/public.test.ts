import assert from "node:assert/strict";
import test from "node:test";
import { parseDuration } from "../src/parse-duration.ts";

test("converts the three supported units", () => {
	assert.equal(parseDuration("250ms"), 250);
	assert.equal(parseDuration("2s"), 2_000);
	assert.equal(parseDuration("3m"), 180_000);
});

test("trims surrounding whitespace", () => {
	assert.equal(parseDuration("  7s\n"), 7_000);
});

test("rejects several malformed forms", () => {
	for (const input of ["", "-1s", "+1s", "1.5s", "10", "10h", "s"]) {
		assert.throws(() => parseDuration(input), undefined, input);
	}
});
