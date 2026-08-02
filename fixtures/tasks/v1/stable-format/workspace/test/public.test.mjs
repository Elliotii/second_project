import assert from "node:assert/strict";
import test from "node:test";
import { stableFormat } from "../src/subject.ts";
test("lexical key order", () => { assert.equal(stableFormat({ z: "2", a: "1" }), '{"a":"1","z":"2"}'); });
