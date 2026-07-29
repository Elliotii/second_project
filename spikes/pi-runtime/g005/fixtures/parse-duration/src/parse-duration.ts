export function parseDuration(input: string): number {
	const match = input.trim().match(/^(\d+)(ms|s|m)/);
	if (!match) throw new Error("invalid duration");

	const value = Number(match[1]);
	const multiplier = match[2] === "ms" ? 1 : match[2] === "s" ? 1_000 : 60_000;
	return value * multiplier;
}
