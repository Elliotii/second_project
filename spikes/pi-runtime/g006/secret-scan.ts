import { existsSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { writeJson } from "./runtime-utils.ts";

const projectRoot = resolve(import.meta.dirname, "../../..");
const secret = process.env.DEEPSEEK_API_KEY ?? "";
if (secret.trim().length === 0) throw new Error("credential_configured=false");

const roots = [
	resolve(projectRoot, "spikes/pi-runtime/g006"),
	resolve(projectRoot, ".runs/g006/attempt-001"),
];
const needle = Buffer.from(secret, "utf8");
const matches: string[] = [];
let filesScanned = 0;

function visit(path: string): void {
	for (const entry of readdirSync(path, { withFileTypes: true })) {
		const target = resolve(path, entry.name);
		if (entry.isSymbolicLink()) continue;
		if (entry.isDirectory()) {
			visit(target);
		} else if (entry.isFile()) {
			filesScanned += 1;
			if (readFileSync(target).includes(needle)) {
				matches.push(relative(projectRoot, target).replaceAll("\\", "/"));
			}
		}
	}
}

for (const root of roots) if (existsSync(root)) visit(root);
const result = {
	timestamp: new Date().toISOString(),
	scope: "final-g006-artifacts",
	credential_configured: true,
	filesScanned,
	matchCount: matches.length,
	matches,
	finalGateERescanRequired: false,
};
writeJson(resolve(projectRoot, ".runs/g006/attempt-001/security/secret-scan.json"), result);
if (matches.length > 0) throw new Error(`secret value found in ${matches.length} artifact(s)`);
console.log(JSON.stringify({ credential_configured: true, filesScanned, matchCount: 0 }));
