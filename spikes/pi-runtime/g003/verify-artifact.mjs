import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { assertSafeDataEntries, digest, parseTarGzip } from "./tar-artifact.mjs";

const EXPECTED = {
	name: "@earendil-works/pi-ai",
	version: "0.82.1",
	tarballUrl: "https://registry.npmjs.org/@earendil-works/pi-ai/-/pi-ai-0.82.1.tgz",
	integrity: "sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A==",
	shasum: "02ebdfc2997fd88ca1f51a7b5c01f337a9462f34",
	gitHead: "b4f293684bba718d59cc1157679bcf6157b3a7f5",
};

const sourceRoot = resolve(process.argv[2] ?? ".runs/g003/source");
const evidenceRoot = resolve(process.argv[3] ?? ".runs/g003/evidence");
const tarballs = readdirSync(sourceRoot).filter((name) => name.endsWith(".tgz"));
if (tarballs.length !== 1) throw new Error(`expected exactly one .tgz in ${sourceRoot}, found ${tarballs.length}`);

const tarballPath = resolve(sourceRoot, tarballs[0]);
const tarball = readFileSync(tarballPath);
const sha512Base64 = digest("sha512", tarball, "base64");
const sha1 = digest("sha1", tarball);
if (`sha512-${sha512Base64}` !== EXPECTED.integrity) throw new Error("tarball SHA-512 integrity mismatch");
if (sha1 !== EXPECTED.shasum) throw new Error("tarball SHA-1 shasum mismatch");

const entries = parseTarGzip(tarball);
const selected = assertSafeDataEntries(entries);
const manifest = selected.find((entry) => entry.path.endsWith("/.manifest.json"));
if (!manifest) throw new Error("verified selection unexpectedly lacks .manifest.json");

mkdirSync(evidenceRoot, { recursive: false });
writeFileSync(
	resolve(evidenceRoot, "registry-metadata.json"),
	`${JSON.stringify({ ...EXPECTED, tarballFile: basename(tarballPath) }, null, 2)}\n`,
);
writeFileSync(
	resolve(evidenceRoot, "tarball-hashes.json"),
	`${JSON.stringify({ sha512Base64, integrity: `sha512-${sha512Base64}`, sha1 }, null, 2)}\n`,
);
writeFileSync(
	resolve(evidenceRoot, "archive-inventory.json"),
	`${JSON.stringify(entries.map(({ path, size, type, linkPath }) => ({ path, size, type, linkPath })), null, 2)}\n`,
);
writeFileSync(
	resolve(evidenceRoot, "selected-data-inventory.json"),
	`${JSON.stringify(selected.map(({ path, size, type }) => ({ path, size, type })), null, 2)}\n`,
);
writeFileSync(resolve(evidenceRoot, "model-data-manifest.json"), manifest.data);

console.log(
	JSON.stringify({ tarball: basename(tarballPath), sha512Base64, sha1, archiveMembers: entries.length, selectedMembers: selected.length }),
);
