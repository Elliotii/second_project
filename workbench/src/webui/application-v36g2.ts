import type { SafeInteractiveSessionV36 } from "../contracts/v36-types.ts";
import type { ChangeSetExportV36, SafeChangeSetV36, SafeHandoffResultV36 } from "../contracts/v36g2-types.ts";
import { InteractiveControlPlaneV36, parseBrowserTaskRequestV36 } from "../v36/authority-v36.ts";
import { createChangeSetV36, performChangeHandoffV36, safeChangeSetV36, safeHandoffReceiptV36, validateSuccessfulApplyMarkerV36 } from "../workspace/change-set-v36.ts";

export interface SafeInteractiveSessionV36G2 extends SafeInteractiveSessionV36 {
	goal2: {
		backend: "docker_engine_linux_container";
		changes: SafeChangeSetV36 | null;
		continuation: "allowed" | "new_session_required_after_apply" | "new_session_required_after_budget_terminal";
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
			if (run.terminal !== null) changes = { ...changes, handoff_actions: ["discard", "export"] };
			const continuation = validateSuccessfulApplyMarkerV36(context.session_root, view.session_id) ? "new_session_required_after_apply" : "allowed";
			return { ...view, goal2: { backend: "docker_engine_linux_container", changes, continuation: run.terminal !== null ? "new_session_required_after_budget_terminal" : continuation } };
		}
		return { ...view, goal2: { backend: "docker_engine_linux_container", changes, continuation: "allowed" } };
	}

	project(view: SafeInteractiveSessionV36): SafeInteractiveSessionV36G2 {
		return this.afterSubmit(view);
	}

	async handoff(value: unknown, injectFailureAfterWrites?: number): Promise<SafeHandoffResultV36 | ChangeSetExportV36> {
		if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("handoff request is invalid");
		const record = value as { session_id?: unknown; change_set_digest?: unknown; action?: unknown };
		if (typeof record.session_id !== "string" || typeof record.change_set_digest !== "string" || typeof record.action !== "string") throw new Error("handoff request is invalid");
		const session = await this.controlPlane.session(record.session_id);
		if (record.action === "apply_all" && session.runs.some((run) => run.terminal !== null)) throw new Error("Apply All is denied for incomplete unverified finite-budget terminal changes");
		const context = this.controlPlane.hostChangeSetContext(record.session_id, "handoff");
		try {
			const result = performChangeHandoffV36(context, value, { ...(injectFailureAfterWrites === undefined ? {} : { injectFailureAfterWrites }) });
			return "receipt_digest" in result ? safeHandoffReceiptV36(result) : result;
		} catch (error) {
			const message = error instanceof Error ? error.message : "";
			if (message !== "source_preimage_stale" && message !== "source_add_collision") throw error;
			return {
				schema_version: 1, result_kind: "v36_safe_handoff_result", action: "apply_all", status: "conflict_stale_source", source_state: "unchanged", message_code: "source_conflict", receipt_digest: null,
				error_code: "source_stale_or_conflict", journal: [], recovery_material_saved: false, retry_safe: false,
			};
		}
	}

	async startSessionFromUpdatedSource(value: unknown): Promise<SafeInteractiveSessionV36G2> {
		if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== 1 || typeof (value as { previous_session_id?: unknown }).previous_session_id !== "string") throw new Error("new Session request is invalid");
		return this.afterSubmit(await this.controlPlane.startSessionFromUpdatedSource((value as { previous_session_id: string }).previous_session_id));
	}
}
