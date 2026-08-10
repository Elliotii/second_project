import { lstatSync, readFileSync } from "node:fs";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { resolve } from "node:path";
import { WorkbenchApplicationV36G1 } from "./application-v36g1.ts";

const MAX_BODY_BYTES = 20_000;
const ID = "[A-Za-z0-9][A-Za-z0-9._-]{0,127}";
const LEGACY_SESSION = new RegExp(`^/api/v1/sessions/(${ID})$`);
const LEGACY_TURN = new RegExp(`^/api/v1/sessions/(${ID})/turns$`);
const V36_SESSION = new RegExp(`^/api/v1/v36/sessions/(${ID})$`);
const V36_TREE = new RegExp(`^/api/v1/v36/sessions/(${ID})/workspace$`);
const V36_FILE = new RegExp(`^/api/v1/v36/sessions/(${ID})/workspace/files/(.+)$`);
type StaticAsset = "index.html" | "app.js" | "styles.css" | "i18n.js" | "i18n.css";

class HttpError extends Error {
	readonly status: number;
	constructor(status: number, message: string) { super(message); this.status = status; }
}

function send(res: ServerResponse, status: number, body: unknown): void {
	const bytes = Buffer.from(`${JSON.stringify(body)}\n`);
	res.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": bytes.length, "cache-control": "no-store", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'none'; frame-ancestors 'none'" });
	res.end(bytes);
}

