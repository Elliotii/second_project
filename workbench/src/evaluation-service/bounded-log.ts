import { closeSync, mkdirSync, openSync, writeSync } from "node:fs";
import { dirname } from "node:path";
import { StringDecoder } from "node:string_decoder";

export interface BoundedLogResult {
	total_bytes: number;
	stored_bytes: number;
	truncated: boolean;
	redactions: number;
}

export interface BoundedLogSink {
	write(chunk: Buffer | string): void;
	close(): BoundedLogResult;
}

export function createBoundedLogSink(path: string, limitBytes: number, secrets: readonly string[]): BoundedLogSink {
	if (!Number.isSafeInteger(limitBytes) || limitBytes < 1) throw new Error("log byte limit must be positive");
	const filtered = [...new Set(secrets.filter((secret) => secret.length > 0))].sort((left, right) => right.length - left.length);
	const holdCharacters = Math.max(0, ...filtered.map((secret) => secret.length - 1));
	mkdirSync(dirname(path), { recursive: true });
	const handle = openSync(path, "wx");
	const decoder = new StringDecoder("utf8");
	let pending = "";
	let totalBytes = 0;
	let storedBytes = 0;
	let redactions = 0;
	let closed = false;

	const flushText = (text: string): void => {
		let redacted = text;
		for (const secret of filtered) {
			const parts = redacted.split(secret);
			if (parts.length > 1) {
				redactions += parts.length - 1;
				redacted = parts.join("[REDACTED]");
			}
		}
		const bytes = Buffer.from(redacted, "utf8");
		totalBytes += bytes.length;
		if (storedBytes >= limitBytes) return;
		const writable = bytes.subarray(0, Math.min(bytes.length, limitBytes - storedBytes));
		if (writable.length > 0) {
			writeSync(handle, writable);
			storedBytes += writable.length;
		}
	};

	return {
		write(chunk): void {
			if (closed) throw new Error("log sink is closed");
			pending += decoder.write(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
			for (const secret of filtered) {
				const parts = pending.split(secret);
				if (parts.length > 1) {
					redactions += parts.length - 1;
					pending = parts.join("[REDACTED]");
				}
			}
			if (pending.length > holdCharacters) {
				const flushLength = pending.length - holdCharacters;
				const safe = pending.slice(0, flushLength);
				const bytes = Buffer.from(safe, "utf8");
				totalBytes += bytes.length;
				if (storedBytes < limitBytes) {
					const writable = bytes.subarray(0, Math.min(bytes.length, limitBytes - storedBytes));
					if (writable.length > 0) { writeSync(handle, writable); storedBytes += writable.length; }
				}
				pending = pending.slice(flushLength);
			}
		},
		close(): BoundedLogResult {
			if (closed) throw new Error("log sink is closed");
			pending += decoder.end();
			flushText(pending);
			closed = true;
			closeSync(handle);
			return { total_bytes: totalBytes, stored_bytes: storedBytes, truncated: totalBytes > storedBytes, redactions };
		},
	};
}
