import { AgentHarness, InMemorySessionStorage, Session } from "@earendil-works/pi-agent-core";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";

const resolved = {
	agent: import.meta.resolve("@earendil-works/pi-agent-core"),
	deepseek: import.meta.resolve("@earendil-works/pi-ai/providers/deepseek"),
};
if (!resolved.agent.replaceAll("\\", "/").endsWith("/packages/agent/dist/index.js")) {
	throw new Error(`agent import did not resolve to emitted dist: ${resolved.agent}`);
}
if (!resolved.deepseek.replaceAll("\\", "/").endsWith("/packages/ai/dist/providers/deepseek.js")) {
	throw new Error(`DeepSeek import did not resolve to emitted dist: ${resolved.deepseek}`);
}
for (const [name, value] of Object.entries({ AgentHarness, InMemorySessionStorage, Session, deepseekProvider })) {
	if (typeof value !== "function") throw new Error(`${name} is not a public runtime function`);
}
console.log(JSON.stringify({ resolved, publicExports: Object.keys({ AgentHarness, InMemorySessionStorage, Session, deepseekProvider }) }));
