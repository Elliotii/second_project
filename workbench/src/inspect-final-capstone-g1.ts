import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { TrustedEvidenceAdmissionInspectionG1, TrustedEvidenceAdmissionRecordG1 } from "./contracts/final-capstone-g1-types.ts";
import { stableJson } from "./hash.ts";
import { deriveTrustedEvidenceAdmissionG1, validateAdmissionEnvelopeG1 } from "./refinement/evidence-admission-g1.ts";

const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function projectRelativeFile(projectRoot: string, path: string, label: string): string {
	if (typeof path !== "string" || path.length === 0 || isAbsolute(path) || path.replaceAll("\\", "/").split("/").includes("..") || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(path)) throw new Error(`${label} must be project-relative`);
	const root = resolve(projectRoot); const target = resolve(root, path);
	if (!contained(root, target)) throw new Error(`${label} escapes project root`);
	let current = root;
	for (const segment of relative(root, target).split(sep).filter(Boolean)) {
		current = resolve(current, segment);
		if (!existsSync(current)) throw new Error(`${label} is missing`);
		if (lstatSync(current).isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
	}
	if (!contained(realpathSync.native(root), realpathSync.native(target))) throw new Error(`${label} real path escapes project root`);
	return target;
}

function ordinaryJson(path: string, label: string): unknown {
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`${label} must be an ordinary singly linked file`);
	return JSON.parse(readFileSync(path, "utf8"));
}

export async function inspectTrustedEvidenceAdmissionG1(options: { projectRoot: string; admissionRoot: string; registrationPath: string; admissionId: string; expectedProjectId: string }): Promise<TrustedEvidenceAdmissionInspectionG1> {
	const errors: string[] = [];
	let stored: TrustedEvidenceAdmissionRecordG1 | null = null;
	try {
		if (!ID.test(options.admissionId)) throw new Error("admission ID is invalid");
		const admissionPath = `${options.admissionRoot.replaceAll("\\", "/")}/${options.admissionId}/admission.json`;
		stored = validateAdmissionEnvelopeG1(ordinaryJson(projectRelativeFile(options.projectRoot, admissionPath, "admission record"), "admission record"));
		if (stored.admission_id !== options.admissionId || stored.project_id !== options.expectedProjectId) throw new Error("admission path/project identity mismatch");
		const registration = ordinaryJson(projectRelativeFile(options.projectRoot, options.registrationPath, "Host registration"), "Host registration");
		const recomputed = await deriveTrustedEvidenceAdmissionG1({ projectRoot: options.projectRoot, expectedProjectId: options.expectedProjectId, registration });
		if (stableJson(stored) !== stableJson(recomputed.record)) throw new Error("admission recomputation mismatch");
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
	}
	return {
		integrity_valid: errors.length === 0,
		errors,
		admission_id: stored?.admission_id ?? null,
		admission_digest: stored?.admission_digest ?? null,
		evidence_id: stored?.frozen_evidence.evidence_id ?? null,
		evidence_digest: stored?.frozen_evidence.evidence_digest ?? null,
		projector_result: stored ? stored.projector_result === "no_opportunity" ? "no_opportunity" : stored.projector_result.opportunity_id : null,
	};
}
