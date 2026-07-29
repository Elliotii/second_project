import assert from "node:assert/strict";
import { createModels } from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";
import { G005_TOOL_NAMES, createG005Tools } from "./tools.ts";
import { DEEPSEEK_MODEL } from "./model.ts";
import { writeJson } from "./runtime-utils.ts";

const provider = deepseekProvider();
const models = createModels();
models.setProvider(provider);
const tools = createG005Tools();
const credentialConfigured = (await models.checkAuth("deepseek")) !== undefined;

assert.equal(provider.id, "deepseek");
assert.equal(provider.name, "DeepSeek");
assert.equal(provider.baseUrl, "https://api.deepseek.com");
assert.equal(DEEPSEEK_MODEL.id, "deepseek-v4-flash");
assert.equal(DEEPSEEK_MODEL.maxTokens, 8_192);
assert.equal(DEEPSEEK_MODEL.compat?.maxTokensField, "max_tokens");
assert.equal(DEEPSEEK_MODEL.compat?.thinkingFormat, "deepseek");
assert.deepEqual(tools.map((tool) => tool.name), [...G005_TOOL_NAMES]);
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
};
writeJson(".runs/g005/evidence/gates/gate-a.json", gate);
assert.equal(credentialConfigured, true, "DEEPSEEK_API_KEY is not configured");
console.log(JSON.stringify({ gate: "A", status: "passed", credential_configured: true, providerCalls: 0 }));
