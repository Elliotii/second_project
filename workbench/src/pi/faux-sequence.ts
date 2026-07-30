import { digestObject } from "../hash.ts";

export const INITIAL_PARSE_DURATION_SOURCE = `export function parseDuration(input: string): number {
\tconst match = input.trim().match(/^(\\d+)(ms|s|m)/);
\tif (!match) throw new Error("invalid duration");

\tconst value = Number(match[1]);
\tconst multiplier = match[2] === "ms" ? 1 : match[2] === "s" ? 1_000 : 60_000;
\treturn value * multiplier;
}
`;

export const REPAIRED_PARSE_DURATION_SOURCE = `export function parseDuration(input: string): number {
\tconst match = input.trim().match(/^(\\d+)(ms|s|m)$/);
\tif (!match) throw new Error("invalid duration");

\tconst value = Number(match[1]);
\tconst multiplier = match[2] === "ms" ? 1 : match[2] === "s" ? 1_000 : 60_000;
\tconst result = value * multiplier;
\tif (!Number.isSafeInteger(value) || !Number.isSafeInteger(result)) throw new Error("unsafe duration");
\treturn result;
}
`;

export const FAUX_SEQUENCE_DESCRIPTOR = [
	{ call: 1, tool: "workspace_list", arguments: { path: ".", depth: 3 } },
	{ call: 2, tool: "workspace_search", arguments: { query: "parseDuration", path: "." } },
	{ call: 3, tool: "workspace_read", arguments: { path: "task.md" } },
	{ call: 4, tool: "workspace_read", arguments: { path: "src/parse-duration.ts" } },
	{ call: 5, tool: "workspace_read", arguments: { path: "test/public.test.ts" } },
	{
		call: 6,
		tool: "workspace_edit",
		arguments: {
			path: "src/parse-duration.ts",
			old_text: INITIAL_PARSE_DURATION_SOURCE,
			new_text: REPAIRED_PARSE_DURATION_SOURCE,
		},
	},
	{ call: 7, tool: "run_command", arguments: { command_id: "test" } },
	{ call: 8, final: "The source was repaired and the declared public test passed." },
] as const;

export const FAUX_SEQUENCE_SHA256 = digestObject(FAUX_SEQUENCE_DESCRIPTOR);
