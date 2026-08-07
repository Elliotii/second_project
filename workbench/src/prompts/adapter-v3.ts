import { sha256 } from "../hash.ts";

export interface PromptAddendumPreviewV3 {
	base_prompt_sha256: string;
	entry_ids: string[];
	entry_digests: string[];
	composed_prompt: string;
	composed_prompt_sha256: string;
}

const DELIMITER = "\n\n--- V3 staged prompt addendum: ";

export function composePromptAddendaV3(options: { basePrompt: string; expectedBasePromptSha256: string; entries: Array<{ entry_id: string; content: string }> }): PromptAddendumPreviewV3 {
	if (sha256(options.basePrompt) !== options.expectedBasePromptSha256) throw new Error("immutable base prompt digest mismatch");
	if (options.entries.length < 1 || options.entries.length > 2) throw new Error("one or two prompt addenda required");
	const entries = [...options.entries].sort((left, right) => left.entry_id.localeCompare(right.entry_id));
	if (new Set(entries.map((entry) => entry.entry_id)).size !== entries.length) throw new Error("duplicate prompt addendum entry_id");
	let composed = options.basePrompt;
	for (const entry of entries) {
		if (entry.content.length === 0 || Buffer.byteLength(entry.content, "utf8") > 8192 || entry.content.includes("\0")) throw new Error("invalid prompt addendum content");
		composed += `${DELIMITER}${entry.entry_id} ---\n${entry.content}`;
	}
	if (Buffer.byteLength(composed, "utf8") > 64 * 1024) throw new Error("composed prompt byte limit exceeded");
	return { base_prompt_sha256: options.expectedBasePromptSha256, entry_ids: entries.map((entry) => entry.entry_id), entry_digests: entries.map((entry) => sha256(entry.content)), composed_prompt: composed, composed_prompt_sha256: sha256(composed) };
}
