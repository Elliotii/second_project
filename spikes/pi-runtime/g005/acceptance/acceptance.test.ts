import assert from "node:assert/strict";
import test from "node:test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const workspace = process.env.G005_WORKSPACE;
if (!workspace) throw new Error("G005_WORKSPACE is required");
const sourceUrl = pathToFileURL(resolve(workspace, "src/parse-duration.ts"));
const loaded = (await import(`${sourceUrl.href}?acceptance=${Date.now()}`)) as {
	parseDuration(input: string): number;
};

test("rejects trailing and internal characters rather than accepting a prefix", () => {
	for (const input of ["1second", "10msjunk", "2m later", "1 s", "1ms\nextra"]) {
		assert.throws(() => loaded.parseDuration(input), input);
	}
});

test("rejects unsafe source and scaled values", () => {
	for (const input of ["9007199254740992ms", "9007199254741s", "150119987580m"]) {
		assert.throws(() => loaded.parseDuration(input), input);
	}
});

test("accepts safe boundaries and zero", () => {
	assert.equal(loaded.parseDuration("0ms"), 0);
	assert.equal(loaded.parseDuration("9007199254740991ms"), Number.MAX_SAFE_INTEGER);
	assert.equal(loaded.parseDuration("9007199254740s"), 9_007_199_254_740_000);
});
