export const DEFAULT_ANALYSIS_REQUEST_TIMEOUT_MS = 120_000;
export const MIN_ANALYSIS_REQUEST_TIMEOUT_MS = 1_000;

export function resolveAnalysisRequestTimeoutMs(value: number | undefined, label = "Analysis request timeout"): number {
	const timeout = value ?? DEFAULT_ANALYSIS_REQUEST_TIMEOUT_MS;
	if (!Number.isSafeInteger(timeout) || timeout < MIN_ANALYSIS_REQUEST_TIMEOUT_MS) {
		throw new Error(`${label} must be a safe integer >= ${MIN_ANALYSIS_REQUEST_TIMEOUT_MS} ms`);
	}
	return timeout;
}
