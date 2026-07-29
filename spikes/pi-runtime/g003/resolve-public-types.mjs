import { resolve } from "node:path";
import ts from "../../../.runs/g003/pi/node_modules/typescript/lib/typescript.js";

const containingFile = resolve("spikes/pi-runtime/g003/public-type-smoke.ts");
const options = {
	module: ts.ModuleKind.NodeNext,
	moduleResolution: ts.ModuleResolutionKind.NodeNext,
	target: ts.ScriptTarget.ES2024,
};
const resolutions = Object.fromEntries(
	["@earendil-works/pi-agent-core", "@earendil-works/pi-agent-core/node"].map((specifier) => {
		const result = ts.resolveModuleName(specifier, containingFile, options, ts.sys).resolvedModule;
		if (!result) throw new Error(`TypeScript did not resolve ${specifier}`);
		const normalized = result.resolvedFileName.replaceAll("\\", "/");
		const expected = specifier.endsWith("/node") ? "/packages/agent/dist/node.d.ts" : "/packages/agent/dist/index.d.ts";
		if (!normalized.endsWith(expected) || normalized.includes("/packages/agent/src/")) {
			throw new Error(`TypeScript declaration did not resolve to emitted dist: ${specifier} -> ${normalized}`);
		}
		return [specifier, normalized];
	}),
);
console.log(JSON.stringify(resolutions));
