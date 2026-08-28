import { existsSync, readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

const runtimeRoot = process.env.PI_RUNTIME_ROOT;
if (!runtimeRoot) throw new Error("PI_RUNTIME_ROOT is required by the public Pi loader");
const root = resolvePath(runtimeRoot);
const packages = {
	"@earendil-works/pi-agent-core": resolvePath(root, "packages/agent/dist/index.js"),
	"@earendil-works/pi-agent-core/node": resolvePath(root, "packages/agent/dist/node.js"),
	"@earendil-works/pi-ai": resolvePath(root, "packages/ai/dist/index.js"),
};
for (const [name, path] of Object.entries(packages)) {
	if (!existsSync(path)) throw new Error(`public Pi export is missing for ${name}`);
}
for (const [path, name] of [[resolvePath(root, "packages/agent/package.json"), "@earendil-works/pi-agent-core"], [resolvePath(root, "packages/ai/package.json"), "@earendil-works/pi-ai"]]) {
	const metadata = JSON.parse(readFileSync(path, "utf8"));
	if (metadata.name !== name || !metadata.exports?.["."]) throw new Error(`invalid public Pi package metadata for ${name}`);
}

export async function resolve(specifier, context, nextResolve) {
	if (specifier in packages) return { url: pathToFileURL(packages[specifier]).href, shortCircuit: true };
	if (specifier.startsWith("@earendil-works/pi-ai/providers/")) {
		const provider = specifier.slice("@earendil-works/pi-ai/providers/".length);
		const path = resolvePath(root, `packages/ai/dist/providers/${provider}.js`);
		if (!existsSync(path)) throw new Error(`public Pi provider export is missing: ${specifier}`);
		return { url: pathToFileURL(path).href, shortCircuit: true };
	}
	return nextResolve(specifier, context);
}
