import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { AdaptationLineageViewV35, ComparisonViewV35, LegacyRunFallbackViewV35 } from "../contracts/v35-types.ts";

function portable(value: string): string {
	return value.split(sep).join("/");
}

function safeRoot(root: string): string {
	const resolved = resolve(root);
	const stats = lstatSync(resolved);
	if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("Read Model source root is invalid");
	return realpathSync.native(resolved);
}

function safeFile(root: string, relativePath: string): string {
	if (relativePath === "" || relativePath.includes("\0") || isAbsolute(relativePath) || /^[A-Za-z]:/.test(relativePath) || relativePath.replaceAll("\\", "/").split("/").includes("..")) throw new Error("Read Model path escape rejected");
	const target = resolve(root, relativePath);
	const rel = relative(root, target);
	if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error("Read Model path escape rejected");
	if (!existsSync(target)) throw new Error("Read Model source is unavailable");
	const stats = lstatSync(target);
	if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("Read Model source is not an ordinary file");
	return target;
}

function safeCandidatePath(root: string, relativePath: string): string {
	if (relativePath === "" || relativePath.includes("\0") || isAbsolute(relativePath) || /^[A-Za-z]:/.test(relativePath) || relativePath.replaceAll("\\", "/").split("/").includes("..")) throw new Error("Read Model path escape rejected");
	const target = resolve(root, relativePath);
	const rel = relative(root, target);
	if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error("Read Model path escape rejected");
	return target;
}

function readObject(path: string): Record<string, unknown> {
	const value: unknown = JSON.parse(readFileSync(path, "utf8"));
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Read Model source object is invalid");
	return value as Record<string, unknown>;
}

function optionalString(value: unknown): string | null {
	return typeof value === "string" && value.length <= 256 ? value : null;
}

export function readV2RecoveryComparisonV35(options: { sourceRoot: string }): ComparisonViewV35 {
	const root = safeRoot(options.sourceRoot);
	if (!existsSync(resolve(root, "terminal.json"))) return { schema_version: 1, kind: "v2_recovery", source_status: "unavailable", run_id: null, outcome: null, candidate_ids: [], selected_candidate_id: null, source_refs: [] };
	const terminal = readObject(safeFile(root, "terminal.json"));
	const runId = optionalString(terminal.run_id);
	const outcome = optionalString(terminal.outcome);
	if (!runId || !outcome) throw new Error("V2 recovery terminal identity is invalid");
	const candidateRefs = Array.isArray(terminal.candidate_refs) ? terminal.candidate_refs : [];
	const candidateIds: string[] = [];
	const sourceRefs = ["terminal.json"];
	for (const reference of candidateRefs) {
		if (!reference || typeof reference !== "object" || typeof (reference as { path?: unknown }).path !== "string") throw new Error("V2 recovery candidate reference is invalid");
		const ref = (reference as { path: string }).path;
		const candidate = readObject(safeFile(root, ref));
		const id = optionalString(candidate.candidate_path_id);
		if (!id) throw new Error("V2 recovery candidate identity is invalid");
		candidateIds.push(id);
		sourceRefs.push(portable(ref));
	}
	const selected = optionalString(terminal.selected_candidate_id);
	if (selected !== null && !candidateIds.includes(selected)) throw new Error("V2 recovery selection is outside candidate membership");
	return { schema_version: 1, kind: "v2_recovery", source_status: candidateIds.length === 0 ? "not_recorded" : "available", run_id: runId, outcome, candidate_ids: candidateIds, selected_candidate_id: selected, source_refs: sourceRefs };
}

export function readV3PromptAdaptationV35(options: { sourceRoot: string }): AdaptationLineageViewV35 {
	const root = safeRoot(options.sourceRoot);
	if (!existsSync(resolve(root, "manifest.json"))) return { schema_version: 1, kind: "v3_prompt_adaptation", source_status: "unavailable", run_id: null, binding_digest: null, runtime_path: null, verifier_status: null, source_refs: [] };
	const manifest = readObject(safeFile(root, "manifest.json"));
	const runtime = existsSync(resolve(root, "runtime.json")) ? readObject(safeFile(root, "runtime.json")) : null;
	const runId = optionalString(manifest.run_id);
	if (!runId) throw new Error("V3 adaptation Run identity is invalid");
	const binding = optionalString(manifest.binding_digest);
	if (runtime && optionalString(runtime.run_id) !== runId) throw new Error("V3 adaptation runtime/Manifest identity mismatch");
	if (runtime && binding !== optionalString(runtime.binding_digest)) throw new Error("V3 adaptation binding identity mismatch");
	return { schema_version: 1, kind: "v3_prompt_adaptation", source_status: runtime ? "available" : "not_recorded", run_id: runId, binding_digest: binding, runtime_path: optionalString(runtime?.runtime_path), verifier_status: optionalString(manifest.verifier_status), source_refs: runtime ? ["manifest.json", "runtime.json"] : ["manifest.json"] };
}

export function goal2SkillComparisonPlaceholderV35(): ComparisonViewV35 {
	return { schema_version: 1, kind: "goal2_skill", source_status: "unavailable", run_id: null, outcome: null, candidate_ids: [], selected_candidate_id: null, source_refs: [] };
}

export function readLegacyRunFallbackV35(options: { sourceRoot: string; sourceRef?: string }): LegacyRunFallbackViewV35 {
	const root = safeRoot(options.sourceRoot);
	const sourceRef = options.sourceRef ?? "manifest.json";
	if (!existsSync(safeCandidatePath(root, sourceRef))) return { schema_version: 1, source_status: "unavailable", run_id: null, status: null, session_link: "not_recorded", source_ref: portable(sourceRef) };
	const source = readObject(safeFile(root, sourceRef));
	return { schema_version: 1, source_status: "available", run_id: optionalString(source.run_id), status: optionalString(source.status) ?? optionalString(source.outcome) ?? optionalString(source.verifier_status), session_link: typeof source.session_id === "string" || source.primary_session_ref !== undefined ? "available" : "not_recorded", source_ref: portable(sourceRef) };
}
