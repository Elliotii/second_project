import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { assertSafeDataEntries, digest, parseTarGzip } from "../g003/tar-artifact.mjs";

const projectRoot = resolve(process.argv[2] ?? ".");
const tarballPath = resolve(projectRoot, ".runs/g005/source/earendil-works-pi-ai-0.82.1.tgz");
const stagingRoot = resolve(projectRoot, ".runs/g005/staging");
const stagedDataRoot = resolve(stagingRoot, "package/dist/providers/data");
const targetDataRoot = resolve(projectRoot, ".runs/g005/pi/packages/ai/src/providers/data");
const evidenceRoot = resolve(projectRoot, ".runs/g005/evidence");

if (existsSync(stagingRoot)) throw new Error(`staging root already exists: ${stagingRoot}`);
if (existsSync(targetDataRoot)) throw new Error(`restore target already exists: ${targetDataRoot}`);

const selected = assertSafeDataEntries(parseTarGzip(readFileSync(tarballPath)));
mkdirSync(stagedDataRoot, { recursive: true });
for (const entry of selected) {
	const target = resolve(stagingRoot, entry.path);
	if (relative(stagingRoot, target).startsWith("..")) throw new Error(`staged path escaped root: ${entry.path}`);
	mkdirSync(dirname(target), { recursive: true });
	writeFileSync(target, entry.data);
}

cpSync(stagedDataRoot, targetDataRoot, { recursive: true, errorOnExist: true, force: false });
const restored = selected.map((entry) => {
	const relativePath = entry.path.slice("package/dist/providers/data/".length);
	const bytes = readFileSync(resolve(targetDataRoot, relativePath));
	if (!bytes.equals(entry.data)) throw new Error(`restored bytes differ: ${relativePath}`);
	return { relativePath, size: bytes.length, sha256: digest("sha256", bytes) };
});
writeFileSync(resolve(evidenceRoot, "restored-data-inventory.json"), `${JSON.stringify(restored, null, 2)}\n`);
console.log(JSON.stringify({ stagedDataRoot, targetDataRoot, restoredFiles: restored.length }));
