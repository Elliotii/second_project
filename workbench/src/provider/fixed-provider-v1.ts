export const DEEPSEEK_FIXED_PROFILE_V1 = Object.freeze({
	provider: "deepseek", model: "deepseek-v4-flash", endpoint: "https://api.deepseek.com/chat/completions",
	alternate_model: false, fallback: false, retry: false, requires_v1b_preflight_revalidation: true,
});

export const FIXED_PROVIDER_ENVELOPE_V1 = Object.freeze({ provider_requests_max: 16, tool_calls_max: 24, token_limit: 131_072, wall_time_ms_max: 900_000, cost_usd_max: 0.20 });
export interface OpaqueCredentialResolverV1 { resolve(): Promise<string>; }
export interface FixedTransportV1 { request(input: { profile: typeof DEEPSEEK_FIXED_PROFILE_V1; prompt: string; credential: string }): Promise<{ text: string }>; }
export interface PublicPiHarnessHandleV1 { prompt(text: string): Promise<string>; close(): Promise<void>; }
export interface PublicPiHarnessFactoryV1 { create(options: { profile: typeof DEEPSEEK_FIXED_PROFILE_V1; request: (prompt: string) => Promise<string>; runtime_identity: string }): PublicPiHarnessHandleV1; }

export class FixedProviderRequestErrorV1 extends Error {
	constructor() {
		super("V1 fixed provider request failed");
		this.name = "FixedProviderRequestErrorV1";
	}
}

const AUTHORITY_BRAND = Symbol("v1-provider-authority");
class OneUseProviderAuthorityV1 {
	readonly [AUTHORITY_BRAND] = true; private state: "available" | "reserved" | "requested" = "available"; private readonly authorized: boolean; private readonly resolver?: OpaqueCredentialResolverV1; private readonly transport?: FixedTransportV1;
	constructor(authorized: boolean, resolver?: OpaqueCredentialResolverV1, transport?: FixedTransportV1) { this.authorized = authorized; this.resolver = resolver; this.transport = transport; }
	assertComposable(): void {
		if (!this.authorized) throw new Error("V1 fixed provider execution is not authorized");
		if (this.state !== "available") throw new Error("V1 fixed provider authority already reserved or consumed");
		if (!this.resolver || !this.transport) throw new Error("V1 fixed provider dependencies missing");
	}
	reserveForRuntime(): (prompt: string) => Promise<string> {
		this.assertComposable(); this.state = "reserved";
		return async (prompt: string): Promise<string> => await this.requestReserved(prompt);
	}
	private async requestReserved(prompt: string): Promise<string> {
		if (this.state !== "reserved") throw new Error("V1 fixed provider request authority already consumed");
		this.state = "requested";
		let credential: string;
		try {
			credential = await this.resolver!.resolve();
			if (typeof credential !== "string" || credential.length === 0) throw new FixedProviderRequestErrorV1();
		} catch {
			throw new FixedProviderRequestErrorV1();
		}
		try {
			const response = await this.transport!.request({ profile: DEEPSEEK_FIXED_PROFILE_V1, prompt, credential });
			if (!response || typeof response.text !== "string") throw new FixedProviderRequestErrorV1();
			return response.text;
		} catch {
			throw new FixedProviderRequestErrorV1();
		}
	}
}

export function dryRunFixedProviderV1(): { credential_reads: 0; network_calls: 0; provider_calls: 0; formal_runtime_identities: 0; profile: typeof DEEPSEEK_FIXED_PROFILE_V1 } {
	return { credential_reads: 0, network_calls: 0, provider_calls: 0, formal_runtime_identities: 0, profile: DEEPSEEK_FIXED_PROFILE_V1 };
}
export function projectFixedProviderUsageV1(input: { request_count: number; input_tokens: number; output_tokens: number; cost_usd: number }): { request_count: number; input_tokens: number; output_tokens: number; cost_usd: number; credential: never[] } {
	const counters = [input.request_count, input.input_tokens, input.output_tokens];
	if (counters.some((value) => !Number.isFinite(value) || !Number.isInteger(value) || value < 0)) throw new Error("Invalid V1 fixed provider usage counter");
	if (!Number.isFinite(input.cost_usd) || input.cost_usd < 0) throw new Error("Invalid V1 fixed provider usage cost");
	if (input.request_count > FIXED_PROVIDER_ENVELOPE_V1.provider_requests_max) throw new Error("V1 fixed provider request envelope exceeded");
	if (input.input_tokens + input.output_tokens > FIXED_PROVIDER_ENVELOPE_V1.token_limit) throw new Error("V1 fixed provider token envelope exceeded");
	if (input.cost_usd > FIXED_PROVIDER_ENVELOPE_V1.cost_usd_max) throw new Error("V1 fixed provider cost envelope exceeded");
	return { ...input, credential: [] };
}
export function createOneUseProviderAuthorityV1(options: { authorized: boolean; resolver?: OpaqueCredentialResolverV1; transport?: FixedTransportV1 }): OneUseProviderAuthorityV1 { return new OneUseProviderAuthorityV1(options.authorized, options.resolver, options.transport); }

let runtimeOrdinal = 0;
export function createPublicPiCompositionSeamV1(options: { factory: PublicPiHarnessFactoryV1; authority: OneUseProviderAuthorityV1 }): PublicPiHarnessHandleV1 {
	if (!(options.authority instanceof OneUseProviderAuthorityV1)) throw new Error("Malformed V1 fixed provider authority");
	const request = options.authority.reserveForRuntime();
	const runtimeIdentity = `v1-fixed-provider-runtime-${++runtimeOrdinal}`;
	return options.factory.create({ profile: DEEPSEEK_FIXED_PROFILE_V1, request, runtime_identity: runtimeIdentity });
}
