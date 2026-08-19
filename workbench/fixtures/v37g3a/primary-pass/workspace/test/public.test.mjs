import assert from "node:assert/strict";
import test from "node:test";
import { parseDuration } from "../src/subject.ts";
test("declared duration units", () => { assert.equal(parseDuration("500ms"), 500); assert.equal(parseDuration("2s"), 2000); });
