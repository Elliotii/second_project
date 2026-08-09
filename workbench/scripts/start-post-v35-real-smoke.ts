import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { readAdaptationLineageSafeV35, readGoal25ComparisonSafeV35, readStateHistorySafeV35, readV2RecoverySafeV35 } from "../src/read-model/workbench-v35g3.ts";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";
import { createDeferredCredentialFileResolverV35, createPostV35RealSmokeTurnExecutor, loadPostV35RealSmokeAuthority } from "../src/session/real-smoke-turn-v35.ts";
import { Goal3WorkbenchApplicationV35 } from "../src/webui/application-v35g3.ts";
import { loadGoal3DemoProjectionV35 } from "../src/webui/projection-v35g3.ts";
import { createGoal3LoopbackServerV35 } from "../src/webui/server-v35g3.ts";

interface ArgumentsPostV35 {
	port: number;
	dataRoot: string;
	workspaceRoot: string;
	authority: string;
	credentialFile: string;
	pairRoot?: string;
	v2Root?: string;
	v3Root?: string;
	stateRoot?: string;
	stateProjectId?: string;
}

function parseArguments(argv: readonly string[]): ArgumentsPostV35 {
	const values: Partial<ArgumentsPostV35> = { port: 43135 };
	const names: Record<string, keyof ArgumentsPostV35> = { "--port": "port", "--data-root": "dataRoot", "--workspace-root": "workspaceRoot", "--authority": "authority", "--credential-file": "credentialFile", "--pair-root": "pairRoot", "--v2-root": "v2Root", "--v3-root": "v3Root", "--state-root": "stateRoot", "--state-project-id": "stateProjectId" };
	if (argv.length % 2 !== 0) throw new Error("real-smoke launcher arguments are invalid");
	for (let index = 0; index < argv.length; index += 2) {
		const key = names[argv[index] ?? ""];
		const value = argv[index + 1];
		if (!key || value === undefined || values[key] !== undefined) throw new Error("real-smoke launcher arguments are invalid");
		if (key === "port") {
			const port = Number(value);
			if (!Number.isSafeInteger(port) || port < 0 || port > 65_535) throw new Error("real-smoke port is invalid");
			values.port = port;
		} else {
			(values as Record<string, string | number | undefined>)[key] = value;
		}
	}
	if (values.dataRoot === undefined || values.workspaceRoot === undefined || values.authority === undefined || values.credentialFile === undefined) throw new Error("real-smoke host arguments are incomplete");
	if ((values.stateRoot === undefined) !== (values.stateProjectId === undefined)) throw new Error("State root and State project ID must be configured together");
	return values as ArgumentsPostV35;
}

const options = parseArguments(process.argv.slice(2));
const projectRoot = resolve(import.meta.dirname, "../..");
const authority = loadPostV35RealSmokeAuthority(options.authority);
mkdirSync(resolve(options.dataRoot), { recursive: true });
const projection = structuredClone(loadGoal3DemoProjectionV35(resolve(projectRoot, "fixtures/v3-5/goal3-demo/projection.json")));
projection.overview = { product: "Persistent & Inspectable Adaptive Harness Workbench", mode: "real_product_smoke", notice: "Host-authorized bounded real product smoke mode. Browser inputs cannot select Provider, Credential, roots, commands, Verifier or State." };
if (options.pairRoot) projection.goal25_comparison = readGoal25ComparisonSafeV35({ pairRoot: options.pairRoot });
if (options.v2Root) projection.v2_recovery = readV2RecoverySafeV35({ sourceRoot: options.v2Root });
if (options.v3Root) projection.adaptation = readAdaptationLineageSafeV35({ sourceRoot: options.v3Root });
if (options.stateRoot && options.stateProjectId) projection.state_history = await readStateHistorySafeV35({ stateRoot: options.stateRoot, projectId: options.stateProjectId });
const executor = createPostV35RealSmokeTurnExecutor({ authorized: true, authority, credentialResolver: createDeferredCredentialFileResolverV35(options.credentialFile) });
const sessionService = new PersistentSessionServiceV35({ dataRoot: options.dataRoot, projectId: authority.project_id, workspaceRoot: options.workspaceRoot, workspaceId: authority.workspace_id, turnExecutor: executor });
const application = new Goal3WorkbenchApplicationV35({ sessionService, projection });
const server = createGoal3LoopbackServerV35(application);
const address = await server.start(options.port);
process.stdout.write(`${JSON.stringify({ schema_version: 1, event: "post_v35_real_smoke_started", host: address.host, port: address.port, url: address.url, mode: "real_product_smoke", authority_digest: authority.authority_digest })}\n`);
