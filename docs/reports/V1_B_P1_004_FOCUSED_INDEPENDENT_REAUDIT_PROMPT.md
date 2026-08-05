# V1-B P1-004 Focused Independent Re-audit Prompt

```yaml
status: authorized_final_focused_reaudit
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
session_role: existing_pause_path_independent_audit_session
candidate_commit: 6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e
candidate_tree: 7ab79aa4073baab1c7570424701ebf1302b34837
workbench_source_digest: b1fa032d42c4e381c880b8092bddb5a625169ea44ee2e0ea238da1595d0edf92
audit_scope: P1-004_only_plus_mandatory_regressions
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
credential_reads_authorized: 0
external_network_authorized: false
provider_calls_authorized: 0
real_model_calls_authorized: 0
source_repairs_authorized: false
further_correction_cycles_authorized: 0
git_commit_authorized: false
stage_2_authorized: false
v2_authorized: false
```

## 1. Scope

Re-audit only P1-004 against the exact Candidate above. Confirm P1-002 and
P1-003 remain closed through their existing focused regressions, then run the
mandatory strict TypeScript, 31 focused tests and 42 sequential regressions.

Do not reopen a general pause-path audit. Do not repair anything. No fourth
correction exists: any remaining P0/P1 or required source change must produce
`PAUSE_NO_FURTHER_CORRECTION_AUTHORIZED`.

## 2. Candidate Gate

Use the existing audit worktree
`C:/Users/HUAWEI/.codex/worktrees/1772/project2`.

If the prior untracked re-audit report blocks checkout because the Candidate
now tracks it, compare normalized content and SHA-256, preserve the old bytes
under the existing ignored re-audit evidence root, then detach to the exact
Candidate. Do not delete or overwrite prior evidence.

Verify:

- exact Candidate commit/tree;
- clean tracked/index state;
- exact Workbench digest;
- exact clean Pi commit;
- historical Manifest blob unchanged;
- Candidate contains the first audit, first re-audit, Pause Report and
  one-time micro-correction Prompt;
- zero real access before tests.

Any mismatch stops the audit.

## 3. Independent P1-004 proof

Do not rely only on the Candidate's test assertions. Independently generate and
inspect the exact real Stage-2 deterministic pause immediately after durable
reservation and before dispatch.

PASS requires all of the following:

1. the unmodified evidence is pause-integrity valid, terminal false and
   comparable false;
2. credential reads are exactly 1 and external snapshot is exactly `0/0/0`;
3. reservation transitions are exact `0->1` for request and possible real
   network/Provider/model calls;
4. pending and conservative charge are exactly 65,536 tokens and USD 0.10;
5. a coherently rebound `1/1/1` snapshot with the original exact reservation
   transition is accepted as the only other possible-dispatch state;
6. a coherently rebound mixed tuple such as `1/0/1` is rejected;
7. the original coherent forgery with external transition `0->0` and snapshot
   `1/1/1`, including every repaired dependent digest, is rejected;
8. Stage-1 zero semantics remain valid;
9. no raw error, credential, payload, response or reasoning content persists.

The audit must not require a new phase/schema/producer change or reinterpret a
pause as terminal/comparable.

## 4. Required regression and boundaries

Run:

- strict TypeScript;
- V1-B focused Stage-1/CLI tests (expected 31/31);
- required sequential V1-A/V0-C regressions (expected 42/42);
- independent P1-004 adversarial checks;
- source digest, historical Manifest, protected path, Pi, index and secret/
  access accounting checks.

Write only a unique additive ignored audit directory and:

`docs/reports/V1_B_P1_004_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md`

No source/test/fixture/control/Manifest/Pi/reference edit, staging, commit,
credential read, network, Provider/model call, Stage 2 or V2 action is allowed.

## 5. Disposition and stop

Return exactly one:

- `PASS_FOCUSED_V1_B_P1_004_REAUDIT`;
- `PAUSE_NO_FURTHER_CORRECTION_AUTHORIZED`.

Record exact commands, exit codes, evidence path and zero-access accounting,
then stop.
