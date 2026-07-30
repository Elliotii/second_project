function portablePath(value: string): string {
	return value.replaceAll("\\", "/").replace(/^(?:\.\/)+/, "").replace(/\/$/, "");
}

/**
 * Windows resolves ordinary path aliases case-insensitively. Keep Unix-like
 * platforms case-sensitive so policy identity follows the host filesystem.
 */
export function workspacePathIdentity(value: string): string {
	const portable = portablePath(value);
	return process.platform === "win32" ? portable.toLowerCase() : portable;
}

export function matchesWorkspaceScope(path: string, pattern: string): boolean {
	const normalizedPath = workspacePathIdentity(path);
	const normalizedPattern = workspacePathIdentity(pattern);
	if (normalizedPattern.endsWith("/**")) {
		const prefix = normalizedPattern.slice(0, -3).replace(/\/$/, "");
		return normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`);
	}
	return normalizedPath === normalizedPattern;
}

export function workspacePathPatternsOverlap(left: string, right: string): boolean {
	const normalizedLeft = workspacePathIdentity(left);
	const normalizedRight = workspacePathIdentity(right);
	if (normalizedLeft === normalizedRight) return true;
	const leftPrefix = normalizedLeft.endsWith("/**") ? normalizedLeft.slice(0, -3) : undefined;
	const rightPrefix = normalizedRight.endsWith("/**") ? normalizedRight.slice(0, -3) : undefined;
	if (leftPrefix !== undefined && (normalizedRight === leftPrefix || normalizedRight.startsWith(`${leftPrefix}/`))) return true;
	if (rightPrefix !== undefined && (normalizedLeft === rightPrefix || normalizedLeft.startsWith(`${rightPrefix}/`))) return true;
	return false;
}
