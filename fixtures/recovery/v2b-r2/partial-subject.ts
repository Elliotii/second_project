export function parseDuration(value: string): number {
	const amount = Number.parseInt(value, 10);
	if (value.endsWith("ms")) return amount;
	if (value.endsWith("s")) return amount * 1000;
	throw new Error("duration unit is required");
}
