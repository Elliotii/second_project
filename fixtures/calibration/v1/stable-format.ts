export function stableFormat(value: Record<string, string>): string { return JSON.stringify(Object.fromEntries(Object.keys(value).sort().map((key) => [key, value[key]]))); }
