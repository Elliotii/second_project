export function stableUnique(values: string[]): string[] { return [...new Set(values)].sort(); }
