import assert from "node:assert/strict";
import test from "node:test";
import { stableUnique } from "../src/subject.ts";
test("preserves first occurrence order", () => { assert.deepEqual(stableUnique(["beta", "alpha", "beta"]), ["beta", "alpha"]); });
