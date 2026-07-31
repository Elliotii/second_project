import type { RealExecutionDependenciesV0C } from "./pi/real-provider-route-v0c.ts";
import {
	dryRunV0C,
	executeV0CRun,
	type V0CRunResult,
	type V0CRunScenario,
} from "./run-v0c.ts";

export type ProductSurfaceResultV0C =
	| { mode: "dry_run"; plan_json: string }
	| { mode: "execution"; result: V0CRunResult };

export async function runV0CProductSurface(options: {
	projectRoot: string;
	taskPath: string;
	strategyPath: string;
	dryRun: boolean;
	scenario: V0CRunScenario;
	realExecution?: RealExecutionDependenciesV0C;
	lifecycleProbe?: (event: "handle_created" | "terminal_committed" | "handle_closed") => void;
	runValidationFault?: "attempt_validation_relation" | "cumulative_budget" | "dynamic_plan";
}): Promise<ProductSurfaceResultV0C> {
	if (options.dryRun) {
		return {
			mode: "dry_run",
			plan_json: dryRunV0C({
				projectRoot: options.projectRoot,
				taskPath: options.taskPath,
				strategyPath: options.strategyPath,
			}),
		};
	}
	return {
		mode: "execution",
		result: await executeV0CRun({
			projectRoot: options.projectRoot,
			taskPath: options.taskPath,
			strategyPath: options.strategyPath,
			scenario: options.scenario,
			realExecution: options.realExecution,
			lifecycleProbe: options.lifecycleProbe,
			runValidationFault: options.runValidationFault,
		}),
	};
}
