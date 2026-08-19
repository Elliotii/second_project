import type { RegisteredBoundFollowUpAdmissionV37, RegisteredRecoveryInspectionV37 } from "./contracts/v37-types.ts";
import { recomputeRegisteredRecoveryAdmissionV37G3A } from "./v37/registered-recovery-v37g3a.ts";
import { recomputeRegisteredFollowUpAdmissionV37G3A, type RegisteredFollowUpOptionsV37G3A } from "./v37/registered-follow-up-v37g3a.ts";

export function inspectRegisteredRecoveryAdmissionV37G3A(options: { projectRoot: string; dataRoot: string; workflowId: string; runRoot: string; confirmedAt: string; requestedAt: string }): RegisteredRecoveryInspectionV37 {
	try { return { integrity_valid: true, errors: [], admission: recomputeRegisteredRecoveryAdmissionV37G3A(options) }; }
	catch (error) { return { integrity_valid: false, errors: [error instanceof Error ? error.message : String(error)], admission: null }; }
}

export interface RegisteredFollowUpInspectionV37G3A {
	integrity_valid: boolean;
	errors: string[];
	admission: RegisteredBoundFollowUpAdmissionV37 | null;
}

export async function inspectRegisteredFollowUpAdmissionV37G3A(options: RegisteredFollowUpOptionsV37G3A & { historicalReadOnly?: true }): Promise<RegisteredFollowUpInspectionV37G3A> {
	try { return { integrity_valid: true, errors: [], admission: await recomputeRegisteredFollowUpAdmissionV37G3A(options) }; }
	catch (error) { return { integrity_valid: false, errors: [error instanceof Error ? error.message : String(error)], admission: null }; }
}
