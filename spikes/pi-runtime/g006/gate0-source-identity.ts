import { resolve } from "node:path";
import { createSourceIdentity } from "./provenance.ts";
import { writeJson } from "./runtime-utils.ts";

const projectRoot = resolve(process.argv[2] ?? (() => { throw new Error("project root argument is required"); })());
const sourceIdentity = createSourceIdentity(resolve(projectRoot, "spikes/pi-runtime/g006"));

writeJson(resolve(projectRoot, ".runs/g006/preflight/gate0-source-identity.json"), {
	schemaVersion: 1,
	checkpoint: "G006 Stage 1 Gate 0",
	credentialLoaded: false,
	externalProviderCallsAtWrite: 0,
	sourceIdentity,
});

console.log(JSON.stringify({
	fileCount: sourceIdentity.fileCount,
	treeDigest: sourceIdentity.treeDigest,
	credentialLoaded: false,
	externalProviderCallsAtWrite: 0,
}, null, 2));
