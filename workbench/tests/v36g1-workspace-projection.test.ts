import assert from "node:assert/strict";
import { mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { sha256 } from "../src/hash.ts";
import { ProjectProfileRegistryV36 } from "../src/project/registry-v36.ts";
import { InteractiveControlPlaneV36 } from "../src/v36/authority-v36.ts";
import { V36_WORKSPACE_LIMITS } from "../src/workspace/managed-copy-v36.ts";
import { PROJECT_ROOT } from "./helpers.ts";

function fixture(label: string) {
	const root = resolve(PROJECT_ROOT, ".runs/v3-6/g1/tests", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	const source = resolve(root, "source");
	const data = resolve(root, "data");
	mkdirSync(resolve(source, "src"), { recursive: true });
	mkdirSync(data, { recursive: true });
	writeFileSync(resolve(source, "src/index.ts"), "export const value = 1;\n");
	writeFileSync(resolve(source, "README.md"), "# Managed preview\n");
	const registry = new ProjectProfileRegistryV36([{
		project_id: "preview-project", display_name: "Preview project", source_root: source, writable_paths: ["src/**"], protected_paths: ["README.md"], supported_modes: ["inspect_only", "bounded_edit"], risk_notice: "Read-only preview of the managed copy.", execution_backend_profile_id: "docker-goal2-planned", provider_model_policy_id: "host-faux-policy",
		pi_native_skills: [{ id: "native-skill", name: "Native Skill", description: "Loaded by Pi and shown read-only.", source: "pi_native", read_only: true }],
		harness_adaptations: [{ id: "harness-skill", kind: "adaptive_skill", name: "Harness Skill binding", status: "active", read_only: true }],
		current_state: () => ({ state_digest: sha256("preview-state") }),
	}]);
	return { root, source, data, plane: new InteractiveControlPlaneV36({ dataRoot: data, registry }) };
}

test("managed Workspace tree and text preview are bounded, read-only and path/reparse/binary safe", async () => {
	const value = fixture("workspace-preview");
	const session = await value.plane.submit({ project_id: "preview-project", requested_mode: "inspect_only", task_text: "Inspect files" });
	const tree = value.plane.workspaceTree(session.session_id);
	assert.equal(tree.managed_copy, true);
	assert.equal(tree.read_only_preview, true);
	assert.deepEqual(tree.entries.filter((entry) => entry.kind === "file").map((entry) => entry.path), ["README.md", "src/index.ts"]);
	assert.doesNotMatch(JSON.stringify(tree), /[A-Za-z]:[\\/]|Bearer\s+|authorization/i);
	const before = readFileSync(resolve(value.data, "sessions", session.session_id, "workspace", "src/index.ts"), "utf8");
	const preview = value.plane.workspaceFile(session.session_id, "src/index.ts");
	assert.equal(preview.text, before);
	assert.equal(preview.read_only, true);
	assert.equal(readFileSync(resolve(value.data, "sessions", session.session_id, "workspace", "src/index.ts"), "utf8"), before);
	assert.throws(() => value.plane.workspaceFile(session.session_id, "../source/src/index.ts"), /path is invalid|unbounded/);

	const workspace = resolve(value.data, "sessions", session.session_id, "workspace");
	writeFileSync(resolve(workspace, "binary.bin"), Buffer.from([0, 1, 2]));
	assert.throws(() => value.plane.workspaceFile(session.session_id, "binary.bin"), /binary/);
	writeFileSync(resolve(workspace, "large.txt"), "x".repeat(V36_WORKSPACE_LIMITS.max_preview_bytes + 1));
	assert.throws(() => value.plane.workspaceFile(session.session_id, "large.txt"), /oversized/);
	symlinkSync(value.source, resolve(workspace, "linked-source"), "junction");
	assert.throws(() => value.plane.workspaceTree(session.session_id), /symlink|junction/);
});

test("Pi native Skills and Harness Adaptations remain visibly distinct and read-only", async () => {
	const value = fixture("skill-adaptation-view");
	const session = await value.plane.submit({ project_id: "preview-project", requested_mode: "bounded_edit", task_text: "Plan a bounded edit without commands" });
	assert.deepEqual(session.pi_native_skills, [{ id: "native-skill", name: "Native Skill", description: "Loaded by Pi and shown read-only.", source: "pi_native", read_only: true }]);
	assert.deepEqual(session.harness_adaptations, [{ id: "harness-skill", kind: "adaptive_skill", name: "Harness Skill binding", status: "active", read_only: true }]);
	assert.equal(session.capabilities.file_write, false);
	assert.equal(session.capabilities.planned_file_write, true);
	assert.equal(session.capabilities.project_commands, false);
	assert.equal(session.runs[0]!.command_execution, "disabled_goal1");
});
