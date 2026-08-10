import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { resolve } from "node:path";
import test from "node:test";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";
import { Goal3WorkbenchApplicationV35 } from "../src/webui/application-v35g3.ts";
import { loadGoal3DemoProjectionV35 } from "../src/webui/projection-v35g3.ts";
import { createGoal3LoopbackServerV35 } from "../src/webui/server-v35g3.ts";
import { PROJECT_ROOT } from "./helpers.ts";

function roots(label: string) {
	const root = resolve(PROJECT_ROOT, ".runs/v3-5-g3/tests", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	const dataRoot = resolve(root, "data");
	const workspaceRoot = resolve(root, "workspace");
	mkdirSync(dataRoot, { recursive: true });
	mkdirSync(workspaceRoot, { recursive: true });
	writeFileSync(resolve(workspaceRoot, "context.txt"), "bounded Goal 3 context\n");
	return { root, dataRoot, workspaceRoot };
}

function fixture() { return loadGoal3DemoProjectionV35(resolve(PROJECT_ROOT, "fixtures/v3-5/goal3-demo/projection.json")); }

function raw(port: number, path: string, method = "GET", headers: Record<string, string | number> = {}, body?: string): Promise<{ status: number; text: string }> {
	return new Promise((accept, reject) => {
		const req = request({ host: "127.0.0.1", port, path, method, headers }, (res) => { const chunks: Buffer[] = []; res.on("data", (chunk) => chunks.push(Buffer.from(chunk))); res.on("end", () => accept({ status: res.statusCode ?? 0, text: Buffer.concat(chunks).toString("utf8") })); });
		req.on("error", reject); if (body !== undefined) req.write(body); req.end();
	});
}

test("application lists, opens, creates and deterministically continues persistent Sessions", async () => {
	const root = roots("application");
	const service = new PersistentSessionServiceV35({ dataRoot: root.dataRoot, projectId: "v35g3-project", workspaceRoot: root.workspaceRoot, workspaceId: "v35g3-workspace" });
	const app = new Goal3WorkbenchApplicationV35({ sessionService: service, projection: fixture() });
	await app.createSession({ session_id: "session-one", title: "Inspectable Session" });
	await app.continueSession("session-one", { run_id: "run-one", prompt: "Continue deterministically" });
	const listed = await app.sessions();
	assert.deepEqual(listed.sessions.map((entry) => entry.session_id), ["session-one"]);
	const opened = await app.session("session-one");
	assert.deepEqual(opened.runs.map((run) => run.run_id), ["run-one"]);
	assert.equal(opened.runs[0]?.settled, true);
	assert.doesNotMatch(JSON.stringify(opened), /PRIVATE_REASONING|Bearer\s+|authorization=/i);
	assert.equal(app.goal25Comparison().source_refs.some((ref) => /^[A-Za-z]:/.test(ref)), false);
});

test("loopback API and static UI enforce routes, methods, body bounds, content types and path safety", async () => {
	const root = roots("http");
	const service = new PersistentSessionServiceV35({ dataRoot: root.dataRoot, projectId: "v35g3-http", workspaceRoot: root.workspaceRoot, workspaceId: "v35g3-http-workspace" });
	const app = new Goal3WorkbenchApplicationV35({ sessionService: service, projection: fixture() });
	const loopback = createGoal3LoopbackServerV35(app);
	const address = await loopback.start(0);
	try {
		assert.equal(address.host, "127.0.0.1");
		assert.ok(address.port > 0);
		const html = await fetch(`${address.url}/`);
		assert.equal(html.status, 200);
		const htmlText = await html.text();
		assert.match(htmlText, /Adaptive Harness Workbench|Browser rollback mutation is deferred/);
		assert.match(htmlText, /data-locale="zh-CN"|data-i18n="nav\.comparisons"/);
		assert.match(html.headers.get("content-security-policy") ?? "", /default-src 'self'/);
		const js = await fetch(`${address.url}/app.js`);
		assert.equal(js.status, 200);
		assert.match(await js.text(), /comparisons\/goal25/);
		const i18n = await fetch(`${address.url}/i18n.js`);
		assert.equal(i18n.status, 200);
		assert.match(i18n.headers.get("content-type") ?? "", /text\/javascript/);
		assert.match(await i18n.text(), /adaptive-harness-workbench\.locale|自适应 Harness 工作台/);
		const i18nCss = await fetch(`${address.url}/i18n.css`);
		assert.equal(i18nCss.status, 200);
		assert.match(i18nCss.headers.get("content-type") ?? "", /text\/css/);

		const created = await fetch(`${address.url}/api/v1/sessions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ session_id: "api-session", title: "API Session" }) });
		assert.equal(created.status, 201);
		const continued = await fetch(`${address.url}/api/v1/sessions/api-session/turns`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ run_id: "api-run", prompt: "Deterministic Faux continuation" }) });
		assert.equal(continued.status, 201);
		const opened = await fetch(`${address.url}/api/v1/sessions/api-session`);
		const openedText = await opened.text();
		assert.equal(opened.status, 200);
		assert.doesNotMatch(openedText, /[A-Za-z]:[\\/]|PRIVATE_REASONING|Bearer\s+/i);

		assert.equal((await raw(address.port, "/%2e%2e/app.js")).status, 400);
		assert.equal((await raw(address.port, "/../app.js")).status, 400);
		assert.equal((await raw(address.port, "/api/v1/state/rollback", "POST", { "content-type": "application/json" }, "{}")).status, 404);
		assert.equal((await raw(address.port, "/api/v1/overview", "DELETE")).status, 405);
		assert.equal((await raw(address.port, "/api/v1/unknown")).status, 404);
		assert.equal((await raw(address.port, "/translations.json")).status, 404);
		assert.equal((await raw(address.port, "/api/v1/sessions", "POST", { "content-type": "text/plain" }, "{}")).status, 415);
		assert.equal((await raw(address.port, "/api/v1/sessions", "POST", { "content-type": "application/json", "content-length": 20_000 }, "x".repeat(20_000))).status, 413);
		assert.equal((await raw(address.port, "/api/v1/sessions", "POST", { "content-type": "application/json" }, "{broken")).status, 400);
		assert.equal((await raw(address.port, "/api/v1/sessions", "POST", { "content-type": "application/json" }, JSON.stringify({ session_id: "unknown", title: "x", path: "../outside" }))).status, 400);
	} finally { await loopback.stop(); }
});

test("portable projection is derived, sanitized and preserves accepted Goal 2.5 identity without a winner", () => {
	const value = fixture();
	const serialized = JSON.stringify(value);
	assert.equal(value.derived_non_authoritative, true);
	assert.equal(value.accepted_goal25_comparison_digest, "243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f");
	assert.match(value.goal25_comparison.result_statement, /no task-success advantage/);
	assert.doesNotMatch(serialized, /winner|[A-Za-z]:[\\/]|Bearer\s+|PRIVATE_REASONING|authorization=/i);
});