function sendStatic(res: ServerResponse, name: StaticAsset): void {
	const path = resolve(import.meta.dirname, "static", name);
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new HttpError(500, "static asset unavailable");
	const bytes = readFileSync(path);
	const mediaType = name.endsWith(".html") ? "text/html; charset=utf-8" : name.endsWith(".js") ? "text/javascript; charset=utf-8" : "text/css; charset=utf-8";
	res.writeHead(200, { "content-type": mediaType, "content-length": bytes.length, "cache-control": "no-store", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'" });
	res.end(bytes);
}

async function body(req: IncomingMessage): Promise<unknown> {
	if (req.headers["content-type"]?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") throw new HttpError(415, "content type must be application/json");
	const declared = Number(req.headers["content-length"] ?? 0);
	let tooLarge = Number.isFinite(declared) && declared > MAX_BODY_BYTES;
	const chunks: Buffer[] = [];
	let size = 0;
	for await (const chunk of req) {
		const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		size += bytes.length;
		if (size > MAX_BODY_BYTES) tooLarge = true;
		if (!tooLarge) chunks.push(bytes);
	}
	if (tooLarge) throw new HttpError(413, "request body is too large");
	if (size === 0) throw new HttpError(400, "request body is empty");
	try { return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown; } catch { throw new HttpError(400, "request body is malformed JSON"); }
}

function requestPath(req: IncomingMessage): string {
	const raw = req.url ?? "";
	const rawPath = raw.split(/[?#]/, 1)[0] ?? "";
	if (!raw.startsWith("/") || raw.includes("%") || raw.includes("\\") || raw.includes("\0") || rawPath.split("/").includes("..")) throw new HttpError(400, "request path is malformed");
	const parsed = new URL(raw, "http://127.0.0.1");
	if (parsed.search || parsed.hash || parsed.pathname.split("/").includes("..")) throw new HttpError(400, "request path is malformed");
	return parsed.pathname;
}

function exactObject(value: unknown, allowed: readonly string[], required: readonly string[]): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new HttpError(400, "JSON body must be an object");
	const record = value as Record<string, unknown>;
	if (Object.keys(record).some((key) => !allowed.includes(key)) || required.some((key) => !(key in record))) throw new HttpError(400, "JSON body fields are invalid");
	return record;
}

async function route(app: WorkbenchApplicationV36G1, req: IncomingMessage, res: ServerResponse): Promise<void> {
	const path = requestPath(req);
	const method = req.method ?? "";
	if (method === "GET") {
		if (path === "/") return sendStatic(res, "index.html");
		if (path === "/app.js") return sendStatic(res, "app.js");
		if (path === "/styles.css") return sendStatic(res, "styles.css");
		if (path === "/i18n.js") return sendStatic(res, "i18n.js");
		if (path === "/i18n.css") return sendStatic(res, "i18n.css");
		if (path === "/api/v1/v36/projects") return send(res, 200, app.projects());
		if (path === "/api/v1/v36/sessions") return send(res, 200, await app.interactiveSessions());
		const v36File = path.match(V36_FILE);
		if (v36File) return send(res, 200, app.workspaceFile(v36File[1]!, v36File[2]!));
		const v36Tree = path.match(V36_TREE);
		if (v36Tree) return send(res, 200, app.workspaceTree(v36Tree[1]!));
		const v36Session = path.match(V36_SESSION);
		if (v36Session) return send(res, 200, await app.interactiveSession(v36Session[1]!));
		if (path === "/api/v1/overview") return send(res, 200, app.legacy.overview());
		if (path === "/api/v1/sessions") return send(res, 200, await app.legacy.sessions());
		const session = path.match(LEGACY_SESSION);
		if (session) return send(res, 200, await app.legacy.session(session[1]!));
		if (path === "/api/v1/comparisons/v2") return send(res, 200, app.legacy.v2Recovery());
		if (path === "/api/v1/comparisons/goal25") return send(res, 200, app.legacy.goal25Comparison());
		if (path === "/api/v1/adaptation") return send(res, 200, app.legacy.adaptation());
		if (path === "/api/v1/state-history") return send(res, 200, app.legacy.stateHistory());
		throw new HttpError(404, "route not found");
	}
	if (method === "POST") {
		if (path === "/api/v1/v36/tasks") {
			const input = exactObject(await body(req), ["project_id", "requested_mode", "task_text", "title", "session_id"], ["project_id", "requested_mode", "task_text"]);
			return send(res, 201, await app.submitTask(input));
		}
		if (path === "/api/v1/sessions") {
			const input = exactObject(await body(req), ["session_id", "title", "parent_session_id"], ["session_id", "title"]);
			if (typeof input.session_id !== "string" || typeof input.title !== "string" || (input.parent_session_id !== undefined && input.parent_session_id !== null && typeof input.parent_session_id !== "string")) throw new HttpError(400, "JSON body fields are invalid");
			return send(res, 201, await app.legacy.createSession({ session_id: input.session_id, title: input.title, ...(input.parent_session_id === undefined ? {} : { parent_session_id: input.parent_session_id }) }));
		}
		const turn = path.match(LEGACY_TURN);
		if (turn) {
			const input = exactObject(await body(req), ["run_id", "prompt"], ["run_id", "prompt"]);
			if (typeof input.run_id !== "string" || typeof input.prompt !== "string") throw new HttpError(400, "JSON body fields are invalid");
			return send(res, 201, await app.legacy.continueSession(turn[1]!, { run_id: input.run_id, prompt: input.prompt }));
		}
		throw new HttpError(404, "route not found");
	}
	throw new HttpError(405, "method not allowed");
}

export function createWorkbenchLoopbackServerV36G1(app: WorkbenchApplicationV36G1): { server: Server; start(port?: number): Promise<{ host: "127.0.0.1"; port: number; url: string }>; stop(): Promise<void> } {
	const server = createServer((req, res) => { void route(app, req, res).catch((error: unknown) => {
		if (res.headersSent) return res.end();
		const status = error instanceof HttpError ? error.status : 400;
		const message = error instanceof HttpError ? error.message : "request rejected";
		send(res, status, { error: status >= 500 ? "internal_error" : "request_rejected", message });
	}); });
	return {
		server,
		start: async (port = 0) => await new Promise((accept, reject) => {
			server.once("error", reject);
			server.listen(port, "127.0.0.1", () => {
				server.off("error", reject);
				const address = server.address();
				if (!address || typeof address === "string" || address.address !== "127.0.0.1") return reject(new Error("loopback bind identity mismatch"));
				accept({ host: "127.0.0.1", port: address.port, url: `http://127.0.0.1:${address.port}` });
			});
		}),
		stop: async () => await new Promise((accept, reject) => server.close((error) => error ? reject(error) : accept())),
	};
}
