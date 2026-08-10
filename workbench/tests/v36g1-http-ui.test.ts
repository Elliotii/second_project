import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { resolve } from "node:path";
import test from "node:test";
import { sha256 } from "../src/hash.ts";
import { ProjectProfileRegistryV36 } from "../src/project/registry-v36.ts";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";
import { InteractiveControlPlaneV36 } from "../src/v36/authority-v36.ts";
import { Goal3WorkbenchApplicationV35 } from "../src/webui/application-v35g3.ts";
import { WorkbenchApplicationV36G1 } from "../src/webui/application-v36g1.ts";
import { loadGoal3DemoProjectionV35 } from "../src/webui/projection-v35g3.ts";
import { createWorkbenchLoopbackServerV36G1 } from "../src/webui/server-v36g1.ts";
import { PROJECT_ROOT } from "./helpers.ts";

function raw(port: number, path: string, method = "GET", headers: Record<string, string | number> = {}, requestBody?: string): Promise<{ status: number; text: string }> {
	return new Promise((accept, reject) => {
		const req = request({ host: "127.0.0.1", port, path, method, headers }, (res) => { const chunks: Buffer[] = []; res.on("data", (chunk) => chunks.push(Buffer.from(chunk))); res.on("end", () => accept({ status: res.statusCode ?? 0, text: Buffer.concat(chunks).toString("utf8") })); });
		req.on("error", reject); if (requestBody !== undefined) req.write(requestBody); req.end();
	});
}

function appFixture(label: string) {
	const root = resolve(PROJECT_ROOT, ".runs/v3-6/g1/tests", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	const source = resolve(root, "source");
	const data = resolve(root, "v36-data");
	const legacyData = resolve(root, "legacy-data");
	const legacyWorkspace = resolve(root, "legacy-workspace");
	for (const path of [source, data, legacyData, legacyWorkspace]) mkdirSync(path, { recursive: true });
	writeFileSync(resolve(source, "hello.txt"), "hello from managed copy\n");
	writeFileSync(resolve(legacyWorkspace, "context.txt"), "legacy context\n");
	const registry = new ProjectProfileRegistryV36([{
		project_id: "http-project", display_name: "HTTP project", source_root: source, writable_paths: ["**"], protected_paths: [], supported_modes: ["inspect_only"], risk_notice: "No project command execution in Goal 1.", execution_backend_profile_id: "docker-goal2-planned", provider_model_policy_id: "host-faux-policy", pi_native_skills: [], harness_adaptations: [], current_state: () => ({ state_digest: sha256("http-state") }),
	}]);
	const legacyService = new PersistentSessionServiceV35({ dataRoot: legacyData, projectId: "legacy-project", workspaceRoot: legacyWorkspace, workspaceId: "legacy-workspace" });
	const legacy = new Goal3WorkbenchApplicationV35({ sessionService: legacyService, projection: loadGoal3DemoProjectionV35(resolve(PROJECT_ROOT, "fixtures/v3-5/goal3-demo/projection.json")) });
	return { app: new WorkbenchApplicationV36G1({ legacy, controlPlane: new InteractiveControlPlaneV36({ dataRoot: data, registry }) }), root, data };
}

test("V3.6 loopback HTTP keeps legacy flows, exact task schema, static safety and managed previews", async () => {
	const loopback = createWorkbenchLoopbackServerV36G1(appFixture("http").app);
	const address = await loopback.start();
	try {
		assert.equal(address.host, "127.0.0.1");
		assert.equal((await raw(address.port, "/api/v1/overview")).status, 200);
		assert.equal((await raw(address.port, "/api/v1/v36/projects")).status, 200);
		const html = await raw(address.port, "/");
		assert.equal(html.status, 200);
		assert.match(html.text, /Open task|开放任务|Host-minted authority/);
		const js = await raw(address.port, "/app.js");
		assert.match(js.text, /api\/v1\/v36\/tasks|workspace\/files/);

		for (const field of ["path", "argv", "env", "credential_ref", "provider", "budget", "verifier", "state_digest", "backend_identity", "run_id"]) {
			const rejected = await raw(address.port, "/api/v1/v36/tasks", "POST", { "content-type": "application/json" }, JSON.stringify({ project_id: "http-project", requested_mode: "inspect_only", task_text: "Inspect", [field]: "injected" }));
			assert.equal(rejected.status, 400, field);
		}
		const created = await raw(address.port, "/api/v1/v36/tasks", "POST", { "content-type": "application/json" }, JSON.stringify({ project_id: "http-project", requested_mode: "inspect_only", task_text: "Inspect hello", title: "Open task" }));
		assert.equal(created.status, 201);
		const session = JSON.parse(created.text) as { session_id: string };
		assert.match(session.session_id, /^v36-session-/);
		assert.doesNotMatch(created.text, /[A-Za-z]:[\\/]|Bearer\s+|authorization|credential_ref/i);
		const tree = await raw(address.port, `/api/v1/v36/sessions/${session.session_id}/workspace`);
		assert.equal(tree.status, 200);
		assert.match(tree.text, /hello\.txt/);
		const preview = await raw(address.port, `/api/v1/v36/sessions/${session.session_id}/workspace/files/hello.txt`);
		assert.equal(preview.status, 200);
		assert.match(preview.text, /hello from managed copy/);

		assert.equal((await raw(address.port, "/%2e%2e/app.js")).status, 400);
		assert.equal((await raw(address.port, "/../app.js")).status, 400);
		assert.equal((await raw(address.port, "/api/v1/v36/tasks", "POST", { "content-type": "text/plain" }, "{}")).status, 415);
		assert.equal((await raw(address.port, "/api/v1/v36/tasks", "POST", { "content-type": "application/json" }, "{broken")).status, 400);
		assert.equal((await raw(address.port, "/api/v1/v36/tasks", "DELETE")).status, 405);
		assert.equal((await raw(address.port, "/api/v1/v36/commands", "POST", { "content-type": "application/json" }, "{}")).status, 404);
	} finally { await loopback.stop(); }
});

test("unexpected filesystem errors use a fixed response without Host path or authority disclosure", async () => {
	const fixture = appFixture("http-safe-unexpected-error");
	const loopback = createWorkbenchLoopbackServerV36G1(fixture.app);
	const leakedSessionMaterial = "authority-secret-host-material";
	const address = await loopback.start();
	try {
		const response = await raw(address.port, `/api/v1/v36/sessions/${leakedSessionMaterial}`);
		assert.equal(response.status, 400);
		assert.deepEqual(JSON.parse(response.text), { error: "request_rejected", message: "request rejected" });
		for (const forbidden of [fixture.root, fixture.data, leakedSessionMaterial, resolve(fixture.data, "sessions", leakedSessionMaterial)]) assert.equal(response.text.includes(forbidden), false, forbidden);
		assert.doesNotMatch(response.text, /[A-Za-z]:[\\/]|ENOENT|lstat|authority|secret/i);
	} finally { await loopback.stop(); }
});
