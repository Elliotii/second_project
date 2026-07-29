import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { assertSafeDataEntries, digest, parseTarGzip } from "../g003/tar-artifact.mjs";

const EXPECTED = Object.freeze({
	packageName: "@earendil-works/pi-ai",
	version: "0.82.1",
	integrity: "sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A==",
	shasum: "02ebdfc2997fd88ca1f51a7b5c01f337a9462f34",
	gitHead: "b4f293684bba718d59cc1157679bcf6157b3a7f5",
	archiveMembers: 712,
	selectedModelDataFiles: 38,
	restoredManifestSha256: "c2d89b03ccb2c095c59ead0437592b21e9676d049ad8e92ea90a466adf10b24d",
});

function fail(message) {
	throw new Error(message);
}

function requireEqual(actual, expected, label) {
	if (actual !== expected) fail(`${label} mismatch: expected ${expected}, received ${actual}`);
}

function writeJson(path, value) {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
}

const projectRoot = resolve(process.argv[2] ?? fail("project root argument is required"));
const tarballPath = resolve(projectRoot, ".runs/g006/source/earendil-works-pi-ai-0.82.1.tgz");
const evidenceRoot = resolve(projectRoot, ".runs/g006/preflight/setup");
const frozenRegistryMetadataPath = resolve(projectRoot, ".runs/g005/evidence/registry-metadata.json");
const tarball = readFileSync(tarballPath);
const entries = parseTarGzip(tarball);
const selected = assertSafeDataEntries(entries);
const frozenRegistryMetadata = JSON.parse(readFileSync(frozenRegistryMetadataPath, "utf8"));

const sha1 = digest("sha1", tarball);
const sha256 = digest("sha256", tarball);
const sha512 = createHash("sha512").update(tarball).digest("base64");
requireEqual(sha1, EXPECTED.shasum, "tarball shasum");
requireEqual(`sha512-${sha512}`, EXPECTED.integrity, "tarball integrity");
requireEqual(entries.length, EXPECTED.archiveMembers, "archive member count");
requireEqual(selected.length, EXPECTED.selectedModelDataFiles, "selected model-data count");

const packageEntry = entries.find((entry) => entry.path === "package/package.json");
if (!packageEntry || packageEntry.type !== "0") fail("package/package.json is missing or not a regular file");
const packageJson = JSON.parse(packageEntry.data.toString("utf8"));
requireEqual(packageJson.name, EXPECTED.packageName, "package name");
requireEqual(packageJson.version, EXPECTED.version, "package version");
requireEqual(frozenRegistryMetadata.name, EXPECTED.packageName, "registry package name");
requireEqual(frozenRegistryMetadata.version, EXPECTED.version, "registry package version");
requireEqual(frozenRegistryMetadata.integrity, EXPECTED.integrity, "registry integrity");
requireEqual(frozenRegistryMetadata.shasum, EXPECTED.shasum, "registry shasum");
requireEqual(frozenRegistryMetadata.gitHead, EXPECTED.gitHead, "registry gitHead");

const manifestEntry = selected.find((entry) => entry.path.endsWith("/.manifest.json"));
if (!manifestEntry) fail("selected model data is missing .manifest.json");
const manifestSha256 = digest("sha256", manifestEntry.data);
requireEqual(manifestSha256, EXPECTED.restoredManifestSha256, "restored manifest SHA-256");

const archiveInventory = entries.map((entry) => ({
	path: entry.path,
	size: entry.size,
	type: entry.type,
	linkPath: entry.linkPath,
	sha256: digest("sha256", entry.data),
}));
const selectedInventory = selected.map((entry) => ({
	path: entry.path,
	size: entry.size,
	sha256: digest("sha256", entry.data),
}));

writeJson(resolve(evidenceRoot, "tarball-hashes.json"), {
	schemaVersion: 1,
	package: `${EXPECTED.packageName}@${EXPECTED.version}`,
	sha1,
	sha256,
	sha512: `sha512-${sha512}`,
	expectedIntegrity: EXPECTED.integrity,
	expectedShasum: EXPECTED.shasum,
});
writeJson(resolve(evidenceRoot, "archive-inventory.json"), {
	schemaVersion: 1,
	memberCount: archiveInventory.length,
	members: archiveInventory,
});
writeJson(resolve(evidenceRoot, "selected-data-inventory.json"), {
	schemaVersion: 1,
	selectedCount: selectedInventory.length,
	files: selectedInventory,
});
writeJson(resolve(evidenceRoot, "registry-metadata.json"), frozenRegistryMetadata);
writeFileSync(resolve(evidenceRoot, "model-data-manifest.json"), manifestEntry.data, { flag: "wx" });
writeJson(resolve(evidenceRoot, "artifact-validation.json"), {
	schemaVersion: 1,
	validated: true,
	package: `${packageJson.name}@${packageJson.version}`,
	gitHead: frozenRegistryMetadata.gitHead,
	gitHeadEvidence: "frozen G005 registry metadata (raw registry response not retained)",
	archiveMembers: entries.length,
	selectedModelDataFiles: selected.length,
	restoredManifestSha256: manifestSha256,
	archiveSafety: "pass",
	registryRawResponseRetained: false,
});

console.log(JSON.stringify({
	validated: true,
	package: `${packageJson.name}@${packageJson.version}`,
	sha256,
	archiveMembers: entries.length,
	selectedModelDataFiles: selected.length,
	restoredManifestSha256: manifestSha256,
}, null, 2));
