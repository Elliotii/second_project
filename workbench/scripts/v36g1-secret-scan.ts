import { lstatSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { scanPreterminalEvidenceV0B } from "../src/evidence/secret-scan.ts";

const projectRoot = realpathSync.native(resolve(import.meta.dirname, "../.."));
if (process.argv.length < 3) throw new Error("V3.6 Goal 1 secret scan requires tracked file paths");
const files = process.argv.slice(2).map((value) => {
	const path = resolve(projectRoot, value);
	const rel = relative(projectRoot, path);
	if (isAbsolute(rel) || rel === ".." || rel.startsWith(`..${sep}`)) throw new Error("secret scan path escaped project root");
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("secret scan path is not an ordinary file");
	return { scope_label: value.replaceAll("\\", "/"), path };
});
const result = scanPreterminalEvidenceV0B({ files, objects: [] });
process.stdout.write(`${JSON.stringify(result)}\n`);
if (result.status !== "passed") process.exitCode = 1;
