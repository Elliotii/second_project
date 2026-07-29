import { resolve } from "node:path";
import ts from "../../../.runs/g005/pi/node_modules/typescript/lib/typescript.js";

const containingFile = resolve("spikes/pi-runtime/g005/public-type-smoke.ts");
const options = {
	module: ts.ModuleKind.NodeNext,
	moduleResolution: ts.ModuleResolutionKind.NodeNext,
	target: ts.ScriptTarget.ES2024,
};
const expected = new Map([
	["@earendil-works/pi-agent-core", "/packages/agent/dist/index.d.ts"],
	["@earendil-works/pi-ai/providers/deepseek", "/packages/ai/dist/providers/deepseek.d.ts"],
]);
const resolutions = Object.fromEntries(
	[...expected].map(([specifier, suffix]) => {
		const result = ts.resolveModuleName(specifier, containingFile, options, ts.sys).resolvedModule;
		if (!result) throw new Error(`TypeScript did not resolve ${specifier}`);
		const normalized = result.resolvedFileName.replaceAll("\\", "/");
		if (!normalized.endsWith(suffix) || normalized.includes("/src/")) {
			throw new Error(`declaration did not resolve to emitted dist: ${specifier} -> ${normalized}`);
		}
		return [specifier, normalized];
	}),
);
console.log(JSON.stringify(resolutions));
