import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { resolve } from "node:path";
import test from "node:test";
import { sha256 } from "../src/hash.ts";
import { createDailyProductApplicationV36, loadDailyProjectProfileV36, type DailyProjectProfileFileV36 } from "../src/v36/daily-product-v36.ts";
import { createWorkbenchLoopbackServerV36G1 } from "../src/webui/server-v36g1.ts";
import { PROJECT_ROOT } from "./helpers.ts";

function get(port: number, path: string): Promise<{ status: number; text: string }> {
	return new Promise((accept, reject) => {
		const req = request({ host: "127.0.0.1", port, path }, (res) => {
			const chunks: Buffer[] = [];
			res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
			res.on("end", () => accept({ status: res.statusCode ?? 0, text: Buffer.concat(chunks).toString("utf8") }));
		});
		req.on("error", reject);
		req.end();
	});
}

test("daily product Host profile starts the accepted Goal 1 + Goal 2 browser surface without Credential or model use", async () => {
	const root = resolve(PROJECT_ROOT, ".runs/v3-6/post-closeout-polish", `${process.pid}-${Date.now()}`);
	mkdirSync(root, { recursive: true });
	const profile: DailyProjectProfileFileV36 = {
		schema_version: 1,
		project: {
			project_id: "daily-duration",
			display_name: "Daily duration fixture",
			source_root: resolve(PROJECT_ROOT, "workbench/fixtures/v36g2/duration-parser"),
			writable_paths: ["src/parse-duration.js"],
			protected_paths: ["test/**", "package.json"],
			risk_notice: "Managed copy, network-none Docker registered command, explicit Host handoff.",
			command_descriptors: [{ command_id: "test", executable: "current_node_executable", argv: ["--test"], cwd: "workspace", timeout_seconds: 30, max_combined_output_bytes: 65_536 }],
			pi_native_skills: [],
			harness_adaptations: [],
			harness_state_digest: sha256("daily-product-test-no-binding"),
		},
	};
	const profilePath = resolve(root, "profile.json");
	writeFileSync(profilePath, `${JSON.stringify(profile, null, 2)}\n`, { flag: "wx" });
	const loaded = loadDailyProjectProfileV36(profilePath);
	let credentialReads = 0;
	const app = createDailyProductApplicationV36({ profile: loaded, dataRoot: resolve(root, "data"), dockerExecutable: "unused-in-zero-call-test", credentialResolver: { resolve: async () => { credentialReads += 1; return "must-not-be-read"; } } });
	assert.deepEqual(app.projects().projects[0]!.supported_modes, ["bounded_edit"]);
	const loopback = createWorkbenchLoopbackServerV36G1(app);
	const address = await loopback.start();
	try {
		const projects = await get(address.port, "/api/v1/v36/projects");
		const javascript = await get(address.port, "/app.js");
		assert.equal(projects.status, 200);
		assert.match(projects.text, /daily-duration|docker_bounded_edit_change_handoff/);
		assert.equal(javascript.status, 200);
		assert.match(javascript.text, /from-updated-source|handoffResultCard|Running Agent task/);
		assert.equal(credentialReads, 0);
	} finally { await loopback.stop(); }
});
