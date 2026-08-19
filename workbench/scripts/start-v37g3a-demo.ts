import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { sha256 } from "../src/hash.ts";
import { ProjectProfileRegistryV36 } from "../src/project/registry-v36.ts";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";
import { InteractiveControlPlaneV36 } from "../src/v36/authority-v36.ts";
import { Goal3WorkbenchApplicationV35 } from "../src/webui/application-v35g3.ts";
import { WorkbenchApplicationV36G1 } from "../src/webui/application-v36g1.ts";
import { WorkbenchApplicationV37G3A } from "../src/webui/application-v37g3a.ts";
import { ProductServiceV37G3A } from "../src/v37/product-service-v37g3a.ts";
import { loadGoal3DemoProjectionV35 } from "../src/webui/projection-v35g3.ts";
import { createWorkbenchLoopbackServerV36G1 } from "../src/webui/server-v36g1.ts";

function argumentsFrom(argv: readonly string[]): { port: number; smoke: boolean } {
	const result = { port: 43_136, smoke: false };
	for (let index = 0; index < argv.length; index += 1) {
		if (argv[index] === "--smoke" && !result.smoke) { result.smoke = true; continue; }
		if (argv[index] === "--port" && argv[index + 1] !== undefined) {
			const value = Number(argv[index + 1]);
			if (!Number.isSafeInteger(value) || value < 0 || value > 65_535) throw new Error("V3.6 Goal 1 demo port is invalid");
			result.port = value;
			index += 1;
			continue;
		}
		throw new Error("V3.6 Goal 1 demo arguments are invalid");
	}
	return result;
}

const options = argumentsFrom(process.argv.slice(2));
const projectRoot = resolve(import.meta.dirname, "../..");
const runtimeRoot = resolve(projectRoot, ".runs/v3-6/g1/demo-runtime");
const legacyData = resolve(runtimeRoot, "legacy-data");
const legacyWorkspace = resolve(runtimeRoot, "legacy-workspace");
mkdirSync(legacyData, { recursive: true });
mkdirSync(legacyWorkspace, { recursive: true });
const legacyContext = resolve(legacyWorkspace, "context.txt");
if (!existsSync(legacyContext)) writeFileSync(legacyContext, "V3.6 Goal 1 keeps the accepted V3.5 inspector routes available.\n");

const registry = new ProjectProfileRegistryV36([{
	project_id: "v36-demo-parse-duration",
	display_name: "Parse duration demo",
	source_root: resolve(projectRoot, "fixtures/tasks/v0-a-parse-duration"),
	writable_paths: ["src/**", "test/**"],
	protected_paths: ["package.json"],
	supported_modes: ["inspect_only", "bounded_edit"],
	risk_notice: "Goal 1 uses a managed copy and deterministic Faux Pi. Project commands, Docker and Source apply are disabled.",
	execution_backend_profile_id: "docker-goal2-planned",
	provider_model_policy_id: "host-faux-zero-access",
	pi_native_skills: [{ id: "pi-native-demo", name: "Pi native Skill surface", description: "Descriptive read-only metadata; no Skill is installed or changed.", source: "pi_native", read_only: true }],
	harness_adaptations: [{ id: "harness-adaptation-demo", kind: "prompt_addendum", name: "Harness binding surface", status: "not_bound", read_only: true }],
	current_state: () => ({ state_digest: sha256("v36-goal1-demo-current-state") }),
}]);
const legacy = new Goal3WorkbenchApplicationV35({
	sessionService: new PersistentSessionServiceV35({ dataRoot: legacyData, projectId: "v36-demo-legacy", workspaceRoot: legacyWorkspace, workspaceId: "v36-demo-legacy-workspace" }),
	projection: loadGoal3DemoProjectionV35(resolve(projectRoot, "fixtures/v3-5/goal3-demo/projection.json")),
});
const v36 = new WorkbenchApplicationV36G1({ legacy, controlPlane: new InteractiveControlPlaneV36({ dataRoot: resolve(runtimeRoot, "v36-data"), registry }) });
const application = new WorkbenchApplicationV37G3A({ legacy: v36, product: new ProductServiceV37G3A(projectRoot) });
const loopback = createWorkbenchLoopbackServerV36G1(application);
const address = await loopback.start(options.port);
process.stdout.write(`${JSON.stringify({ schema_version: 1, event: "v37g3a_demo_started", host: address.host, port: address.port, url: address.url, mode: "deterministic_faux_zero_access", project_commands: 0, docker_project_command_executions: 0 })}\n`);
if (options.smoke) {
	await loopback.stop();
	process.stdout.write(`${JSON.stringify({ schema_version: 1, event: "v37g3a_demo_stopped", listener_count: 0 })}\n`);
}
