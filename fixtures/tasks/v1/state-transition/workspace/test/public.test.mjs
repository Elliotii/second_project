import assert from "node:assert/strict";
import test from "node:test";
import { canSettle } from "../src/subject.ts";
test("public transition examples", () => { assert.equal(canSettle("running"), true); assert.equal(canSettle("failed"), false); assert.equal(canSettle("settled"), false); });
