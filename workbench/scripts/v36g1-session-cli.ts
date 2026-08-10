import { resolve } from "node:path";
import { ProjectProfileRegistryV36 } from "../src/project/registry-v36.ts";
import { InteractiveControlPlaneV36 } from "../src/v36/authority-v36.ts";

function argumentsFrom(argv: readonly string[]): Record<string, string> {
	if (argv.length < 1 || (argv[0] !== "create" && argv[0] !== "continue") || (argv.length - 1) % 2 !== 0) throw new Error("V3.6 Goal 1 Session CLI arguments are invalid");
	const values: Record<string, string> = { action: argv[0] };
	for (let index = 1; index < argv.length; index += 2) {
		const key = argv[index];
		const value = argv[index + 1];
		if (!key?.startsWith("--") || value === undefined || key in values) throw new Error("V3.6 Goal 1 Session CLI arguments are invalid");
		values[key.slice(2)] = value;
	}
	for (const required of ["data-root", "source-root", "state-digest", "task-text"]) if (!values[required]) throw new Error(`V3.6 Goal 1 Session CLI is missing --${required}`);
	if (values.action === "continue" && !values["session-id"]) throw new Error("V3.6 Goal 1 Session CLI continue requires --session-id");
	return values;
}

const input = argumentsFrom(process.argv.slice(2));
const registry = new ProjectProfileRegistryV36([{
	project_id: "v36-cross-process-project",
	display_name: "V3.6 cross-process project",
	source_root: resolve(input["source-root"]!),
	writable_paths: [],
	protected_paths: [],
	supported_modes: ["inspect_only"],
	risk_notice: "Deterministic cross-process persistence proof; no project command is available.",
	execution_backend_profile_id: "docker-goal2-planned",
	provider_model_policy_id: "host-faux-zero-access",
	pi_native_skills: [],
	harness_adaptations: [],
	current_state: () => ({ state_digest: input["state-digest"]! }),
}]);
const plane = new InteractiveControlPlaneV36({ dataRoot: resolve(input["data-root"]!), registry });
const session = await plane.submit({ project_id: "v36-cross-process-project", requested_mode: "inspect_only", task_text: input["task-text"]!, ...(input["session-id"] ? { session_id: input["session-id"] } : {}), ...(input.title ? { title: input.title } : {}) });
process.stdout.write(`${JSON.stringify(session)}\n`);
