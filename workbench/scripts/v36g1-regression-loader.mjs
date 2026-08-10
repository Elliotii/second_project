import { resolve as resolvePublicPi } from "./v35g2-public-pi-loader.mjs";

export const resolve = resolvePublicPi;

export async function load(url, context, nextLoad) {
	const result = await nextLoad(url, context);
	if (!url.endsWith("/tests/v35-persistent-session.test.ts")) return result;
	const source = typeof result.source === "string" ? result.source : Buffer.from(result.source).toString("utf8");
	const bridged = source.replace(".runs/v3-5-g1/runtime/public-pi-loader.mjs", "workbench/scripts/v35g2-public-pi-loader.mjs");
	return { ...result, source: bridged };
}
