import { resolve } from "node:path";
import { createDeferredCredentialFileResolverV35 } from "../src/session/real-smoke-turn-v35.ts";
import type { RunDescriptor } from "../src/trace-analysis/contracts.ts";
import { runAnalysisInvocation } from "../src/trace-analysis/model-runner.ts";

function usage(): never {
	throw new Error("usage: node scripts/run-trace-analysis-model.ts --mode <fresh|resume> --output <directory> --credential-file <path> --run <run-id> <root> --run <run-id> <root>");
}

function parse(argv: string[]): { mode: "fresh" | "resume"; output: string; credentialFile: string; descriptors: RunDescriptor[] } {
	let mode: "fresh" | "resume" | undefined;
	let output: string | undefined;
	let credentialFile: string | undefined;
	const descriptors: RunDescriptor[] = [];
	for (let index = 0; index < argv.length;) {
		if (argv[index] === "--mode" && (argv[index + 1] === "fresh" || argv[index + 1] === "resume")) { mode = argv[index + 1] as "fresh" | "resume"; index += 2; }
		else if (argv[index] === "--output" && argv[index + 1]) { output = resolve(argv[index + 1]!); index += 2; }
		else if (argv[index] === "--credential-file" && argv[index + 1]) { credentialFile = resolve(argv[index + 1]!); index += 2; }
		else if (argv[index] === "--run" && argv[index + 1] && argv[index + 2]) { descriptors.push({ runId: argv[index + 1]!, root: resolve(argv[index + 2]!), labels: { cohort: "development" } }); index += 3; }
		else usage();
	}
	if (!mode || !output || !credentialFile || descriptors.length !== 2) usage();
	return { mode, output, credentialFile, descriptors };
}

const input = parse(process.argv.slice(2));
const result = await runAnalysisInvocation({ mode: input.mode, outputDirectory: input.output, descriptors: input.descriptors, credentialResolver: createDeferredCredentialFileResolverV35(input.credentialFile) });
console.log(JSON.stringify(result, null, 2));
