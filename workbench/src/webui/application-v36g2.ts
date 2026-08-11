import type { SafeInteractiveSessionV36 } from "../contracts/v36-types.ts";
import type { ChangeHandoffReceiptV36, ChangeSetExportV36, SafeChangeSetV36 } from "../contracts/v36g2-types.ts";
import { InteractiveControlPlaneV36, parseBrowserTaskRequestV36 } from "../v36/authority-v36.ts";
import { createChangeSetV36, performChangeHandoffV36, safeChangeSetV36, validateSuccessfulApplyMarkerV36 } from "../workspace/change-set-v36.ts";

export interface SafeInteractiveSessionV36G2 extends SafeInteractiveSessionV36 {
	goal2: {
		backend: "docker_engine_linux_container";
		changes: SafeChangeSetV36 | null;
		continuation: "allowed" | "new_session_required_after_apply";
	};
}

export class Goal2WorkbenchExtensionV36 {
	private readonly controlPlane: InteractiveControlPlaneV36;

	constructor(controlPlane: InteractiveControlPlaneV36) { this.controlPlane = controlPlane; }

	beforeSubmit(value: unknown): void {
		const input = parseBrowserTaskRequestV36(value);
		if (input.session_id) this.controlPlane.hostChangeSetContext(input.session_id, "continuation-check");
	}

	afterSubmit(view: SafeInteractiveSessionV36): SafeInteractiveSessionV36G2 {
		const run = view.runs.at(-1);
		let changes: SafeChangeSetV36 | null = null;
		if (view.requested_mode === "bounded_edit" && run) {
			const context = this.controlPlane.hostChangeSetContext(view.session_id, run.run_id);
			const changeSet = createChangeSetV36(context);
			changes = safeChangeSetV36(context, changeSet.change_set_digest);
			const continuation = validateSuccessfulApplyMarkerV36(context.session_root, view.session_id) ? "new_session_required_after_apply" : "allowed";
			return { ...view, goal2: { backend: "docker_engine_linux_container", changes, continuation } };
		}
		return { ...view, goal2: { backend: "docker_engine_linux_container", changes, continuation: "allowed" } };
	}

	project(view: SafeInteractiveSessionV36): SafeInteractiveSessionV36G2 {
		return this.afterSubmit(view);
	}

	handoff(value: unknown, injectFailureAfterWrites?: number): ChangeHandoffReceiptV36 | ChangeSetExportV36 {
		if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("handoff request is invalid");
		const record = value as { session_id?: unknown; change_set_digest?: unknown };
		if (typeof record.session_id !== "string" || typeof record.change_set_digest !== "string") throw new Error("handoff request is invalid");
		const context = this.controlPlane.hostChangeSetContext(record.session_id, "handoff");
		return performChangeHandoffV36(context, value, { ...(injectFailureAfterWrites === undefined ? {} : { injectFailureAfterWrites }) });
	}
}
