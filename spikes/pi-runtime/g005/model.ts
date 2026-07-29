import type { Model } from "@earendil-works/pi-ai";

export const DEEPSEEK_MODEL = {
	id: "deepseek-v4-flash",
	name: "DeepSeek V4 Flash (G005 pinned descriptor)",
	api: "openai-completions",
	provider: "deepseek",
	baseUrl: "https://api.deepseek.com",
	reasoning: true,
	thinkingLevelMap: {
		minimal: "high",
		low: "high",
		medium: "high",
		high: "high",
		xhigh: "max",
		max: "max",
	},
	input: ["text"],
	cost: {
		input: 0.14,
		output: 0.28,
		cacheRead: 0.0028,
		cacheWrite: 0,
	},
	contextWindow: 1_000_000,
	maxTokens: 8_192,
	compat: {
		supportsStore: false,
		supportsDeveloperRole: false,
		supportsReasoningEffort: true,
		supportsUsageInStreaming: true,
		maxTokensField: "max_tokens",
		requiresReasoningContentOnAssistantMessages: true,
		thinkingFormat: "deepseek",
	},
} satisfies Model<"openai-completions">;

export const MODEL_PRICE_PROVENANCE = {
	checkedAt: "2026-07-29T00:00:00+08:00",
	source: "https://api-docs.deepseek.com/quick_start/pricing/",
	unit: "USD per 1M tokens",
	inputCacheHit: 0.0028,
	inputCacheMiss: 0.14,
	output: 0.28,
};
