import { existsSync, readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

let roots;

function resolveRoots() {
	if (roots) return roots;
	const runtimeRoot = process.env.PI_RUNTIME_ROOT;
	if (!runtimeRoot) throw new Error("PI_RUNTIME_ROOT is required by the public Pi loader");
	const root = resolvePath(runtimeRoot);
	roots = {
		"@earendil-works/pi-agent-core": resolvePath(root, "packages/agent/dist/index.js"),
		"@earendil-works/pi-agent-core/node": resolvePath(root, "packages/agent/dist/node.js"),
		"@earendil-works/pi-ai": resolvePath(root, "packages/ai/dist/index.js"),
	};
	for (const [name, path] of Object.entries(roots)) {
		if (!existsSync(path)) throw new Error(`public Pi export is missing for ${name}`);
	}
	for (const [path, name] of [
		[resolvePath(root, "packages/agent/package.json"), "@earendil-works/pi-agent-core"],
		[resolvePath(root, "packages/ai/package.json"), "@earendil-works/pi-ai"],
	]) {
		const metadata = JSON.parse(readFileSync(path, "utf8"));
		if (metadata.name !== name || !metadata.exports?.["."]) throw new Error(`invalid public Pi package metadata for ${name}`);
	}
	return roots;
}

export async function resolve(specifier, context, nextResolve) {
	if (specifier === "@earendil-works/pi-agent-core" || specifier === "@earendil-works/pi-agent-core/node" || specifier === "@earendil-works/pi-ai") {
		const publicRoots = resolveRoots();
		return { url: pathToFileURL(publicRoots[specifier]).href, shortCircuit: true };
	}
	if (specifier.startsWith("@earendil-works/pi-ai/providers/")) {
		const runtimeRoot = process.env.PI_RUNTIME_ROOT;
		if (!runtimeRoot) throw new Error("PI_RUNTIME_ROOT is required by the public Pi loader");
		const name = specifier.slice("@earendil-works/pi-ai/providers/".length);
		const path = resolvePath(runtimeRoot, "packages", "ai", "dist", "providers", `${name}.js`);
		if (!existsSync(path)) throw new Error(`public Pi provider export is missing: ${specifier}`);
		return { url: pathToFileURL(path).href, shortCircuit: true };
	}
	return nextResolve(specifier, context);
}
