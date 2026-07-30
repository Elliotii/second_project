import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const VERIFIER_ID = "v0-b-parse-duration-hidden-v1";

function emit(status, summary) {
	process.stdout.write(`${JSON.stringify({ schema_version: 1, verifier_id: VERIFIER_ID, status, summary })}\n`);
}

try {
	const workspace = process.env.V0B_WORKSPACE;
	if (!workspace) throw new Error("V0B_WORKSPACE is required");
	const moduleUrl = pathToFileURL(resolve(workspace, "src/parse-duration.ts"));
	moduleUrl.searchParams.set("v0b_verifier", "1");
	const loaded = await import(moduleUrl.href);
	if (typeof loaded.parseDuration !== "function") throw new Error("parseDuration export is missing");
	const parseDuration = loaded.parseDuration;

	for (const [input, expected] of [
		["1ms", 1],
		["001s", 1_000],
		[" 42m ", 2_520_000],
		["9007199254740ms", 9_007_199_254_740],
	]) {
		assert.equal(parseDuration(input), expected, input);
	}
	for (const input of ["1msx", "1 s", "1m\nextra", "0x10ms", "NaNms", "Infinitys", "9007199254740992ms", "9007199254741m"]) {
		assert.throws(() => parseDuration(input), input.includes("900719") ? /unsafe duration/ : /invalid duration/, input);
	}
	emit("passed", "hidden parse-duration acceptance passed");
} catch (error) {
	const summary = error instanceof Error ? error.message : String(error);
	emit("failed", summary.slice(0, 2_000));
	process.exitCode = 1;
}
