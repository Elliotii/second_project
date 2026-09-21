#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PINNED_PI_COMMIT = "027a5847901b5dde30270abaa1041046cd2b4b55";
const PI_REPOSITORY = "https://github.com/earendil-works/pi.git";
const WORKBENCH_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_ROOT = resolve(WORKBENCH_ROOT, "..");
const DEFAULT_RUNTIME_ROOT = resolve(PROJECT_ROOT, ".runs", "v0-a", "pi");
const RUNTIME_DEPENDENCIES_ROOT = resolve(WORKBENCH_ROOT, "runtime-dependencies");
const PUBLISHED_PACKAGES = [
	{
		name: "@earendil-works/pi-ai",
		version: "0.82.1",
		integrity: "sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A==",
		target: ["packages", "ai", "dist"],
	},
	{
		name: "@earendil-works/pi-agent-core",
		version: "0.82.1",
		integrity: "sha512-Z3kloziJIE2dmrisRckZX8zDca/gIv9/YdFAzeoqpHiLV2wsni6bL4hInNSjVKLbqT+4kqLIkph2JQLKvSepjg==",
		target: ["packages", "agent", "dist"],
	},
];

const HELP = `Prepare the pinned public Pi runtime used by this Workbench.

Usage:
  node scripts/bootstrap-pi-runtime.mjs [--runtime-root <path>]
  node scripts/bootstrap-pi-runtime.mjs --check [--runtime-root <path>]

The default runtime root is ../.runs/v0-a/pi. Bootstrap clones exact commit
${PINNED_PI_COMMIT}, hydrates integrity-pinned Pi AI/Agent 0.82.1 release artifacts,
and installs lockfile-bound runtime/Workbench dependencies with lifecycle scripts disabled.
`;

function parseArguments(argv) {
	let runtimeRoot = DEFAULT_RUNTIME_ROOT;
	let check = false;
	for (let index = 0; index < argv.length; index++) {
		const argument = argv[index];
		if (argument === "--help") return { help: true };
		if (argument === "--check") {
			check = true;
			continue;
		}
		if (argument === "--runtime-root") {
			const value = argv[++index];
			if (!value) throw new Error("--runtime-root requires a value");
			runtimeRoot = resolve(value);
			continue;
		}
		throw new Error(`unknown argument ${argument}`);
	}
	return { help: false, check, runtimeRoot };
}

function run(command, args, cwd) {
	const result = spawnSync(command, args, { cwd, encoding: "utf8", stdio: "inherit", windowsHide: true });
	if (result.error) throw new Error(`failed to start ${command}: ${result.error.message}`);
	if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
}

function capture(command, args, cwd) {
	const result = spawnSync(command, args, { cwd, encoding: "utf8", windowsHide: true });
	if (result.error) throw new Error(`failed to start ${command}: ${result.error.message}`);
	if (result.status !== 0) throw new Error(String(result.stderr || `${command} exited with status ${result.status}`).trim());
	return String(result.stdout).trim();
}

function runNpm(args, cwd) {
	const npmCli = process.env.npm_execpath;
	if (!npmCli) throw new Error("npm_execpath is unavailable; run bootstrap through npm run setup");
	run(process.execPath, [npmCli, ...args], cwd);
}

function captureNpm(args, cwd) {
	const npmCli = process.env.npm_execpath;
	if (!npmCli) throw new Error("npm_execpath is unavailable; run bootstrap through npm run setup");
	return capture(process.execPath, [npmCli, ...args], cwd);
}

function hydratePublishedPackages(runtimeRoot) {
	const stagingRoot = mkdtempSync(resolve(dirname(runtimeRoot), "pi-release-artifacts-"));
	try {
		for (const artifact of PUBLISHED_PACKAGES) {
			const output = captureNpm(["pack", `${artifact.name}@${artifact.version}`, "--ignore-scripts", "--json", "--pack-destination", stagingRoot], WORKBENCH_ROOT);
			const records = JSON.parse(output);
			if (!Array.isArray(records) || records.length !== 1) throw new Error(`unexpected npm pack result for ${artifact.name}`);
			const record = records[0];
			const tarball = resolve(stagingRoot, String(record.filename));
			const actualIntegrity = `sha512-${createHash("sha512").update(readFileSync(tarball)).digest("base64")}`;
			if (record.integrity !== artifact.integrity || actualIntegrity !== artifact.integrity) {
				throw new Error(`npm artifact integrity mismatch for ${artifact.name}@${artifact.version}`);
			}
			const extractRoot = resolve(stagingRoot, artifact.name.replace(/[^a-z0-9]+/gi, "-"));
			mkdirSync(extractRoot);
			run("tar", ["-xf", tarball, "-C", extractRoot], stagingRoot);
			const source = resolve(extractRoot, "package", "dist");
			if (!existsSync(source)) throw new Error(`published dist is missing for ${artifact.name}`);
			const target = resolve(runtimeRoot, ...artifact.target);
			rmSync(target, { recursive: true, force: true });
			cpSync(source, target, { recursive: true });
		}
	} finally {
		rmSync(stagingRoot, { recursive: true, force: true });
	}
}

