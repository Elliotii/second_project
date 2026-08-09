import type { Goal3DemoProjectionV35 } from "../contracts/v35g3-types.ts";
import type { SafeSessionViewV35 } from "../contracts/v35-types.ts";
import type { PersistentSessionServiceV35, PersistentTurnResultV35 } from "../session/persistent-session-v35.ts";
import { readSessionRunViewV35 } from "../read-model/workbench-v35g3.ts";

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

function identifier(value: string, label: string): string {
	if (!ID.test(value)) throw new Error(`${label} is invalid`);
	return value;
}

function boundedText(value: string, label: string, maxBytes: number): string {
	if (typeof value !== "string" || Buffer.byteLength(value, "utf8") === 0 || Buffer.byteLength(value, "utf8") > maxBytes) throw new Error(`${label} is invalid`);
	return value;
}

export class Goal3WorkbenchApplicationV35 {
	private readonly options: { sessionService: PersistentSessionServiceV35; projection: Goal3DemoProjectionV35 };

	constructor(options: { sessionService: PersistentSessionServiceV35; projection: Goal3DemoProjectionV35 }) { this.options = options; }

	overview(): Goal3DemoProjectionV35["overview"] & { schema_version: 1; routes_version: "v1" } {
		return { schema_version: 1, routes_version: "v1", ...this.options.projection.overview };
	}

	async sessions(): Promise<Awaited<ReturnType<typeof readSessionRunViewV35>>> {
		return await readSessionRunViewV35(this.options.sessionService);
	}

	async session(sessionId: string): Promise<SafeSessionViewV35> {
		return await this.options.sessionService.inspect(identifier(sessionId, "Session ID"));
	}

	async createSession(input: { session_id: string; title: string; parent_session_id?: string | null }): Promise<SafeSessionViewV35> {
		return await this.options.sessionService.create({
			sessionId: identifier(input.session_id, "Session ID"),
			title: boundedText(input.title, "Session title", 512),
			parentSessionId: input.parent_session_id === undefined || input.parent_session_id === null ? null : identifier(input.parent_session_id, "Parent Session ID"),
		});
	}

	async continueSession(sessionId: string, input: { run_id: string; prompt: string }): Promise<PersistentTurnResultV35> {
		return await this.options.sessionService.executeTurn({ sessionId: identifier(sessionId, "Session ID"), runId: identifier(input.run_id, "Run ID"), prompt: boundedText(input.prompt, "Prompt", 8_192) });
	}

	v2Recovery(): Goal3DemoProjectionV35["v2_recovery"] { return this.options.projection.v2_recovery; }
	goal25Comparison(): Goal3DemoProjectionV35["goal25_comparison"] { return this.options.projection.goal25_comparison; }
	adaptation(): Goal3DemoProjectionV35["adaptation"] { return this.options.projection.adaptation; }
	stateHistory(): Goal3DemoProjectionV35["state_history"] { return this.options.projection.state_history; }
}
