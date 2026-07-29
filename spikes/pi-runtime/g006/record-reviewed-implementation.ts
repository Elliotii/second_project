import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createSourceIdentity, readProjectGitIdentity } from "./provenance.ts";
import { writeJson } from "./runtime-utils.ts";

const projectRoot = resolve(import.meta.dirname, "../../..");
const sourceRoot = resolve(projectRoot, "spikes/pi-runtime/g006");
const attemptRoot = resolve(projectRoot, ".runs/g006/attempt-001");
const sourceIdentity = createSourceIdentity(sourceRoot);
const gitIdentity = readProjectGitIdentity(projectRoot, sourceIdentity);

assert.equal(gitIdentity.trackedWorktreeCleanExceptReference, true, "root must be clean except accepted reference tree");
assert.equal(gitIdentity.sourceInventoryMatchesTrackedFiles, true, "tracked G006 inventory differs from filesystem identity");
assert.equal(existsSync(attemptRoot), false, "attempt root must not exist before reviewed identity is recorded");

const reviewed = {
	schemaVersion: 1,
	goal: "G006",
	projectCommit: gitIdentity.head,
	sourceTreeDigest: sourceIdentity.treeDigest,
	sourceFileCount: sourceIdentity.fileCount,
	trackedSourceFileCount: gitIdentity.trackedG006Files.length,
	providerCallsAtWrite: 0,
	recordedAt: new Date().toISOString(),
};

writeJson(resolve(projectRoot, ".runs/g006/preflight/reviewed-implementation.json"), reviewed);
console.log(JSON.stringify(reviewed));
