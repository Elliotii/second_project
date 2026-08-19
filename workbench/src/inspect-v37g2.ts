import type { RegisteredBoundFollowUpAdmissionV37 } from "./contracts/v37-types.ts";
import { recomputeRegisteredFollowUpAdmissionV37, type RegisteredFollowUpOptionsV37 } from "./v37/registered-follow-up-v37.ts";

export interface RegisteredFollowUpInspectionV37 {
	integrity_valid: boolean;
	errors: string[];
	admission: RegisteredBoundFollowUpAdmissionV37 | null;
}

export async function inspectRegisteredFollowUpAdmissionV37(options: RegisteredFollowUpOptionsV37 & { historicalReadOnly?: true }): Promise<RegisteredFollowUpInspectionV37> {
	try {
		return { integrity_valid: true, errors: [], admission: await recomputeRegisteredFollowUpAdmissionV37(options) };
	} catch (error) {
		return { integrity_valid: false, errors: [error instanceof Error ? error.message : String(error)], admission: null };
	}
}
