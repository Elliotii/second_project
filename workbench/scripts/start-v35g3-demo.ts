import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";
import { readAdaptationLineageSafeV35, readGoal25ComparisonSafeV35, readStateHistorySafeV35, readV2RecoverySafeV35 } from "../src/read-model/workbench-v35g3.ts";
import { Goal3WorkbenchApplicationV35 } from "../src/webui/application-v35g3.ts";
import { loadGoal3DemoProjectionV35 } from "../src/webui/projection-v35g3.ts";
import { createGoal3LoopbackServerV35 } from "../src/webui/server-v35g3.ts";

interface ArgumentsV35G3 {
	port: number;
	dataRoot: string;
	workspaceRoot: string;
	pairRoot?: string;
	v2Root?: string;
	v3Root?: string;
	stateRoot?: string;
	stateProjectId?: string;
}

function parseArguments(argv: readonly string[]): ArgumentsV35G3 {
	const projectRoot = resolve(import.meta.dirname, "../..");
	const result: ArgumentsV35G3 = { port: 43135, dataRoot: resolve(projectRoot, ".runs/v3-5-g3/demo-runtime/data"), workspaceRoot: resolve(projectRoot, ".runs/v3-5-g3/demo-runtime/workspace") };
	const names: Record<string, keyof ArgumentsV35G3> = { "--port": "port", "--data-root": "dataRoot", "--workspace-root": "workspaceRoot", "--pair-root": "pairRoot", "--v2-root": "v2Root", "--v3-root": "v3Root", "--state-root": "stateRoot", "--state-project-id": "stateProjectId" };
	for (let index = 0; index < argv.length; index += 2) {
		const key = names[argv[index] ?? ""];
		const value = argv[index + 1];
		if (!key || value === undefined) throw new Error("Goal 3 demo arguments are invalid");
		if (key === "port") {
			const port = Number(value);
			if (!Number.isSafeInteger(port) || port < 0 || port > 65_535) throw new Error("Goal 3 demo port is invalid");
			result.port = port;
		} else {
			(result as unknown as Record<string, string>)[key] = value;
		}
	}
	if ((result.stateRoot === undefined) !== (result.stateProjectId === undefined)) throw new Error("State root and State project ID must be configured together");
	return result;
}

const options = parseArguments(process.argv.slice(2));
const projectRoot = resolve(import.meta.dirname, "../..");
const projection = loadGoal3DemoProjectionV35(resolve(projectRoot, "fixtures/v3-5/goal3-demo/projection.json"));
if (options.pairRoot) projection.goal25_comparison = readGoal25ComparisonSafeV35({ pairRoot: options.pairRoot });
if (options.v2Root) projection.v2_recovery = readV2RecoverySafeV35({ sourceRoot: options.v2Root });
if (options.v3Root) projection.adaptation = readAdaptationLineageSafeV35({ sourceRoot: options.v3Root });
if (options.stateRoot && options.stateProjectId) projection.state_history = await readStateHistorySafeV35({ stateRoot: options.stateRoot, projectId: options.stateProjectId });

mkdirSync(options.workspaceRoot, { recursive: true });
mkdirSync(options.dataRoot, { recursive: true });
const contextPath = resolve(options.workspaceRoot, "demo-context.txt");
if (!existsSync(contextPath)) writeFileSync(contextPath, "Bounded deterministic Goal 3 demo workspace.\n", "utf8");
const sessionService = new PersistentSessionServiceV35({ dataRoot: options.dataRoot, projectId: "v35-goal3-demo", workspaceRoot: options.workspaceRoot, workspaceId: "goal3-demo-workspace" });
const application = new Goal3WorkbenchApplicationV35({ sessionService, projection });
const server = createGoal3LoopbackServerV35(application);
const address = await server.start(options.port);
process.stdout.write(`${JSON.stringify({ schema_version: 1, event: "v35g3_demo_started", host: address.host, port: address.port, url: address.url, mode: "deterministic_faux_demo" })}\n`);
