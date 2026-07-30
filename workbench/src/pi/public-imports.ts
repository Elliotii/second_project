export function resolvePublicPiImports(): string {
	const agentCore = import.meta.resolve("@earendil-works/pi-agent-core");
	import.meta.resolve("@earendil-works/pi-agent-core/node");
	import.meta.resolve("@earendil-works/pi-ai");
	return agentCore;
}
