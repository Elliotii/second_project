import {
	existsSync,
	lstatSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	renameSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import type {
	ApplyJournalEntryV36,
	ChangeEntryV36,
	ChangeHandoffReceiptV36,
	ChangeHandoffRequestV36,
	ChangeSetExportV36,
	ChangeSetV36,
	SafeChangeSetV36,
	WorkspaceInventoryV36,
} from "../contracts/v36g2-types.ts";
import type { ArtifactRefV0B } from "../contracts/v0b-types.ts";
import { artifactRef, readJsonArtifact, validateArtifactRef, writeOnceBytes, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { FROZEN_DOCKER_PROFILE_V36 } from "../execution/docker-v36.ts";
import { isPathInScope, resolveWorkspacePath } from "./path-policy.ts";
import { managedWorkspaceInventoryV36, registeredSourceInventoryV36 } from "./managed-copy-v36.ts";

const SHA256 = /^[a-f0-9]{64}$/;
const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export interface ChangeSetHostContextV36 {
	project_id: string;
	session_id: string;
	run_id: string;
	project_profile_digest: string;
	source_snapshot_identity: string;
	session_root: string;
	workspace_root: string;
	source_root: string;
	writable_paths: readonly string[];
	protected_paths: readonly string[];
}

function blobRef(path: string, bytes: Buffer): ArtifactRefV0B {
	return { path, sha256: sha256(bytes), size_bytes: bytes.length, media_type: "application/octet-stream", truncated: false };
}

function initialBlobPath(digest: string): string { return `initial-blobs/${digest}.bin`; }
function afterBlobPath(digest: string): string { return `blobs/${digest}.bin`; }

export function persistInitialInventoryV36(sessionRoot: string, workspaceRoot: string): WorkspaceInventoryV36 {
	const inventory = managedWorkspaceInventoryV36(workspaceRoot);
	for (const file of inventory.files) {
		const bytes = readFileSync(resolve(workspaceRoot, file.path));
		if (sha256(bytes) !== file.sha256) throw new Error("initial managed Workspace inventory changed during persistence");
		const path = initialBlobPath(file.sha256);
		if (!existsSync(resolve(sessionRoot, path))) writeOnceBytes(sessionRoot, path, bytes);
	}
	writeOnceJson(sessionRoot, "initial-inventory.json", inventory);
	return inventory;
}

function readInitialInventory(sessionRoot: string): WorkspaceInventoryV36 {
	const value = readJsonArtifact<WorkspaceInventoryV36>(sessionRoot, "initial-inventory.json");
	if (value.schema_version !== 1 || !Array.isArray(value.files) || value.files.some((file) => typeof file.path !== "string" || !Number.isSafeInteger(file.bytes) || file.bytes < 0 || !SHA256.test(file.sha256)) || digestObject(value.files) !== value.inventory_digest) throw new Error("initial Workspace inventory is invalid");
	return value;
}

function changeSetBody(value: ChangeSetV36): Omit<ChangeSetV36, "change_set_digest"> {
	const { change_set_digest: _digest, ...body } = value;
	return body;
}

function changeRoot(sessionRoot: string, digest: string): string {
	if (!SHA256.test(digest)) throw new Error("ChangeSet digest is invalid");
	return resolve(sessionRoot, "change-sets", digest);
}

export function createChangeSetV36(context: ChangeSetHostContextV36): ChangeSetV36 {
	if (!ID.test(context.project_id) || !ID.test(context.session_id) || !ID.test(context.run_id)) throw new Error("ChangeSet lineage identity is invalid");
	const initial = readInitialInventory(context.session_root);
	if (initial.inventory_digest !== context.source_snapshot_identity) throw new Error("initial inventory and Source snapshot identity differ");
	const final = managedWorkspaceInventoryV36(context.workspace_root);
	const before = new Map(initial.files.map((file) => [file.path, file]));
	const after = new Map(final.files.map((file) => [file.path, file]));
	const paths = [...new Set([...before.keys(), ...after.keys()])].sort((left, right) => left.localeCompare(right));
	const changes: ChangeEntryV36[] = [];
	const afterBytes = new Map<string, Buffer>();
	for (const path of paths) {
		const left = before.get(path);
		const right = after.get(path);
		if (left?.sha256 === right?.sha256) continue;
		if (!isPathInScope(path, context.writable_paths) || isPathInScope(path, context.protected_paths)) throw new Error(`managed Workspace change is outside authorized writable scope: ${path}`);
		if (!left && right) {
			const bytes = readFileSync(resolve(context.workspace_root, path));
			afterBytes.set(right.sha256, bytes);
			changes.push({ path, operation: "add", before_sha256: null, after_sha256: right.sha256, after_blob_ref: blobRef(afterBlobPath(right.sha256), bytes) });
		} else if (left && !right) {
			changes.push({ path, operation: "delete", before_sha256: left.sha256, after_sha256: null, after_blob_ref: null });
		} else if (left && right) {
			const bytes = readFileSync(resolve(context.workspace_root, path));
			afterBytes.set(right.sha256, bytes);
			changes.push({ path, operation: "modify", before_sha256: left.sha256, after_sha256: right.sha256, after_blob_ref: blobRef(afterBlobPath(right.sha256), bytes) });
		}
	}
	const body: Omit<ChangeSetV36, "change_set_digest"> = { schema_version: 1, project_id: context.project_id, session_id: context.session_id, run_id: context.run_id, project_profile_digest: context.project_profile_digest, source_snapshot_identity: context.source_snapshot_identity, initial_inventory_digest: initial.inventory_digest, final_inventory_digest: final.inventory_digest, changes, status: "proposed" };
	const changeSet: ChangeSetV36 = { ...body, change_set_digest: digestObject(body) };
	const root = changeRoot(context.session_root, changeSet.change_set_digest);
	if (existsSync(root)) return validateChangeSetV36(context.session_root, changeSet.change_set_digest);
	mkdirSync(root, { recursive: true });
	for (const [digest, bytes] of afterBytes) writeOnceBytes(root, afterBlobPath(digest), bytes);
	writeOnceJson(root, "change-set.json", changeSet);
	return validateChangeSetV36(context.session_root, changeSet.change_set_digest);
}

export function validateChangeSetV36(sessionRoot: string, digest: string): ChangeSetV36 {
	const root = changeRoot(sessionRoot, digest);
	const value = readJsonArtifact<ChangeSetV36>(root, "change-set.json");
	if (value.schema_version !== 1 || !ID.test(value.project_id) || !ID.test(value.session_id) || !ID.test(value.run_id) || !SHA256.test(value.project_profile_digest) || !SHA256.test(value.source_snapshot_identity) || !SHA256.test(value.initial_inventory_digest) || !SHA256.test(value.final_inventory_digest) || value.status !== "proposed" || value.change_set_digest !== digest || digestObject(changeSetBody(value)) !== digest || !Array.isArray(value.changes)) throw new Error("ChangeSet envelope is invalid");
	const seen = new Set<string>();
	for (const entry of value.changes) {
		if (typeof entry.path !== "string" || entry.path.length === 0 || entry.path.includes("\0") || entry.path.includes("\\") || entry.path.includes(":") || entry.path.startsWith("/") || entry.path.split("/").includes("..") || seen.has(entry.path) || !["add", "modify", "delete"].includes(entry.operation)) throw new Error("ChangeSet entry is invalid");
		seen.add(entry.path);
		if (entry.operation === "add" && (entry.before_sha256 !== null || !SHA256.test(entry.after_sha256 ?? "") || !entry.after_blob_ref)) throw new Error("ChangeSet add entry is invalid");
		if (entry.operation === "modify" && (!SHA256.test(entry.before_sha256 ?? "") || !SHA256.test(entry.after_sha256 ?? "") || !entry.after_blob_ref)) throw new Error("ChangeSet modify entry is invalid");
		if (entry.operation === "delete" && (!SHA256.test(entry.before_sha256 ?? "") || entry.after_sha256 !== null || entry.after_blob_ref !== null)) throw new Error("ChangeSet delete entry is invalid");
		if (entry.after_blob_ref && (entry.after_blob_ref.path !== afterBlobPath(entry.after_sha256!) || entry.after_blob_ref.sha256 !== entry.after_sha256 || validateArtifactRef(root, entry.after_blob_ref).length > 0)) throw new Error("ChangeSet after blob is invalid");
	}
	if (stableJson(value.changes.map((entry) => entry.path)) !== stableJson([...seen].sort((left, right) => left.localeCompare(right)))) throw new Error("ChangeSet entries are not deterministically ordered");
	return value;
}

function boundedDiff(before: Buffer | null, after: Buffer | null): string {
	const binary = (value: Buffer | null): boolean => value?.includes(0) ?? false;
	if (binary(before) || binary(after)) return "[binary change; bytes omitted]";
	const left = before?.toString("utf8") ?? "[absent]";
	const right = after?.toString("utf8") ?? "[absent]";
	const output = `--- before\n${left}\n+++ after\n${right}`;
	const bytes = Buffer.from(output, "utf8");
	return bytes.length <= 32_768 ? output : `${bytes.subarray(0, 32_700).toString("utf8")}\n[diff truncated]`;
}

function validateHandoffReceiptV36(actionRoot: string, name: "apply-receipt.json" | "discard-receipt.json", changeSet: ChangeSetV36): ChangeHandoffReceiptV36 {
	const receipt = readJsonArtifact<ChangeHandoffReceiptV36>(actionRoot, name);
	if (stableJson(Object.keys(receipt).sort()) !== stableJson(["schema_version", "session_id", "change_set_digest", "action", "status", "journal", "source_identity_after", "error_code", "receipt_digest"].sort())) throw new Error("handoff receipt envelope is invalid");
	const expectedAction = name === "apply-receipt.json" ? "apply_all" : "discard";
	const statusValid = expectedAction === "discard" ? receipt.status === "discarded" : receipt.status === "applied" || receipt.status === "partial_apply_error";
	if (receipt.schema_version !== 1 || receipt.session_id !== changeSet.session_id || receipt.change_set_digest !== changeSet.change_set_digest || receipt.action !== expectedAction || !statusValid || !Array.isArray(receipt.journal) || !SHA256.test(receipt.source_identity_after) || !SHA256.test(receipt.receipt_digest) || digestObject(receiptBody(receipt)) !== receipt.receipt_digest) throw new Error("handoff receipt identity is invalid");
	if ((receipt.status === "partial_apply_error") !== (typeof receipt.error_code === "string" && receipt.error_code.length > 0)) throw new Error("handoff receipt error status is invalid");
	if (receipt.status !== "partial_apply_error" && receipt.error_code !== null) throw new Error("handoff receipt error field is invalid");
	if (expectedAction === "discard") {
		if (receipt.journal.length !== 0) throw new Error("discard receipt journal is invalid");
		return receipt;
	}
	if (receipt.journal.length !== changeSet.changes.length) throw new Error("apply receipt journal length is invalid");
	for (const [index, entry] of receipt.journal.entries()) {
		const change = changeSet.changes[index]!;
		if (stableJson(Object.keys(entry).sort()) !== stableJson(["path", "operation", "state", "recovery_blob_ref", "recovery_requires_absence"].sort()) || entry.path !== change.path || entry.operation !== change.operation || !["applied", "not_applied"].includes(entry.state) || entry.recovery_requires_absence !== (change.operation === "add")) throw new Error("apply receipt journal entry is invalid");
		if (change.operation === "add") {
			if (entry.recovery_blob_ref !== null) throw new Error("add recovery entry is invalid");
		} else if (!entry.recovery_blob_ref || entry.recovery_blob_ref.sha256 !== change.before_sha256 || validateArtifactRef(actionRoot, entry.recovery_blob_ref).length > 0) throw new Error("apply recovery blob is invalid");
	}
	if (receipt.status === "applied" && receipt.journal.some((entry) => entry.state !== "applied")) throw new Error("applied receipt journal is incomplete");
	return receipt;
}

interface SuccessfulApplyMarkerV36 {
	schema_version: 1;
	session_id: string;
	change_set_digest: string;
	receipt_digest: string;
	marker_digest: string;
}

function successfulApplyBody(value: SuccessfulApplyMarkerV36): Omit<SuccessfulApplyMarkerV36, "marker_digest"> {
	const { marker_digest: _digest, ...body } = value;
	return body;
}

export function validateSuccessfulApplyMarkerV36(sessionRoot: string, expectedSessionId?: string): SuccessfulApplyMarkerV36 | null {
	const path = resolve(sessionRoot, "successful-apply.json");
	if (!existsSync(path)) return null;
	const marker = readJsonArtifact<SuccessfulApplyMarkerV36>(sessionRoot, "successful-apply.json");
	if (stableJson(Object.keys(marker).sort()) !== stableJson(["schema_version", "session_id", "change_set_digest", "receipt_digest", "marker_digest"].sort()) || marker.schema_version !== 1 || !ID.test(marker.session_id) || (expectedSessionId !== undefined && marker.session_id !== expectedSessionId) || !SHA256.test(marker.change_set_digest) || !SHA256.test(marker.receipt_digest) || !SHA256.test(marker.marker_digest) || digestObject(successfulApplyBody(marker)) !== marker.marker_digest) throw new Error("successful Apply marker is invalid");
	const changeSet = validateChangeSetV36(sessionRoot, marker.change_set_digest);
	const actionRoot = resolve(sessionRoot, "handoff", marker.change_set_digest);
	const receipt = validateHandoffReceiptV36(actionRoot, "apply-receipt.json", changeSet);
	if (receipt.status !== "applied" || receipt.receipt_digest !== marker.receipt_digest) throw new Error("successful Apply marker receipt is invalid");
	return marker;
}

function receiptStatus(context: ChangeSetHostContextV36, changeSet: ChangeSetV36): SafeChangeSetV36["status"] {
	const actionRoot = resolve(context.session_root, "handoff", changeSet.change_set_digest);
	if (!existsSync(actionRoot)) return "proposed";
	const present = (["apply-receipt.json", "discard-receipt.json"] as const).filter((name) => existsSync(resolve(actionRoot, name)));
	if (present.length !== 1) throw new Error("handoff terminal directory has ambiguous or missing receipt");
	return validateHandoffReceiptV36(actionRoot, present[0]!, changeSet).status;
}

export function safeChangeSetV36(context: ChangeSetHostContextV36, digest: string): SafeChangeSetV36 {
	const changeSet = validateChangeSetV36(context.session_root, digest);
	const root = changeRoot(context.session_root, digest);
	return {
		schema_version: 1,
		project_id: changeSet.project_id,
		session_id: changeSet.session_id,
		run_id: changeSet.run_id,
		change_set_digest: digest,
		status: receiptStatus(context, changeSet),
		changes: changeSet.changes.map((entry) => {
			const beforePath = entry.before_sha256 ? resolve(context.session_root, initialBlobPath(entry.before_sha256)) : null;
			if (beforePath) {
				const stats = lstatSync(beforePath);
				if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("initial before blob identity is invalid");
			}
			const before = beforePath ? readFileSync(beforePath) : null;
			if (before && sha256(before) !== entry.before_sha256) throw new Error("initial before blob is invalid");
			const after = entry.after_blob_ref ? readFileSync(resolve(root, entry.after_blob_ref.path)) : null;
			return { path: entry.path, operation: entry.operation, before_sha256: entry.before_sha256, after_sha256: entry.after_sha256, diff: boundedDiff(before, after) };
		}),
		backend: { kind: "docker_engine_linux_container", image_digest: FROZEN_DOCKER_PROFILE_V36.image_reference, network: "none", profile_digest: FROZEN_DOCKER_PROFILE_V36.profile_digest },
		handoff_actions: ["apply_all", "discard", "export"],
	};
}

function receiptBody(receipt: ChangeHandoffReceiptV36): Omit<ChangeHandoffReceiptV36, "receipt_digest"> {
	const { receipt_digest: _digest, ...body } = receipt;
	return body;
}

function validateHandoffRequest(value: unknown): ChangeHandoffRequestV36 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("handoff request is invalid");
	const record = value as Record<string, unknown>;
	if (stableJson(Object.keys(record).sort()) !== stableJson(["action", "change_set_digest", "session_id"].sort()) || typeof record.session_id !== "string" || !ID.test(record.session_id) || typeof record.change_set_digest !== "string" || !SHA256.test(record.change_set_digest) || !["apply_all", "discard", "export"].includes(String(record.action))) throw new Error("handoff request is invalid");
	return record as unknown as ChangeHandoffRequestV36;
}

function exportChangeSet(sessionRoot: string, changeSet: ChangeSetV36): ChangeSetExportV36 {
	const root = changeRoot(sessionRoot, changeSet.change_set_digest);
	const blobs = changeSet.changes.flatMap((entry) => entry.after_blob_ref ? [{ sha256: entry.after_blob_ref.sha256, bytes_base64: readFileSync(resolve(root, entry.after_blob_ref.path)).toString("base64") }] : []);
	const body = { schema_version: 1 as const, change_set: changeSet, blobs };
	return { ...body, export_digest: digestObject(body) };
}

function assertOrdinaryFile(path: string, expectedDigest: string): Buffer {
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("source_file_identity_invalid");
	const bytes = readFileSync(path);
	if (sha256(bytes) !== expectedDigest) throw new Error("source_preimage_stale");
	return bytes;
}

export function performChangeHandoffV36(context: ChangeSetHostContextV36, inputValue: unknown, options: { injectFailureAfterWrites?: number } = {}): ChangeHandoffReceiptV36 | ChangeSetExportV36 {
	const input = validateHandoffRequest(inputValue);
	if (input.session_id !== context.session_id) throw new Error("handoff Session identity mismatch");
	const changeSet = validateChangeSetV36(context.session_root, input.change_set_digest);
	if (changeSet.project_id !== context.project_id || changeSet.session_id !== context.session_id || changeSet.project_profile_digest !== context.project_profile_digest || changeSet.source_snapshot_identity !== context.source_snapshot_identity) throw new Error("ChangeSet authority lineage mismatch");
	if (input.action === "export") return exportChangeSet(context.session_root, changeSet);
	const currentWorkspace = managedWorkspaceInventoryV36(context.workspace_root);
	if (changeSet.final_inventory_digest !== currentWorkspace.inventory_digest) throw new Error("selected ChangeSet is not the current managed Workspace head");
	const actionRoot = resolve(context.session_root, "handoff", changeSet.change_set_digest);
	if (existsSync(actionRoot)) throw new Error("ChangeSet handoff is already terminal");
	if (validateSuccessfulApplyMarkerV36(context.session_root, context.session_id)) throw new Error("Session already applied successfully; create a new Session");
	if (input.action === "discard") {
		mkdirSync(actionRoot, { recursive: true });
		const body: Omit<ChangeHandoffReceiptV36, "receipt_digest"> = { schema_version: 1, session_id: context.session_id, change_set_digest: changeSet.change_set_digest, action: "discard", status: "discarded", journal: [], source_identity_after: registeredSourceInventoryV36(context.source_root).inventory_digest, error_code: null };
		const receipt: ChangeHandoffReceiptV36 = { ...body, receipt_digest: digestObject(body) };
		writeOnceJson(actionRoot, "discard-receipt.json", receipt);
		return receipt;
	}

	const prepared = changeSet.changes.map((entry) => {
		const target = resolveWorkspacePath({ workspaceRoot: context.source_root, path: entry.path, operation: "write", writablePaths: context.writable_paths, protectedPaths: context.protected_paths });
		if (!isPathInScope(entry.path, context.writable_paths) || isPathInScope(entry.path, context.protected_paths)) throw new Error("source_scope_rejected");
		let beforeBytes: Buffer | null = null;
		if (entry.operation === "add") {
			if (existsSync(target)) throw new Error("source_add_collision");
		} else {
			beforeBytes = assertOrdinaryFile(target, entry.before_sha256!);
		}
		let afterBytes: Buffer | null = null;
		if (entry.after_blob_ref) {
			const root = changeRoot(context.session_root, changeSet.change_set_digest);
			if (validateArtifactRef(root, entry.after_blob_ref).length > 0) throw new Error("source_after_blob_tampered");
			afterBytes = readFileSync(resolve(root, entry.after_blob_ref.path));
		}
		return { entry, target, beforeBytes, afterBytes };
	});
	mkdirSync(actionRoot, { recursive: true });

	const journal: ApplyJournalEntryV36[] = [];
	for (const item of prepared) {
		const recoveryRef = item.beforeBytes ? (() => {
			const path = `recovery/${sha256(item.entry.path)}-${item.entry.before_sha256}.bin`;
			writeOnceBytes(actionRoot, path, item.beforeBytes!);
			return artifactRef(actionRoot, path, "application/octet-stream", false);
		})() : null;
		journal.push({ path: item.entry.path, operation: item.entry.operation, state: "not_applied", recovery_blob_ref: recoveryRef, recovery_requires_absence: item.entry.operation === "add" });
	}

	let writes = 0;
	let errorCode: string | null = null;
	try {
		for (const [index, item] of prepared.entries()) {
			if (options.injectFailureAfterWrites !== undefined && writes >= options.injectFailureAfterWrites) throw new Error("injected_mid_apply_failure");
			if (item.entry.operation === "delete") unlinkSync(item.target);
			else {
				mkdirSync(dirname(item.target), { recursive: true });
				const temporary = `${item.target}.v36-${sha256(`${context.session_id}:${changeSet.change_set_digest}:${item.entry.path}`).slice(0, 16)}.tmp`;
				try {
					writeFileSync(temporary, item.afterBytes!, { flag: "wx" });
					renameSync(temporary, item.target);
				} finally {
					if (existsSync(temporary)) unlinkSync(temporary);
				}
			}
			journal[index]!.state = "applied";
			writes += 1;
		}
	} catch (error) {
		errorCode = error instanceof Error ? error.message : "source_apply_failed";
	}
	const status = errorCode === null ? "applied" : "partial_apply_error";
	const body: Omit<ChangeHandoffReceiptV36, "receipt_digest"> = { schema_version: 1, session_id: context.session_id, change_set_digest: changeSet.change_set_digest, action: "apply_all", status, journal, source_identity_after: registeredSourceInventoryV36(context.source_root).inventory_digest, error_code: errorCode };
	const receipt: ChangeHandoffReceiptV36 = { ...body, receipt_digest: digestObject(body) };
	writeOnceJson(actionRoot, "apply-receipt.json", receipt);
	if (status === "applied") {
		const markerBody: Omit<SuccessfulApplyMarkerV36, "marker_digest"> = { schema_version: 1, session_id: context.session_id, change_set_digest: changeSet.change_set_digest, receipt_digest: receipt.receipt_digest };
		writeOnceJson(context.session_root, "successful-apply.json", { ...markerBody, marker_digest: digestObject(markerBody) } satisfies SuccessfulApplyMarkerV36);
	}
	return receipt;
}

export function assertSessionContinuationAllowedV36(sessionRoot: string): void {
	if (validateSuccessfulApplyMarkerV36(sessionRoot)) throw new Error("Session already applied successfully; create a new Session");
}

export function assertManagedWorkspaceHeadV36(sessionRoot: string, identity: string): void {
	const initial = readInitialInventory(sessionRoot);
	if (identity === initial.inventory_digest) return;
	const root = resolve(sessionRoot, "change-sets");
	if (!existsSync(root)) throw new Error("managed Workspace head has no persisted ChangeSet");
	for (const entry of readdirSync(root, { withFileTypes: true })) {
		if (!entry.isDirectory() || !SHA256.test(entry.name)) throw new Error("ChangeSet directory identity is invalid");
		const changeSet = validateChangeSetV36(sessionRoot, entry.name);
		if (changeSet.final_inventory_digest === identity) return;
	}
	throw new Error("managed Workspace head has no persisted ChangeSet");
}
