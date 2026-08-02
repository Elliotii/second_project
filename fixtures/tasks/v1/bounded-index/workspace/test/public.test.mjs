import assert from "node:assert/strict";
import test from "node:test";
import { boundedAt } from "../src/subject.ts";
test("first and last indexes", () => { assert.equal(boundedAt(["a", "b"], 0), "a"); assert.equal(boundedAt(["a", "b"], 1), "b"); });
