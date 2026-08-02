export function boundedAt(values: string[], index: number): string | undefined { return Number.isInteger(index) && index >= 0 && index < values.length ? values[index] : undefined; }
