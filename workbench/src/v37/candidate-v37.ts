import { lstatSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { BoundedProposalPortV3 } from "../refinement/producer-v3.ts";
import type { CandidateResultV37 } from "../contracts/v37-types.ts";
import { fileSha256, sha256, stableJson, treeDigest, treeInventory } from "../hash.ts";
import { inspectRegisteredRecoveryAdmissionV37 } from "../inspect-v37g1.ts";
import { createBoundedModelBackedProducerV3 } from "../refinement/producer-v3.ts";
import { inspectStateStoreV3 } from "../state/store-v3.ts";
import { loadWorkflowRegistrationV37 } from "./workflow-registration-v37.ts";

const LEAKAGE_STOP_WORDS = new Set(["the", "and", "with", "from", "this", "that", "then", "than", "into", "before", "after", "when", "while", "your", "only", "must", "should", "could", "would", "task", "frozen", "registered", "verifier", "check", "test", "run", "claim", "completion"]);

function frozenProjectPath(projectRoot: string, path: string, label: string): string {
	if (typeof path !== "string" || path.length === 0 || isAbsolute(path) || path.replaceAll("\\", "/").split("/").includes("..") || path.includes("\0")) throw new Error(`${label} path is invalid`);
	const root = resolve(projectRoot);
	const target = resolve(root, path);
	const rel = relative(root, target);
	if (rel === "" || isAbsolute(rel) || rel === ".." || rel.startsWith(`..${sep}`)) throw new Error(`${label} escapes the Host project root`);
	let cursor = root;
	for (const segment of rel.split(sep).filter(Boolean)) {
		cursor = resolve(cursor, segment);
		const stats = lstatSync(cursor);
		if (stats.isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
	}
	return target;
}

function lexicalTokens(value: string): Set<string> {
	const expanded = value.normalize("NFKC").replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
	const unsplit = value.normalize("NFKC").toLowerCase().match(/[a-z][a-z0-9_]{2,}/g) ?? [];
	const split = expanded.match(/[a-z][a-z0-9_]{2,}/g) ?? [];
	return new Set([...unsplit, ...split].filter((token) => !LEAKAGE_STOP_WORDS.has(token)));
}

function verifierAnswerLiterals(verifierBytes: string): Set<string> {
	const literals = new Set<string>();
	for (const match of verifierBytes.matchAll(/["']([^"'\r\n]{2,32})["']/g)) {
		const value = match[1]!.toLowerCase();
		if (/^-?\d+(?:\.\d+)?(?:ms|s)?$/.test(value)) literals.add(value);
	}
	for (const match of verifierBytes.matchAll(/\b\d{2,}\b/g)) literals.add(match[0]!.toLowerCase());
	return literals;
}

export function validateFrozenPrimaryCandidateContentV37(projectRoot: string, manifest: ReturnType<typeof loadWorkflowRegistrationV37>["loadedCase"]["manifest"], candidateContent: string): void {
	const taskSpec = manifest.primary_task_spec.body as Record<string, unknown>;
	const sourceSpec = manifest.source_baseline_spec.body as Record<string, unknown>;
	const verifierSpec = manifest.primary_verifier_spec.body as Record<string, unknown>;
	const taskPath = frozenProjectPath(projectRoot, String(taskSpec.task_ref), "frozen Primary Task");
	if (fileSha256(taskPath) !== taskSpec.task_sha256) throw new Error("frozen Primary Task content identity drift");
	const task = JSON.parse(readFileSync(taskPath, "utf8")) as Record<string, unknown>;
	if (task.task_id !== taskSpec.task_id || task.instruction_sha256 !== taskSpec.instruction_sha256 || task.workspace_source_digest !== sourceSpec.workspace_source_digest || task.external_verifier_sha256 !== verifierSpec.source_sha256 || task.external_verifier_id !== verifierSpec.verifier_id) throw new Error("frozen Primary Task/Source/Verifier identity mismatch");
	const instructionPath = frozenProjectPath(projectRoot, String(task.instruction_ref), "frozen Primary instruction");
	const sourceRoot = frozenProjectPath(projectRoot, String(task.workspace_source_ref), "frozen Primary Source");
	const verifierPath = frozenProjectPath(projectRoot, String(task.external_verifier_ref), "frozen Primary Verifier");
	if (fileSha256(instructionPath) !== task.instruction_sha256 || treeDigest(sourceRoot) !== task.workspace_source_digest || fileSha256(verifierPath) !== task.external_verifier_sha256) throw new Error("frozen Primary Task/Source/Verifier content digest mismatch");
	const instruction = readFileSync(instructionPath, "utf8");
	const verifier = readFileSync(verifierPath, "utf8");
	const source = treeInventory(sourceRoot).map((entry) => readFileSync(resolve(sourceRoot, entry.path), "utf8")).join("\n");
	const referenceTokens = lexicalTokens(`${instruction}\n${source}\n${verifier}`);
	const candidateTokens = lexicalTokens(candidateContent);
	const protectedSymbols = [...lexicalTokens(`${instruction}\n${verifier}`)].filter((token) => token.length >= 8 && /[a-z]/.test(token));
	const shared = [...candidateTokens].filter((token) => referenceTokens.has(token));
	const namesFrozenSymbol = protectedSymbols.some((token) => candidateTokens.has(token));
	const normalizedContent = candidateContent.normalize("NFKC").toLowerCase();
	const literalHits = [...verifierAnswerLiterals(verifier)].filter((literal) => normalizedContent.includes(literal));
	if ((namesFrozenSymbol && shared.length >= 5) || literalHits.length >= 2) throw new Error("Candidate direct frozen Task/Source/Verifier answer leakage rejected");
}

export async function producePromptCandidateV37(options: {
	projectRoot: string;
	dataRoot: string;
	workflowId: string;
	runRoot: string;
	confirmedAt: string;
	requestedAt: string;
	immutableBasePrompt: string;
	port: BoundedProposalPortV3;
}): Promise<CandidateResultV37> {
	const inspectedAdmission = inspectRegisteredRecoveryAdmissionV37(options);
	if (!inspectedAdmission.integrity_valid || !inspectedAdmission.admission || inspectedAdmission.admission.result !== "admitted" || !inspectedAdmission.admission.opportunity) throw new Error(`V3.7 admission rejected: ${inspectedAdmission.errors.join("; ")}`);
	const registered = loadWorkflowRegistrationV37({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId });
	const manifest = registered.loadedCase.manifest;
	if (inspectedAdmission.admission.workflow_id !== registered.workflow.workflow_id || inspectedAdmission.admission.workflow_registration_digest !== registered.workflow.workflow_registration_digest || inspectedAdmission.admission.evidence_body_digest !== inspectedAdmission.admission.opportunity.evidence_identity.evidence_digest) throw new Error("Candidate admission/workflow/evidence lineage mismatch");
	const runtimeBody = manifest.runtime_base_prompt_spec.body;
	if (runtimeBody.prompt !== options.immutableBasePrompt || sha256(options.immutableBasePrompt) !== manifest.state_store_scope_spec.runtime_base_prompt_digest) throw new Error("Candidate runtime Base Prompt/State scope mismatch");
	const stateRoot = resolve(options.projectRoot, manifest.state_store_scope_spec.configured_location);
	const state = await inspectStateStoreV3({ stateRoot, expectedProjectId: manifest.project_id, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: manifest.state_store_scope_spec.runtime_base_prompt_digest });
	if (!state.integrity_valid || !state.active) throw new Error(`Candidate State Store inspection failed: ${state.errors.join("; ")}`);
	if (state.versions.find((version) => version.state_version === 0)?.state_digest !== manifest.state_store_scope_spec.initial_state_digest) throw new Error("Candidate State Store initial lineage scope mismatch");
	const producer = createBoundedModelBackedProducerV3({ port: options.port });
	const candidate = await producer(inspectedAdmission.admission.opportunity, state.active.state_digest);
	const policy = manifest.candidate_policy_spec.body;
	if (candidate.expected_base_state_digest !== state.active.state_digest) throw new Error("Candidate expected Base is stale");
	if (candidate.edits.length !== 1 || candidate.edits[0]?.kind !== "prompt_addendum") throw new Error("V3.7 Candidate must contain exactly one prompt_addendum");
	if (stableJson(candidate.lesson.applicability) !== stableJson(manifest.state_applicability) || stableJson(candidate.edits[0].applicability) !== stableJson(manifest.state_applicability)) throw new Error("Candidate applicability differs from registered State scope applicability");
	if (Buffer.byteLength(candidate.edits[0].content, "utf8") > policy.max_prompt_bytes) throw new Error("Candidate prompt exceeds registered content bound");
	const normalized = stableJson(candidate).toLowerCase();
	for (const indicator of policy.leakage_indicators) if (normalized.includes(indicator.toLowerCase())) throw new Error(`Candidate task-answer/authority leakage indicator rejected: ${indicator}`);
	validateFrozenPrimaryCandidateContentV37(options.projectRoot, manifest, candidate.edits[0].content);
	return { candidate, workflow_id: registered.workflow.workflow_id, state_store_scope_digest: manifest.state_store_scope_spec.state_store_scope_digest, active_state_digest: state.active.state_digest };
}
