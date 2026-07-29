import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createModels } from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";
import { G006_TOOL_NAMES, createG006Tools } from "./tools.ts";
import { DEEPSEEK_MODEL } from "./model.ts";
import { createSourceIdentity, readProjectGitIdentity } from "./provenance.ts";
import { writeJson } from "./runtime-utils.ts";

const projectRoot = resolve(import.meta.dirname, "../../..");
const sourceIdentity = createSourceIdentity(resolve(projectRoot, "spikes/pi-runtime/g006"));
const gitIdentity = readProjectGitIdentity(projectRoot, sourceIdentity);
const reviewedIdentityPath = resolve(projectRoot, ".runs/g006/preflight/reviewed-implementation.json");
assert.equal(existsSync(reviewedIdentityPath), true, "reviewed implementation identity is missing");
const reviewedIdentity = JSON.parse(readFileSync(reviewedIdentityPath, "utf8")) as {
	projectCommit?: unknown;
	sourceTreeDigest?: unknown;
	providerCallsAtWrite?: unknown;
};
assert.equal(gitIdentity.trackedWorktreeCleanExceptReference, true);
assert.equal(gitIdentity.sourceInventoryMatchesTrackedFiles, true);
assert.equal(reviewedIdentity.projectCommit, gitIdentity.head);
assert.equal(reviewedIdentity.sourceTreeDigest, sourceIdentity.treeDigest);
assert.equal(reviewedIdentity.providerCallsAtWrite, 0);
assert.equal(existsSync(resolve(projectRoot, ".runs/g006/attempt-001")), false);

const provider = deepseekProvider();
const models = createModels();
models.setProvider(provider);
const tools = createG006Tools();
const credentialConfigured = (await models.checkAuth("deepseek")) !== undefined;

assert.equal(provider.id, "deepseek");
assert.equal(provider.name, "DeepSeek");
assert.equal(provider.baseUrl, "https://api.deepseek.com");
assert.equal(DEEPSEEK_MODEL.id, "deepseek-v4-flash");
assert.equal(DEEPSEEK_MODEL.maxTokens, 8_192);
assert.equal(DEEPSEEK_MODEL.compat?.maxTokensField, "max_tokens");
assert.equal(DEEPSEEK_MODEL.compat?.thinkingFormat, "deepseek");
assert.deepEqual(tools.map((tool) => tool.name), [...G006_TOOL_NAMES]);
for (const tool of tools) {
	const properties = (tool.parameters as { properties?: Record<string, unknown> }).properties ?? {};
	assert.equal("path" in properties, false, `${tool.name} must not expose a path parameter`);
	assert.equal("command" in properties, false, `${tool.name} must not expose a command parameter`);
}

const gate = {
	gate: "A",
	status: credentialConfigured ? "passed" : "failed",
	timestamp: new Date().toISOString(),
	credential_configured: credentialConfigured,
	provider: { id: provider.id, name: provider.name, baseUrl: provider.baseUrl, allowedCredentialKey: "DEEPSEEK_API_KEY" },
	model: {
		id: DEEPSEEK_MODEL.id,
		maxTokens: DEEPSEEK_MODEL.maxTokens,
		thinkingLevel: "high",
	},
	tools: tools.map((tool) => ({ name: tool.name, parameterKeys: Object.keys((tool.parameters as { properties?: object }).properties ?? {}) })),
	providerCalls: 0,
	projectCommit: gitIdentity.head,
	sourceTreeDigest: sourceIdentity.treeDigest,
};
writeJson(resolve(projectRoot, ".runs/g006/preflight/gates/gate-a-stage2.json"), gate);
assert.equal(credentialConfigured, true, "DEEPSEEK_API_KEY is not configured");
console.log(JSON.stringify({ gate: "A", status: "passed", credential_configured: true, providerCalls: 0 }));
