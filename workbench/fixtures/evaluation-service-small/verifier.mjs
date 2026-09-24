import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const workspace = process.env.V1_WORKSPACE;
if (!workspace) throw new Error("V1_WORKSPACE is required");
const { answer } = await import(pathToFileURL(resolve(workspace, "src/subject.ts")));
const passed = answer() === 42;
console.log(JSON.stringify({
	schema_version: 1,
	verifier_id: "evaluation-service-small-verifier",
	status: passed ? "passed" : "failed",
	summary: passed ? "answer returned 42" : "answer did not return 42",
}));
process.exitCode = passed ? 0 : 1;
