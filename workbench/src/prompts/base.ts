import { sha256 } from "../hash.ts";

export const SYSTEM_PROMPT_ID = "project_minimal_base_v1" as const;

export const SYSTEM_PROMPT = `You are working inside one restricted temporary Workspace.
Use only the tools provided by the host. Never access or modify anything outside the Workspace.
Do not modify protected task, package, or test files. Change only paths explicitly allowed by the task.
Run the task-declared check before finishing.
Tool completion and Agent settlement are execution facts, not an external task-success Outcome.`;

export const SYSTEM_PROMPT_SHA256 = sha256(SYSTEM_PROMPT);
