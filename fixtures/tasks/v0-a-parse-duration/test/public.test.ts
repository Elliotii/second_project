import assert from "node:assert/strict";
import test from "node:test";
import { parseDuration } from "../src/parse-duration.ts";

test("parses supported duration units", () => {
	assert.equal(parseDuration("250ms"), 250);
	assert.equal(parseDuration("2s"), 2_000);
	assert.equal(parseDuration("3m"), 180_000);
	assert.equal(parseDuration("0ms"), 0);
	assert.equal(parseDuration("  7s\n"), 7_000);
});

test("rejects malformed and trailing characters", () => {
	for (const input of ["", "-1s", "+1s", "1.5s", "10", "10h", "s", "2seconds", "10ms later"]) {
		assert.throws(() => parseDuration(input), /invalid duration/, input);
	}
});

test("rejects unsafe integer conversions", () => {
	assert.throws(() => parseDuration("9007199254740992ms"), /unsafe duration/);
	assert.throws(() => parseDuration("9007199254741m"), /unsafe duration/);
});
