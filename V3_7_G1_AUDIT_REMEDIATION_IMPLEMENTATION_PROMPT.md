# V3.7 Goal 1 Audit Remediation Implementation Prompt

~~~yaml
status: AUTHORIZED
amendment: V3_7_G1_AUDIT_REMEDIATION_AMENDMENT.md
goal: V3_7_G1_REGISTERED_RECOVERY_EVIDENCE_BRIDGE
starting_commit: 0cf5b81976880d57a8b09bbd3f87be68853cbb3b
starting_tree: d6c59a29d1833fccd53164c295c5bf3bc90ebcba
remediation_budget: 1_of_1
implementation_owner: fresh_dedicated_goal_1_audit_remediation_session
candidate_commits_authorized: 1
audit_authority: false
goal_2_authority: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_tasks: 0
~~~

## Mission

Correct exactly:

- V37-G1-AUDIT-P1-001: caller-selected dataRoot partitions Primary Run uniqueness;
- V37-G1-AUDIT-P1-002: symbol-omitting direct task answers remain admissible;
- V37-G1-AUDIT-P1-003: admission reopen accepts a recovery-descendant junction.

Preserve all failed candidate commits/trees. Create one new candidate commit directly on
top of 0cf5b81976880d57a8b09bbd3f87be68853cbb3b and stop for Main.

## Exact allowlist

Only these paths may change:

~~~text
workbench/src/contracts/v37-types.ts
workbench/src/v37/host-registry-v37.ts
workbench/src/v37/workflow-registration-v37.ts
workbench/src/v37/registered-recovery-v37.ts
workbench/src/v37/candidate-v37.ts
workbench/config/v37/registered-cases/registry-v1.json
workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json
workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json
workbench/tests/v37g1-registered-recovery.test.ts
docs/reports/V3_7_G1_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G1_CLOSEOUT_DRAFT.md
~~~

Configuration edits may only register the exact generic Candidate template policy and
recompute its dependent Manifest/Envelope/registry digests. Do not alter Case identity,
task/source/verifier bytes, State scope, provider/tool/command/budget/stop profiles or
recovery semantics.

## Required implementation outcomes

1. Derive one fixed Host binding-authority root from loader-owned project identity and
   accepted Manifest configuration. It is independent of runtime dataRoot. Persist
   immutable by-Run-ID and by-Run-root indexes there, retain a workflow-local binding,
   and require exact equality among all copies on load/derive/reopen.
2. Extend the registered Candidate policy with an exact finite generic-guidance template
   inventory and content identities. Accept only exact Host-rendered/verified registered
   guidance. Keep frozen Task/Source/Verifier recomputation and static authority
   indicators as additional fail-closed checks, not semantic heuristics.
3. Add a local reusable formal-path validator in the Goal 1 recovery boundary. Validate
   every intermediate component from the trusted data/workflow root through recovery and
   each artifact. Reject symlink/junction/reparse and nonordinary/hardlinked final files
   during persistence, admission, recomputation and historical inspection.

## Required deterministic tests

- two data roots and two workflows cannot bind the same Run ID or Run root; neither
  alternate workflow can derive the same real V2 episode;
- missing, changed and cross-workflow binding tests remain green;
- exact registered generic guidance is accepted;
- symbol-bearing and symbol-omitting direct answers, the short one-literal audit repro,
  the complete audit repro, Verifier literals and arbitrary unregistered paraphrases are
  rejected;
- frozen Task/Source/Verifier tamper remains rejected;
- a junction at workflows/<id>/recovery is rejected on admission reopen;
- ordinary accepted admission and disabled historical read-only reopen remain valid and
  identity-stable;
- all original Goal 1 and Prompt Section 10 regressions pass.

Run the strict environment-equivalent TypeScript check, diff/allowlist checks and Pi
cleanliness without installing dependencies. Record exact commands and environment
qualifications in both implementation reports.

## Stop conditions

Stop without editing if this requires an allowlist expansion, old-family semantic change,
State publication, Schema 2, Pi, Credential/network/Provider/model/Docker access or Goal
2 work. Do not audit, accept Goal 1, update CURRENT_STATE, tag or push.
