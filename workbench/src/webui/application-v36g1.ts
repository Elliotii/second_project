import type { Goal3WorkbenchApplicationV35 } from "./application-v35g3.ts";
import type { InteractiveControlPlaneV36 } from "../v36/authority-v36.ts";

export class WorkbenchApplicationV36G1 {
	readonly legacy: Goal3WorkbenchApplicationV35;
	private readonly controlPlane: InteractiveControlPlaneV36;

	constructor(options: { legacy: Goal3WorkbenchApplicationV35; controlPlane: InteractiveControlPlaneV36 }) {
		this.legacy = options.legacy;
		this.controlPlane = options.controlPlane;
	}

	projects() { return { schema_version: 1 as const, projects: this.controlPlane.projects() }; }
	async submitTask(input: unknown) { return await this.controlPlane.submit(input); }
	async interactiveSessions() { return { schema_version: 1 as const, sessions: await this.controlPlane.sessions() }; }
	async interactiveSession(sessionId: string) { return await this.controlPlane.session(sessionId); }
	workspaceTree(sessionId: string) { return this.controlPlane.workspaceTree(sessionId); }
	workspaceFile(sessionId: string, path: string) { return this.controlPlane.workspaceFile(sessionId, path); }
}
