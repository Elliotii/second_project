import { lstatSync, readFileSync } from "node:fs";
import { sha256, stableJson } from "../hash.ts";
import type { SecretScanResultV0B } from "../contracts/v0b-types.ts";
import { secretRelevantObjectProjectionV0B } from "./terminal-policy.ts";

const MAX_SCANNED_FILE_BYTES = 1_048_576;
const RULES: ReadonlyArray<{ id: string; pattern: RegExp }> = [
	{ id: "reasoning_block_envelope", pattern: /"type"\s*:\s*"thinking"/i },
	{ id: "thought_signature_field", pattern: /"(?:thoughtSignature|thinkingSignature)"\s*:/i },
	{ id: "bearer_credential", pattern: /\bBearer(?:\s|\\[tnr])+[A-Za-z0-9._~+/=-]{8,}/i },
	{
		id: "basic_authorization",
		pattern: /(?:^|[^A-Za-z0-9_])"?authorization"?\s*:\s*"?Basic(?:\s|\\[tnr])+[A-Za-z0-9+/=]{8,}/i,
	},
	{
		id: "credential_assignment",
		pattern: /(?:api[_-]?key|authorization|auth[_-]?token|access[_-]?token)\s*["']?\s*[:=]\s*["']?(?:sk-|V0B_|[A-Za-z0-9._~+/=-]{16,})/i,
	},
	{ id: "model_environment_assignment", pattern: /(?:OPENAI|ANTHROPIC|DEEPSEEK)[A-Z0-9_]*\s*=/i },
	{ id: "private_reasoning_sentinel", pattern: /V0B_PRIVATE_(?:ANALYSIS|SIGNATURE)_SENTINEL/i },
];

export interface SecretScanInputV0B {
	files: Array<{ scope_label: string; path: string }>;
	objects: Array<{ scope_label: string; value: unknown }>;
	faultInjection?: "scanner_error";
}

function scanText(
	scopeLabel: string,
	text: string,
	matches: SecretScanResultV0B["matches"],
	seen: Set<string>,
): void {
	for (const rule of RULES) {
		const key = `${scopeLabel}\0${rule.id}`;
		if (rule.pattern.test(text) && !seen.has(key)) {
			seen.add(key);
			matches.push({ scope_label: scopeLabel, rule_id: rule.id });
		}
	}
}

function decodedJsonRepresentations(text: string): string[] {
	const decoded: string[] = [];
	try {
		decoded.push(stableJson(JSON.parse(text) as unknown));
		return decoded;
	} catch {
		// JSONL and plain text continue through bounded per-line decoding.
	}
	const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
	if (lines.length === 0) return decoded;
	const values: unknown[] = [];
	for (const line of lines) {
		try {
			values.push(JSON.parse(line) as unknown);
		} catch {
			return decoded;
		}
	}
	decoded.push(stableJson(values));
	return decoded;
}

export function scanPreterminalEvidenceV0B(input: SecretScanInputV0B): SecretScanResultV0B {
	if (input.faultInjection === "scanner_error") throw new Error("fixed scanner failure injection");
	const matches: SecretScanResultV0B["matches"] = [];
	const seenMatches = new Set<string>();
	const scopes: SecretScanResultV0B["scopes"] = [];
	for (const file of input.files) {
		const stats = lstatSync(file.path);
		if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("scan input is not an ordinary file");
		if (stats.size > MAX_SCANNED_FILE_BYTES) throw new Error("scan input exceeds bounded scanner limit");
		const bytes = readFileSync(file.path);
		const text = bytes.toString("utf8");
		scanText(file.scope_label, text, matches, seenMatches);
		for (const decoded of decodedJsonRepresentations(text)) {
			scanText(file.scope_label, decoded, matches, seenMatches);
		}
		scopes.push({
			scope_label: file.scope_label,
			kind: "file",
			sha256: sha256(bytes),
			size_bytes: bytes.length,
		});
	}
	for (const object of input.objects) {
		const serialized = stableJson(secretRelevantObjectProjectionV0B(object.scope_label, object.value));
		scanText(object.scope_label, serialized, matches, seenMatches);
		scopes.push({
			scope_label: object.scope_label,
			kind: "object",
			sha256: sha256(serialized),
			size_bytes: Buffer.byteLength(serialized, "utf8"),
		});
	}
	return {
		schema_version: 1,
		status: matches.length === 0 ? "passed" : "rejected",
		completed: true,
		scope_labels: [...input.files.map((entry) => entry.scope_label), ...input.objects.map((entry) => entry.scope_label)],
		scanned_file_count: input.files.length,
		scanned_object_count: input.objects.length,
		scopes,
		match_count: matches.length,
		matches,
	};
}
