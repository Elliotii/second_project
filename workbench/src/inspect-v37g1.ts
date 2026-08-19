import type { RegisteredRecoveryAdmissionV37, RegisteredRecoveryInspectionV37 } from "./contracts/v37-types.ts";
import { recomputeRegisteredRecoveryAdmissionV37 } from "./v37/registered-recovery-v37.ts";

export function inspectRegisteredRecoveryAdmissionV37(options: { projectRoot: string; dataRoot: string; workflowId: string; runRoot: string; confirmedAt: string; requestedAt: string }): RegisteredRecoveryInspectionV37 {
	const errors: string[] = [];
	let admission: RegisteredRecoveryAdmissionV37 | null = null;
	try {
		admission = recomputeRegisteredRecoveryAdmissionV37(options);
	} catch (error) {
		errors.push(error instanceof Error ? error.message : String(error));
	}
	return { integrity_valid: errors.length === 0, errors, admission };
}