function installRuntimeDependencies(runtimeRoot) {
	runNpm(["ci", "--omit=dev", "--ignore-scripts"], RUNTIME_DEPENDENCIES_ROOT);
	const source = resolve(RUNTIME_DEPENDENCIES_ROOT, "node_modules");
	if (!existsSync(source)) throw new Error("locked Pi runtime dependencies were not installed");
	const target = resolve(runtimeRoot, "node_modules");
	rmSync(target, { recursive: true, force: true });
	cpSync(source, target, { recursive: true });
	const scope = resolve(target, "@earendil-works");
	mkdirSync(scope, { recursive: true });
	for (const [name, packageRoot] of [
		["pi-ai", resolve(runtimeRoot, "packages", "ai")],
		["pi-agent-core", resolve(runtimeRoot, "packages", "agent")],
	]) {
		const link = resolve(scope, name);
		rmSync(link, { recursive: true, force: true });
		symlinkSync(packageRoot, link, process.platform === "win32" ? "junction" : "dir");
	}
}

function readPackage(path, expectedName) {
	if (!existsSync(path)) throw new Error(`Pi package metadata is missing: ${path}`);
	const metadata = JSON.parse(readFileSync(path, "utf8"));
	if (metadata.name !== expectedName || !metadata.exports?.["."]) throw new Error(`invalid public Pi package metadata for ${expectedName}`);
}

function checkRuntime(runtimeRoot) {
	if (!existsSync(runtimeRoot)) throw new Error(`Pi runtime is missing: ${runtimeRoot}`);
	const commit = capture("git", ["rev-parse", "HEAD"], runtimeRoot);
	if (commit !== PINNED_PI_COMMIT) throw new Error(`Pi runtime commit mismatch: expected ${PINNED_PI_COMMIT}, received ${commit}`);
	const trackedStatus = capture("git", ["status", "--porcelain", "--untracked-files=no"], runtimeRoot);
	if (trackedStatus) throw new Error("Pi runtime contains tracked source changes");
	readPackage(resolve(runtimeRoot, "packages", "agent", "package.json"), "@earendil-works/pi-agent-core");
	readPackage(resolve(runtimeRoot, "packages", "ai", "package.json"), "@earendil-works/pi-ai");
	for (const path of [
		resolve(runtimeRoot, "packages", "agent", "dist", "index.js"),
		resolve(runtimeRoot, "packages", "agent", "dist", "node.js"),
		resolve(runtimeRoot, "packages", "ai", "dist", "index.js"),
	]) {
		if (!existsSync(path)) throw new Error(`Pi emitted public module is missing: ${path}`);
	}
	for (const [link, target] of [
		[resolve(runtimeRoot, "node_modules", "@earendil-works", "pi-ai"), resolve(runtimeRoot, "packages", "ai")],
		[resolve(runtimeRoot, "node_modules", "@earendil-works", "pi-agent-core"), resolve(runtimeRoot, "packages", "agent")],
	]) {
		if (!existsSync(link) || realpathSync(link) !== realpathSync(target)) throw new Error(`Pi runtime package link mismatch: ${link}`);
	}
	return commit;
}

function bootstrap(runtimeRoot) {
	if (!existsSync(runtimeRoot)) {
		mkdirSync(dirname(runtimeRoot), { recursive: true });
		run("git", ["clone", "--filter=blob:none", "--no-checkout", PI_REPOSITORY, runtimeRoot], PROJECT_ROOT);
	} else if (readdirSync(runtimeRoot).length === 0) {
		run("git", ["init"], runtimeRoot);
		run("git", ["remote", "add", "origin", PI_REPOSITORY], runtimeRoot);
	} else if (!existsSync(resolve(runtimeRoot, ".git"))) {
		throw new Error(`refusing to reuse a non-empty non-Git runtime root: ${runtimeRoot}`);
	}
	const origin = capture("git", ["remote", "get-url", "origin"], runtimeRoot);
	if (origin !== PI_REPOSITORY) throw new Error(`Pi runtime origin mismatch: expected ${PI_REPOSITORY}, received ${origin}`);
	run("git", ["fetch", "--depth", "1", "origin", PINNED_PI_COMMIT], runtimeRoot);
	run("git", ["checkout", "--detach", PINNED_PI_COMMIT], runtimeRoot);
	installRuntimeDependencies(runtimeRoot);
	hydratePublishedPackages(runtimeRoot);
	runNpm(["ci", "--ignore-scripts"], WORKBENCH_ROOT);
	return checkRuntime(runtimeRoot);
}

try {
	const options = parseArguments(process.argv.slice(2));
	if (options.help) {
		process.stdout.write(HELP);
	} else {
		const commit = options.check ? checkRuntime(options.runtimeRoot) : bootstrap(options.runtimeRoot);
		process.stdout.write(`${options.check ? "checked" : "prepared"} Pi runtime ${commit}\nPI_RUNTIME_ROOT=${options.runtimeRoot}\n`);
	}
} catch (error) {
	process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
	process.exitCode = 1;
}
