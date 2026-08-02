import { lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { basename, isAbsolute, relative, resolve, sep } from "node:path";
import { formatSkillInvocation, loadSkills, type ExecutionEnv, type FileInfo, type Result, type Skill } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import type { SkillRefV1 } from "../contracts/v1-types.ts";
import { sha256 } from "../hash.ts";

const EXPECTED_NAME = "reliability-completion" as const;
const EXPECTED_DESCRIPTION = "Complete a bounded TypeScript maintenance task and verify the result before finishing.";
const EXPECTED_CONTENT = "Inspect the provided TypeScript task before editing. Preserve the declared public API and protected files. Make the smallest change that satisfies the task, run the task-declared public check, inspect the result, and only then report completion. If a check fails, use its public output to make one focused correction. Do not claim success from source inspection alone.";
const EXPECTED_PARENT_REF = "fixtures/skills/v1" as const;
const EXPECTED_SOURCE_REF = "fixtures/skills/v1/reliability-completion/SKILL.md" as const;
const EXPECTED_SOURCE_SHA256 = "d41a123a4fa7c5aece7c1efece8fcc3be2040b272a5ab76f14622d3b17fc80af";
const EXPECTED_SOURCE_SIZE = 537;
const WINDOWS_ALIAS = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;
const RELATIVE_RESOURCE = /(?:\]\((?!https?:|#|\/)[^)]+\)|(?:^|[\s("'])(?:\.\.?[\\/]|references?[\\/]|assets?[\\/]))/i;

function slash(path: string): string { return path.replace(/\\/g, "/"); }
function assertSafeComponent(name: string): void {
	if (name.endsWith(".") || name.endsWith(" ") || WINDOWS_ALIAS.test(name)) throw new Error(`Windows path alias rejected: ${name}`);
}
function assertContained(root: string, target: string): void {
	const rel = relative(root, target);
	if (rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel))) return;
	throw new Error(`Skill path escapes root: ${target}`);
}
function scanOrdinaryTree(root: string): void {
	const rootStats = lstatSync(root);
	if (rootStats.isSymbolicLink()) throw new Error("Skill root link/reparse point rejected");
	if (!rootStats.isDirectory()) throw new Error("Skill root must be an ordinary directory");
	const canonicalRoot = realpathSync.native(root);
	const visit = (directory: string): void => {
		for (const entry of readdirSync(directory, { withFileTypes: true })) {
			assertSafeComponent(entry.name);
			const path = resolve(directory, entry.name);
			const stats = lstatSync(path);
			if (stats.isSymbolicLink()) throw new Error(`Skill link/reparse point rejected: ${path}`);
			if (stats.isDirectory()) { visit(path); continue; }
			if (!stats.isFile()) throw new Error(`Unsupported Skill entry: ${path}`);
			if (stats.nlink !== 1) throw new Error(`Skill hardlink rejected: ${path}`);
			assertContained(canonicalRoot, realpathSync.native(path));
		}
	};
	visit(root);
}

function mapResult<T, U, E>(result: Result<T, E>, transform: (value: T) => U): Result<U, E> {
	return result.ok ? { ok: true, value: transform(result.value) } : result;
}
function slashInfo(info: FileInfo): FileInfo { return { ...info, name: basename(info.path), path: slash(info.path) }; }
function createSlashPathEnv(projectRoot: string): ExecutionEnv {
	const base = new NodeExecutionEnv({ cwd: projectRoot });
	return {
		cwd: slash(base.cwd), absolutePath: async (path, signal) => { void signal; return mapResult(await base.absolutePath(path), slash); },
		joinPath: async (parts, signal) => { void signal; return mapResult(await base.joinPath(parts), slash); },
		readTextFile: (path, signal) => base.readTextFile(path, signal), readTextLines: (path, options) => base.readTextLines(path, options),
		readBinaryFile: (path, signal) => base.readBinaryFile(path, signal), writeFile: (path, content, signal) => base.writeFile(path, content, signal),
		appendFile: (path, content, signal) => { void signal; return base.appendFile(path, content); },
		fileInfo: async (path, signal) => { void signal; return mapResult(await base.fileInfo(path), slashInfo); },
		listDir: async (path, signal) => mapResult(await base.listDir(path, signal), (entries) => entries.map(slashInfo)),
		canonicalPath: async (path, signal) => { void signal; return mapResult(await base.canonicalPath(path), slash); },
		exists: (path, signal) => { void signal; return base.exists(path); }, createDir: (path, options) => base.createDir(path, options),
		remove: (path, options) => base.remove(path, options), createTempDir: async (prefix, signal) => { void signal; return mapResult(await base.createTempDir(prefix), slash); },
		createTempFile: async (options) => mapResult(await base.createTempFile(options), slash), exec: (command, options) => base.exec(command, options), cleanup: () => base.cleanup(),
	};
}

export interface FrozenSkillIdentityV1 {
	name: typeof EXPECTED_NAME; description: string; parent_ref: typeof EXPECTED_PARENT_REF; source_ref: typeof EXPECTED_SOURCE_REF;
	canonical_source_path: string; source_sha256: string; source_size_bytes: number; wrapper_sha256: string; wrapper_size_bytes: number;
}
export function expectedSkillIdentityV1(projectRoot: string): FrozenSkillIdentityV1 {
	const canonical_source_path = slash(realpathSync.native(resolve(projectRoot, EXPECTED_SOURCE_REF)));
	const frozenWrapper = formatSkillInvocation({ name: EXPECTED_NAME, description: EXPECTED_DESCRIPTION, content: EXPECTED_CONTENT, filePath: canonical_source_path, disableModelInvocation: true });
	return { name: EXPECTED_NAME, description: EXPECTED_DESCRIPTION, parent_ref: EXPECTED_PARENT_REF, source_ref: EXPECTED_SOURCE_REF,
		canonical_source_path, source_sha256: EXPECTED_SOURCE_SHA256, source_size_bytes: EXPECTED_SOURCE_SIZE, wrapper_sha256: sha256(frozenWrapper), wrapper_size_bytes: Buffer.byteLength(frozenWrapper, "utf8") };
}

export async function loadExactOneSkillV1(options: { projectRoot: string; skillRoot: string; expected: FrozenSkillIdentityV1 }): Promise<{ skill: Skill; ref: SkillRefV1; wrapper: string }> {
	const project = realpathSync.native(options.projectRoot);
	const lexicalRoot = resolve(options.projectRoot, options.skillRoot.replace(/[\\/]+/g, sep));
	assertContained(project, lexicalRoot);
	scanOrdinaryTree(lexicalRoot);
	const root = realpathSync.native(lexicalRoot);
	const expectedRoot = realpathSync.native(resolve(options.projectRoot, EXPECTED_PARENT_REF));
	if (root.toLowerCase() !== expectedRoot.toLowerCase()) throw new Error("Skill parent/root identity mismatch");
	const expected = options.expected;
	const frozen = expectedSkillIdentityV1(options.projectRoot);
	if (JSON.stringify(expected) !== JSON.stringify(frozen)) throw new Error("Frozen expected Skill identity invalid");
	const before = readFileSync(resolve(options.projectRoot, EXPECTED_SOURCE_REF));
	if (sha256(before) !== expected.source_sha256 || before.length !== expected.source_size_bytes) throw new Error("Skill source drift before Agent construction");
	const env = createSlashPathEnv(options.projectRoot);
	const loaded = await loadSkills(env, slash(expectedRoot));
	if (loaded.diagnostics.length !== 0) throw new Error(`Pi Skill diagnostics fail closed: ${JSON.stringify(loaded.diagnostics)}`);
	if (loaded.skills.length !== 1) throw new Error(`Exactly one Skill required; observed ${loaded.skills.length}`);
	const skill = loaded.skills[0]!;
	if (skill.name !== expected.name) throw new Error("Skill name mismatch");
	if (skill.description !== expected.description) throw new Error("Skill description mismatch");
	if (skill.disableModelInvocation !== true) throw new Error("Skill must set disable-model-invocation: true");
	if (RELATIVE_RESOURCE.test(skill.content)) throw new Error("Skill must be self-contained and contain no relative resources");
	const sourcePath = slash(realpathSync.native(skill.filePath));
	if (sourcePath.toLowerCase() !== expected.canonical_source_path.toLowerCase()) throw new Error("Skill source path mismatch");
	const source = readFileSync(skill.filePath);
	if (sha256(source) !== expected.source_sha256 || source.length !== expected.source_size_bytes) throw new Error("Skill source drift after public loader");
	const wrapper = formatSkillInvocation(skill);
	if (sha256(wrapper) !== expected.wrapper_sha256 || Buffer.byteLength(wrapper, "utf8") !== expected.wrapper_size_bytes) throw new Error("Public Skill wrapper drift from frozen expected ref");
	const ref: SkillRefV1 = { schema_version: 1, skill_id: "reliability-completion-v1", name: EXPECTED_NAME, description: EXPECTED_DESCRIPTION,
		parent_ref: EXPECTED_PARENT_REF, source_ref: EXPECTED_SOURCE_REF, canonical_source_path: sourcePath,
		source_sha256: sha256(source), source_size_bytes: source.length, wrapper_sha256: sha256(wrapper), wrapper_size_bytes: Buffer.byteLength(wrapper, "utf8"), disable_model_invocation: true,
		invocation_mode: "explicit_initial_skill", catalog_visibility: "hidden", self_contained: true, relative_resources: [] };
	return { skill, ref, wrapper };
}

export function assertNoSkillCollisionV1(skills: Skill[]): void {
	const names = new Set<string>(); const files = new Set<string>();
	for (const skill of skills) {
		const name = skill.name.toLowerCase(); const file = resolve(skill.filePath).toLowerCase();
		if (names.has(name) || files.has(file)) throw new Error("Skill name/path collision rejected");
		names.add(name); files.add(file); assertSafeComponent(basename(resolve(skill.filePath, "..")));
	}
}
