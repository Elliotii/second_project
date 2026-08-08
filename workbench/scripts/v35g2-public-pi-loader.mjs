import { pathToFileURL } from "node:url";

const roots = {
	"@earendil-works/pi-agent-core": "D:/AI/AI_Projects/project2/.runs/g006/pi/packages/agent/dist/index.js",
	"@earendil-works/pi-agent-core/node": "D:/AI/AI_Projects/project2/.runs/g006/pi/packages/agent/dist/node.js",
	"@earendil-works/pi-ai": "D:/AI/AI_Projects/project2/.runs/g006/pi/packages/ai/dist/index.js",
};

export async function resolve(specifier, context, nextResolve) {
	if (specifier in roots) return { url: pathToFileURL(roots[specifier]).href, shortCircuit: true };
	if (specifier.startsWith("@earendil-works/pi-ai/providers/")) {
		const name = specifier.slice("@earendil-works/pi-ai/providers/".length);
		return { url: pathToFileURL(`D:/AI/AI_Projects/project2/.runs/g006/pi/packages/ai/dist/providers/${name}.js`).href, shortCircuit: true };
	}
	return nextResolve(specifier, context);
}
