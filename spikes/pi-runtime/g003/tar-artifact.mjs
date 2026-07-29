import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";

const BLOCK_SIZE = 512;

function decodeText(buffer) {
	const nul = buffer.indexOf(0);
	return buffer.subarray(0, nul === -1 ? buffer.length : nul).toString("utf8");
}

function parseOctal(buffer, label) {
	if ((buffer[0] & 0x80) !== 0) throw new Error(`${label} uses unsupported base-256 encoding`);
	const text = decodeText(buffer).trim();
	if (text === "") return 0;
	if (!/^[0-7]+$/.test(text)) throw new Error(`${label} is not valid octal: ${JSON.stringify(text)}`);
	return Number.parseInt(text, 8);
}

function headerChecksum(block) {
	let sum = 0;
	for (let index = 0; index < block.length; index += 1) {
		sum += index >= 148 && index < 156 ? 0x20 : block[index];
	}
	return sum;
}

export function digest(algorithm, bytes, encoding = "hex") {
	return createHash(algorithm).update(bytes).digest(encoding);
}

export function parseTarGzip(tarball) {
	const archive = gunzipSync(tarball);
	const entries = [];
	let offset = 0;
	let zeroBlocks = 0;

	while (offset + BLOCK_SIZE <= archive.length) {
		const block = archive.subarray(offset, offset + BLOCK_SIZE);
		offset += BLOCK_SIZE;
		if (block.every((value) => value === 0)) {
			zeroBlocks += 1;
			if (zeroBlocks === 2) break;
			continue;
		}
		zeroBlocks = 0;

		const expectedChecksum = parseOctal(block.subarray(148, 156), "tar checksum");
		const actualChecksum = headerChecksum(block);
		if (expectedChecksum !== actualChecksum) {
			throw new Error(`tar checksum mismatch at header offset ${offset - BLOCK_SIZE}`);
		}

		const name = decodeText(block.subarray(0, 100));
		const prefix = decodeText(block.subarray(345, 500));
		const path = prefix === "" ? name : `${prefix}/${name}`;
		const size = parseOctal(block.subarray(124, 136), `size for ${path}`);
		const typeByte = block[156];
		const type = typeByte === 0 ? "0" : String.fromCharCode(typeByte);
		const linkPath = decodeText(block.subarray(157, 257));
		const dataStart = offset;
		const dataEnd = dataStart + size;
		if (dataEnd > archive.length) throw new Error(`truncated tar member: ${path}`);
		entries.push({ path, size, type, linkPath, data: archive.subarray(dataStart, dataEnd) });
		offset += Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;
	}

	if (zeroBlocks < 2) throw new Error("tar archive does not end with two zero blocks");
	return entries;
}

export function assertSafeDataEntries(entries) {
	const prefix = "package/dist/providers/data/";
	const selected = entries.filter((entry) => entry.path.startsWith(prefix));
	if (selected.length !== 38) throw new Error(`expected 38 selected data members, found ${selected.length}`);

	const names = new Set();
	for (const entry of selected) {
		if (entry.type !== "0") throw new Error(`selected member is not a regular file: ${entry.path} (type ${entry.type})`);
		if (entry.linkPath !== "") throw new Error(`selected member has a link target: ${entry.path}`);
		if (entry.path.startsWith("/") || entry.path.includes("\\") || /^[A-Za-z]:/.test(entry.path)) {
			throw new Error(`selected member has an unsafe absolute or platform path: ${entry.path}`);
		}
		const segments = entry.path.split("/");
		if (segments.includes("..")) throw new Error(`selected member traverses a parent directory: ${entry.path}`);
		const relativePath = entry.path.slice(prefix.length);
		if (relativePath === "" || relativePath.includes("/")) {
			throw new Error(`selected member is nested or unnamed: ${entry.path}`);
		}
		if (relativePath !== ".manifest.json" && !/^[^/]+\.json$/.test(relativePath)) {
			throw new Error(`selected member has an unexpected extension: ${entry.path}`);
		}
		if (names.has(relativePath)) throw new Error(`duplicate selected member: ${relativePath}`);
		names.add(relativePath);
	}

	if (!names.has(".manifest.json")) throw new Error("selected data is missing .manifest.json");
	if ([...names].filter((name) => name !== ".manifest.json").length !== 37) {
		throw new Error("selected data does not contain exactly 37 provider JSON files");
	}
	return selected.sort((left, right) => left.path.localeCompare(right.path));
}
