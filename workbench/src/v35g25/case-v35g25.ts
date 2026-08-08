import { digestObject } from "../hash.ts";
import type { BoundedToolRestrictions } from "../pi/tool-profile.ts";
import { GOAL2_TASK_POLICY_V35 } from "../v35g2/case-v35g2.ts";

export const GOAL25_TOOL_RESTRICTIONS_V35: BoundedToolRestrictions = Object.freeze({
	allowed_tool_names: ["workspace_read", "workspace_write", "run_command"],
	readable_paths: ["src/subject.ts"],
	allow_repository_commands: false,
	expose_task_command_ids: true,
	terminate_on_successful_command_ids: ["public_test"],
});

export const GOAL25_LEGAL_COMMAND_IDS_V35 = Object.freeze(
	GOAL2_TASK_POLICY_V35.command_descriptors.map((descriptor) => descriptor.command_id),
);

export const GOAL25_EFFECTIVE_TOOL_CONFIGURATION_SHA256_V35 = digestObject({
	restrictions: GOAL25_TOOL_RESTRICTIONS_V35,
	command_descriptors: GOAL2_TASK_POLICY_V35.command_descriptors,
});
