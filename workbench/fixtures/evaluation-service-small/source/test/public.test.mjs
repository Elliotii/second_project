import assert from "node:assert/strict";
import test from "node:test";
import { answer } from "../src/subject.ts";

test("answer returns 42", () => assert.equal(answer(), 42));
