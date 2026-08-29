import type { CandidateSpec, LoadedSourceRunSet, ValidationResult } from "./contracts.ts";

const SOURCE_AB_V1_FIXED_LITERALS = [
	"pause_job",
	"disable_worker",
	"job.paused",
	"worker.disabled",
	"pause-job.ts",
	"disable-worker.ts",
] as const;

function renderedFields(spec: CandidateSpec): Array<{ field: string; value: string }> {
	return [
		{ field: "title", value: spec.title },
		...spec.when_to_use.map((value, index) => ({ field: `when_to_use[${index}]`, value })),
		...spec.steps.map((step, index) => ({ field: `steps[${index}].instruction`, value: step.instruction })),
		...spec.completion_checks.map((value, index) => ({ field: `completion_checks[${index}]`, value })),
		...spec.do_not.map((value, index) => ({ field: `do_not[${index}]`, value })),
	];
}

export function validateCandidateSpec(spec: CandidateSpec, sourceRunSet: LoadedSourceRunSet): ValidationResult {
	const issues: ValidationResult["issues"] = [];
	const add = (code: string, message: string): void => { issues.push({ code, message }); };
	if (spec.schema_version !== 1) add("invalid_schema_version", "CandidateSpec schema_version must be 1");
	if (typeof spec.title !== "string" || spec.title.trim().length === 0) add("invalid_title", "CandidateSpec title must be non-empty");
	if (spec.task_family !== sourceRunSet.taskFamily) add("task_family_mismatch", "CandidateSpec task_family must match SourceRunSet");
	for (const [field, value] of [["when_to_use", spec.when_to_use], ["completion_checks", spec.completion_checks], ["do_not", spec.do_not]] as const) {
		if (!Array.isArray(value) || value.length === 0 || value.some((entry) => typeof entry !== "string" || entry.trim().length === 0)) add(`invalid_${field}`, `${field} must be a non-empty string array`);
	}
	if (!Array.isArray(spec.steps) || spec.steps.length === 0) add("missing_steps", "CandidateSpec must contain at least one Step");
	const allowed = new Set(sourceRunSet.sourceRunIds);
	for (const [index, step] of (Array.isArray(spec.steps) ? spec.steps : []).entries()) {
		if (!step || typeof step !== "object" || typeof step.instruction !== "string" || step.instruction.trim().length === 0) { add("invalid_step", `Step ${index + 1} instruction must be non-empty`); continue; }
		if (!Array.isArray(step.support_run_ids) || new Set(step.support_run_ids).size < 2) add("insufficient_step_support", `Step ${index + 1} must cite two distinct source Runs`);
		else for (const runId of step.support_run_ids) if (typeof runId !== "string" || !allowed.has(runId)) add("unknown_support_run", `Step ${index + 1} cites an unknown source Run`);
	}
	return { passed: issues.length === 0, issues };
}

export function validateSourceAbV1FixedLiterals(spec: CandidateSpec, renderedSkill?: string): ValidationResult {
	const issues: ValidationResult["issues"] = [];
	const fields = renderedFields(spec);
	if (renderedSkill !== undefined) fields.push({ field: "skill/SKILL.md", value: renderedSkill });
	for (const { field, value } of fields) {
		const lowered = value.toLowerCase();
		for (const literal of SOURCE_AB_V1_FIXED_LITERALS) {
			if (!lowered.includes(literal.toLowerCase())) continue;
			issues.push({
				code: "source_specific_content",
				message: "Candidate contains a fixed source-ab-v1 Smoke literal",
				field,
				matched_value: literal,
				rule: "source_ab_v1_fixed_literal",
			});
		}
	}
	return { passed: issues.length === 0, issues };
}
