import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

export function sha256(value: string | Uint8Array): string {
	return createHash("sha256").update(value).digest("hex");
}

export function canonical(value: unknown): string {
	if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
	if (value && typeof value === "object") {
		return `{${Object.entries(value)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`)
			.join(",")}}`;
	}
	return JSON.stringify(value);
}

export function ensureParent(path: string): void {
	mkdirSync(dirname(path), { recursive: true });
}

export function writeJson(path: string, value: unknown): void {
	ensureParent(path);
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
}

export function appendJsonl(path: string, value: unknown): void {
	ensureParent(path);
	appendFileSync(path, `${JSON.stringify(value)}\n`, "utf8");
}

function listFiles(root: string, current = root): string[] {
	return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
		const path = resolve(current, entry.name);
		if (entry.isDirectory()) return listFiles(root, path);
		if (!entry.isFile()) throw new Error(`non-regular fixture entry: ${path}`);
		return [relative(root, path).replaceAll("\\", "/")];
	});
}

export function treeInventory(root: string) {
	return listFiles(root)
		.sort()
		.map((path) => {
			const bytes = readFileSync(resolve(root, path));
			return { path, size: bytes.length, sha256: sha256(bytes) };
		});
}

export function treeDigest(root: string): string {
	return sha256(canonical(treeInventory(root)));
}

export function truncateUtf8(value: string, maxBytes: number): { text: string; truncated: boolean; originalBytes: number } {
	const bytes = Buffer.from(value, "utf8");
	if (bytes.length <= maxBytes) return { text: value, truncated: false, originalBytes: bytes.length };
	const suffix = "\n...[truncated]";
	const suffixBytes = Buffer.byteLength(suffix);
	return {
		text: `${bytes.subarray(0, Math.max(0, maxBytes - suffixBytes)).toString("utf8")}${suffix}`,
		truncated: true,
		originalBytes: bytes.length,
	};
}

export type ProcessResult = {
	command: string;
	args: string[];
	exitCode: number | null;
	signal: NodeJS.Signals | null;
	timedOut: boolean;
	durationMs: number;
	stdout: string;
	stderr: string;
};

export async function runProcess(options: {
	command: string;
	args: string[];
	cwd: string;
	timeoutMs: number;
	maxCombinedOutputBytes: number;
	env?: NodeJS.ProcessEnv;
	signal?: AbortSignal;
}): Promise<ProcessResult> {
	const started = Date.now();
	return await new Promise<ProcessResult>((resolvePromise, reject) => {
		const child = spawn(options.command, options.args, {
			cwd: options.cwd,
			env: options.env ?? {},
			stdio: ["ignore", "pipe", "pipe"],
			windowsHide: true,
			signal: options.signal,
		});
		const stdout: Buffer[] = [];
		const stderr: Buffer[] = [];
		let combinedBytes = 0;
		let timedOut = false;
		const collect = (target: Buffer[], chunk: Buffer) => {
			combinedBytes += chunk.length;
			if (combinedBytes > options.maxCombinedOutputBytes) {
				child.kill();
				reject(new Error(`child output exceeded ${options.maxCombinedOutputBytes} bytes`));
				return;
			}
			target.push(chunk);
		};
		child.stdout.on("data", (chunk: Buffer) => collect(stdout, chunk));
		child.stderr.on("data", (chunk: Buffer) => collect(stderr, chunk));
		const timer = setTimeout(() => {
			timedOut = true;
			child.kill();
		}, options.timeoutMs);
		child.once("error", (error) => {
			clearTimeout(timer);
			reject(error);
		});
		child.once("close", (exitCode, signal) => {
			clearTimeout(timer);
			resolvePromise({
				command: options.command,
				args: options.args,
				exitCode,
				signal,
				timedOut,
				durationMs: Date.now() - started,
				stdout: Buffer.concat(stdout).toString("utf8"),
				stderr: Buffer.concat(stderr).toString("utf8"),
			});
		});
	});
}
