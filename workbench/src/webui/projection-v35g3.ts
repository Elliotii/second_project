import { lstatSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Goal3DemoProjectionV35 } from "../contracts/v35g3-types.ts";

const ACCEPTED_DIGEST = "243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f";

export function loadGoal3DemoProjectionV35(pathValue: string): Goal3DemoProjectionV35 {
	const path = resolve(pathValue);
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("Demo projection must be one ordinary file");
	const text = readFileSync(path, "utf8");
	if (/(?:[A-Za-z]:[\\/]|\\\\|Bearer\s+|api[_-]?key|authorization|password|secret|private.reasoning)/i.test(text)) throw new Error("Demo projection contains prohibited host or secret material");
	const value = JSON.parse(text) as Partial<Goal3DemoProjectionV35>;
	if (value.schema_version !== 1 || value.projection_kind !== "v35_goal3_sanitized_demo" || value.derived_non_authoritative !== true || value.accepted_goal25_comparison_digest !== ACCEPTED_DIGEST || value.goal25_comparison?.comparison_digest !== ACCEPTED_DIGEST) throw new Error("Demo projection identity is invalid");
	if (value.goal25_comparison.result_statement !== "Both arms passed; no task-success advantage was observed for the Skill; Candidate used more tokens.") throw new Error("Demo projection Goal 2.5 result wording is invalid");
	return value as Goal3DemoProjectionV35;
}
