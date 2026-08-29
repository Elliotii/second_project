import { renderAdaptiveSkillMarkdownV3 } from "../skill/adapter-v3.ts";
import type { CandidateSpec } from "./contracts.ts";

export const GENERATED_SKILL_NAME = "skill" as const;

export function renderSkill(spec: CandidateSpec): string {
	const body = `# ${spec.title}\n\n## When to use\n\n${spec.when_to_use.map((item) => `- ${item}`).join("\n")}\n\n## Procedure\n\n${spec.steps.map((step, index) => `${index + 1}. ${step.instruction}`).join("\n")}\n\n## Completion checks\n\n${spec.completion_checks.map((item) => `- ${item}`).join("\n")}\n\n## Do not\n\n${spec.do_not.map((item) => `- ${item}`).join("\n")}\n`;
	const description = spec.when_to_use[0]!.replace(/[\r\n:]+/g, " ").trim();
	return renderAdaptiveSkillMarkdownV3({ skill_name: GENERATED_SKILL_NAME, description, markdown_body: body });
}
