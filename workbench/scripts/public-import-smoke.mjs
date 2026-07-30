import { AgentHarness, InMemorySessionStorage, JsonlSessionStorage, Session } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { createModels, fauxProvider } from "@earendil-works/pi-ai";

const models = createModels();
const faux = fauxProvider({ provider: "v0a-public-import-smoke" });
models.setProvider(faux.provider);
const session = new Session(new InMemorySessionStorage());
const env = new NodeExecutionEnv({ cwd: process.cwd(), shellEnv: {} });
if (typeof AgentHarness !== "function" || typeof JsonlSessionStorage !== "function" || !faux.getModel() || !session || !env) {
	throw new Error("public import smoke failed");
}
process.stdout.write("public Pi emitted imports resolved: AgentHarness, Session, memory/JSONL storage, NodeExecutionEnv, Faux\n");
