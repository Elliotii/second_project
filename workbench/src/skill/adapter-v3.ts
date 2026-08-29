import { lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { basename, isAbsolute, relative, resolve, sep } from "node:path";
import { formatSkillInvocation, loadSkills, type ExecutionEnv, type FileInfo, type Result, type Skill } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { sha256 } from "../hash.ts";

const WINDOWS_ALIAS = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;
const RELATIVE_RESOURCE = /(?:\]\((?!https?:|#|\/)[^)]+\)|(?:^|[\s("'])(?:\.\.?[\\/]|references?[\\/]|assets?[\\/]))/i;

function slash(path: string): string { return path.replace(/\\/g, "/"); }
function contained(root: string, target: string): boolean { const rel = relative(root, target); return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`)); }
function mapResult<T, U, E>(result: Result<T, E>, transform: (value: T) => U): Result<U, E> { return result.ok ? { ok: true, value: transform(result.value) } : result; }
function slashInfo(info: FileInfo): FileInfo { return { ...info, name: basename(info.path), path: slash(info.path) }; }

function createSlashPathEnv(root: string): ExecutionEnv {
	const base = new NodeExecutionEnv({ cwd: root });
	return {
		cwd: slash(base.cwd), absolutePath: async (path, signal) => { void signal; return mapResult(await base.absolutePath(path), slash); },
		joinPath: async (parts, signal) => { void signal; return mapResult(await base.joinPath(parts), slash); }, readTextFile: (path, signal) => base.readTextFile(path, signal),
		readTextLines: (path, options) => base.readTextLines(path, options), readBinaryFile: (path, signal) => base.readBinaryFile(path, signal), writeFile: (path, content, signal) => base.writeFile(path, content, signal),
		appendFile: (path, content, signal) => { void signal; return base.appendFile(path, content); }, fileInfo: async (path, signal) => { void signal; return mapResult(await base.fileInfo(path), slashInfo); },
		listDir: async (path, signal) => mapResult(await base.listDir(path, signal), (entries) => entries.map(slashInfo)), canonicalPath: async (path, signal) => { void signal; return mapResult(await base.canonicalPath(path), slash); },
		exists: (path, signal) => { void signal; return base.exists(path); }, createDir: (path, options) => base.createDir(path, options), remove: (path, options) => base.remove(path, options),
		createTempDir: async (prefix, signal) => { void signal; return mapResult(await base.createTempDir(prefix), slash); }, createTempFile: async (options) => mapResult(await base.createTempFile(options), slash), exec: (command, options) => base.exec(command, options), cleanup: () => base.cleanup(),
	};
}

function scanOrdinaryTree(root: string): void {
	const stats = lstatSync(root);
	if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error("adaptive Skill root must be an ordinary directory");
	const canonicalRoot = realpathSync.native(root);
	const visit = (directory: string): void => {
		for (const entry of readdirSync(directory, { withFileTypes: true })) {
			if (entry.name.endsWith(".") || entry.name.endsWith(" ") || WINDOWS_ALIAS.test(entry.name)) throw new Error(`Windows path alias rejected: ${entry.name}`);
			const path = resolve(directory, entry.name); const child = lstatSync(path);
			if (child.isSymbolicLink()) throw new Error("adaptive Skill link/reparse point rejected");
			if (child.isDirectory()) { visit(path); continue; }
			if (!child.isFile() || child.nlink !== 1) throw new Error("adaptive Skill non-ordinary file or hardlink rejected");
			if (!contained(canonicalRoot, realpathSync.native(path))) throw new Error("adaptive Skill path escapes root");
		}
	};
	visit(root);
}

export function renderAdaptiveSkillMarkdownV3(options: { skill_name: string; description: string; markdown_body: string }): string {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.skill_name)) throw new Error("invalid adaptive Skill name");
	if (options.description.includes("\n") || options.description.includes("\r") || options.description.includes(":")) throw new Error("invalid adaptive Skill description");
	if (RELATIVE_RESOURCE.test(options.markdown_body) || /^---$/m.test(options.markdown_body) || /(?:^|\n)#!\s*\//.test(options.markdown_body)) throw new Error("adaptive Skill must be self-contained Markdown guidance");
	return `---\nname: ${options.skill_name}\ndescription: ${options.description}\ndisable-model-invocation: true\n---\n\n${options.markdown_body}\n`;
}

export interface LoadedAdaptiveSkillV3 {
	skill: Skill;
	wrapper: string;
	source_sha256: string;
	source_size_bytes: number;
	wrapper_sha256: string;
	wrapper_size_bytes: number;
}

async function loadAdaptiveSkill(options: { skillRoot: string; expectedName?: string; expectedPath?: string; expectedSourceSha256: string }): Promise<LoadedAdaptiveSkillV3> {
	const root = resolve(options.skillRoot); scanOrdinaryTree(root);
	const loaded = await loadSkills(createSlashPathEnv(root), slash(root));
	if (loaded.diagnostics.length !== 0) throw new Error(`Pi Skill diagnostics fail closed: ${JSON.stringify(loaded.diagnostics)}`);
	if (loaded.skills.length !== 1) throw new Error(`Exactly one adaptive Skill required; observed ${loaded.skills.length}`);
	const skill = loaded.skills[0]!;
	if ((options.expectedName !== undefined && skill.name !== options.expectedName) || skill.disableModelInvocation !== true) throw new Error("adaptive Skill public identity mismatch");
	if (RELATIVE_RESOURCE.test(skill.content)) throw new Error("adaptive Skill relative resource rejected");
	const sourcePath = realpathSync.native(skill.filePath);
	if (options.expectedPath !== undefined && sourcePath.toLowerCase() !== realpathSync.native(resolve(options.expectedPath)).toLowerCase()) throw new Error("adaptive Skill source path mismatch");
	const source = readFileSync(sourcePath); if (sha256(source) !== options.expectedSourceSha256) throw new Error("adaptive Skill source digest mismatch");
	const wrapper = formatSkillInvocation(skill);
	return { skill, wrapper, source_sha256: sha256(source), source_size_bytes: source.length, wrapper_sha256: sha256(wrapper), wrapper_size_bytes: Buffer.byteLength(wrapper, "utf8") };
}

export async function loadAdaptiveSkillV3(options: { skillRoot: string; expectedName: string; expectedSourceSha256: string }): Promise<LoadedAdaptiveSkillV3> {
	return loadAdaptiveSkill(options);
}

export async function loadAdaptiveSkillPathV3(options: { skillPath: string; expectedSourceSha256: string }): Promise<LoadedAdaptiveSkillV3> {
	const skillPath = resolve(options.skillPath);
	return loadAdaptiveSkill({ skillRoot: resolve(skillPath, ".."), expectedPath: skillPath, expectedSourceSha256: options.expectedSourceSha256 });
}
