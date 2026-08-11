import type { Goal3WorkbenchApplicationV35 } from "./application-v35g3.ts";
import type { InteractiveControlPlaneV36 } from "../v36/authority-v36.ts";
import type { Goal2WorkbenchExtensionV36 } from "./application-v36g2.ts";

export class WorkbenchApplicationV36G1 {
	readonly legacy: Goal3WorkbenchApplicationV35;
	private readonly controlPlane: InteractiveControlPlaneV36;
	private readonly goal2?: Goal2WorkbenchExtensionV36;

	constructor(options: { legacy: Goal3WorkbenchApplicationV35; controlPlane: InteractiveControlPlaneV36; goal2?: Goal2WorkbenchExtensionV36 }) {
		this.legacy = options.legacy;
		this.controlPlane = options.controlPlane;
		this.goal2 = options.goal2;
	}

	projects() { return { schema_version: 1 as const, projects: this.controlPlane.projects() }; }
	async submitTask(input: unknown) { this.goal2?.beforeSubmit(input); const view = await this.controlPlane.submit(input); return this.goal2 ? this.goal2.afterSubmit(view) : view; }
	async interactiveSessions() { return { schema_version: 1 as const, sessions: await this.controlPlane.sessions() }; }
	async interactiveSession(sessionId: string) { const view = await this.controlPlane.session(sessionId); return this.goal2 ? this.goal2.project(view) : view; }
	workspaceTree(sessionId: string) { return this.controlPlane.workspaceTree(sessionId); }
	workspaceFile(sessionId: string, path: string) { return this.controlPlane.workspaceFile(sessionId, path); }
	hasGoal2() { return this.goal2 !== undefined; }
	handoff(input: unknown) { if (!this.goal2) throw new Error("Goal 2 handoff is unavailable"); return this.goal2.handoff(input); }
}
