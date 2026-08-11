import { resolve } from "node:path";
import { executeGoal2ProductJourneyV36, preflightGoal2ProductEntryV36, V36G2_REAL_JOURNEY_AUTHORITY } from "../src/v36/product-entry-v36g2.ts";

function argumentsMap(values: string[]): { action: "preflight" | "run"; values: Map<string, string> } {
	const [action, ...rest] = values;
	if (action !== "preflight" && action !== "run") throw new Error("usage: run-v36g2-product-journey.ts <preflight|run> --source-root <path> --execution-baseline-commit <sha> [run authority/Host roots]");
	const parsed = new Map<string, string>();
	for (let index = 0; index < rest.length; index += 2) {
		const key = rest[index];
		const value = rest[index + 1];
		if (!key?.startsWith("--") || value === undefined || parsed.has(key)) throw new Error("Goal 2 product entry arguments are invalid");
		parsed.set(key, value);
	}
	const allowed = action === "preflight" ? ["--source-root", "--execution-baseline-commit"] : ["--source-root", "--execution-baseline-commit", "--data-root", "--evidence-root", "--docker-executable", "--real-journey-authority"];
	if ([...parsed.keys()].some((key) => !allowed.includes(key)) || allowed.some((key) => !parsed.has(key))) throw new Error("Goal 2 product entry arguments are incomplete or unsupported");
	return { action, values: parsed };
}

const parsed = argumentsMap(process.argv.slice(2));
const sourceRoot = resolve(parsed.values.get("--source-root")!);
const executionBaselineCommit = parsed.values.get("--execution-baseline-commit")!;
if (parsed.action === "preflight") {
	process.stdout.write(`${JSON.stringify(preflightGoal2ProductEntryV36({ sourceRoot, executionBaselineCommit }))}\n`);
} else {
	const report = await executeGoal2ProductJourneyV36({
		sourceRoot,
		executionBaselineCommit,
		dataRoot: resolve(parsed.values.get("--data-root")!),
		evidenceRoot: resolve(parsed.values.get("--evidence-root")!),
		dockerExecutable: parsed.values.get("--docker-executable")!,
		realAuthority: parsed.values.get("--real-journey-authority") === V36G2_REAL_JOURNEY_AUTHORITY ? V36G2_REAL_JOURNEY_AUTHORITY : "rejected",
		credentialResolver: { async resolve(): Promise<string> { const value = process.env.DEEPSEEK_API_KEY; if (!value) throw new Error("opaque DeepSeek Credential is unavailable"); return value; } },
	});
	process.stdout.write(`${JSON.stringify(report)}\n`);
}
