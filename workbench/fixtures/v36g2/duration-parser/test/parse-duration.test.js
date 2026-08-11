import assert from "node:assert/strict";
import test from "node:test";
import { parseDuration } from "../src/parse-duration.js";

test("parses the four frozen units", () => {
  assert.equal(parseDuration("0ms"), 0);
  assert.equal(parseDuration("15ms"), 15);
  assert.equal(parseDuration("2s"), 2_000);
  assert.equal(parseDuration("3m"), 180_000);
  assert.equal(parseDuration("4h"), 14_400_000);
});

test("accepts safe integer boundaries and rejects overflow", () => {
  assert.equal(parseDuration("9007199254740991ms"), Number.MAX_SAFE_INTEGER);
  assert.throws(() => parseDuration("9007199254740992ms"), /^Error: invalid duration$/);
  assert.throws(() => parseDuration("2501999792984h"), /^Error: invalid duration$/);
});

test("rejects malformed, signed, decimal and mixed-unit inputs", () => {
  for (const value of ["", "1", "ms", "+1s", "-1s", "1.5s", "1s2m", "01 s", " 1s", "1S", "Infinityms"]) {
    assert.throws(() => parseDuration(value), /^Error: invalid duration$/, value);
  }
});
