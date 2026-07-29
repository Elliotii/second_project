import { AgentHarness, JsonlSessionRepo, Session } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";

const resolved = {
	root: import.meta.resolve("@earendil-works/pi-agent-core"),
	node: import.meta.resolve("@earendil-works/pi-agent-core/node"),
};
if (!resolved.root.replaceAll("\\", "/").endsWith("/packages/agent/dist/index.js")) {
	throw new Error(`root import did not resolve to emitted dist: ${resolved.root}`);
}
if (!resolved.node.replaceAll("\\", "/").endsWith("/packages/agent/dist/node.js")) {
	throw new Error(`node import did not resolve to emitted dist: ${resolved.node}`);
}
for (const [name, value] of Object.entries({ AgentHarness, JsonlSessionRepo, Session, NodeExecutionEnv })) {
	if (typeof value !== "function") throw new Error(`${name} is not a runtime constructor`);
}
console.log(JSON.stringify({ resolved, exports: ["AgentHarness", "JsonlSessionRepo", "Session", "NodeExecutionEnv"] }));
