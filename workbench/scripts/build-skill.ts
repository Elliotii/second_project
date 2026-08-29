import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildSkillCandidate } from "../src/skill-build/build.ts";
import type { SkillBuildRequest } from "../src/skill-build/contracts.ts";

function configPath(): string {
	const index = process.argv.indexOf("--config");
	if (index < 0 || !process.argv[index + 1]) throw new Error("--config <request.json> is required");
	return resolve(process.argv[index + 1]!);
}

try {
	const request = JSON.parse(readFileSync(configPath(), "utf8")) as SkillBuildRequest;
	const result = await buildSkillCandidate(request);
	process.stdout.write(`${JSON.stringify(result)}\n`);
	if (result.status === "invalid") process.exitCode = 1;
} catch (error) {
	process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
	process.exitCode = 1;
}
