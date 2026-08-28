import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createModels, InMemoryCredentialStore } from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";
import type { CodingTaskModelRuntime } from "../coding-task/contracts.ts";
import { PINNED_PI_COMMIT } from "../coding-task/contracts.ts";

interface PackageMetadata {
	name?: unknown;
	exports?: Record<string, unknown>;
}

function readPackage(path: string, expectedName: string): void {
	if (!existsSync(path)) throw new Error(`Pi package metadata is missing: ${path}`);
	const metadata = JSON.parse(readFileSync(path, "utf8")) as PackageMetadata;
	if (metadata.name !== expectedName || !metadata.exports || !("." in metadata.exports)) {
		throw new Error(`Pi public package export is unavailable: ${expectedName}`);
	}
}

export function preflightPiRuntime(runtimeRootValue = process.env.PI_RUNTIME_ROOT): { root: string; commit: string } {
	if (!runtimeRootValue) throw new Error("PI_RUNTIME_ROOT is required");
	const root = resolve(runtimeRootValue);
	const agentRoot = resolve(root, "packages/agent");
	const aiRoot = resolve(root, "packages/ai");
	readPackage(resolve(agentRoot, "package.json"), "@earendil-works/pi-agent-core");
	readPackage(resolve(aiRoot, "package.json"), "@earendil-works/pi-ai");
	for (const path of [resolve(agentRoot, "dist/index.js"), resolve(agentRoot, "dist/node.js"), resolve(aiRoot, "dist/index.js")]) {
		if (!existsSync(path)) throw new Error(`Pi emitted public module is missing: ${path}`);
	}
	let commit: string;
	try {
		commit = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8", windowsHide: true }).trim();
	} catch (error) {
		throw new Error("Pi runtime Git identity could not be read", { cause: error });
	}
	if (commit !== PINNED_PI_COMMIT) throw new Error(`Pi runtime commit mismatch: expected ${PINNED_PI_COMMIT}, received ${commit}`);
	return { root, commit };
}

export async function createDeepSeekCodingTaskRuntime(credential: string): Promise<CodingTaskModelRuntime> {
	if (!credential) throw new Error("DEEPSEEK_API_KEY is required for the coding task run");
	const credentials = new InMemoryCredentialStore();
	await credentials.modify("deepseek", async () => ({ type: "api_key", key: credential }));
	const models = createModels({ credentials });
	models.setProvider(deepseekProvider());
	const model = models.getModel("deepseek", "deepseek-v4-flash");
	if (!model) throw new Error("public Pi DeepSeek model is unavailable");
	return { models, model, async close(): Promise<void> {} };
}
