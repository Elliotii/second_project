# V0-C Focused Independent Re-audit Start Prompt

```yaml
status: authorized_for_original_independent_v0_c_audit_session
authorized_by_user: 2026-07-31
reaudit_kind: lightweight_affected_findings_only
corrected_candidate_commit: 861b7241e8abf8608fc981a68bae39037f598f5d
corrected_workbench_digest: a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446
failed_audit_candidate_commit: 930c549b402fce9ffa96847a673ad187c64f6094
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
findings_under_reaudit:
  - V0C-AUD-001
  - V0C-AUD-002
source_repairs_authorized: false
git_stage_or_commit_authorized: false
control_state_modification_authorized: false
stage_2_authorized: false
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
```

## 1. Role and stop boundary

You are the same independent V0-C Audit Session that produced:

`docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`

The original Implementation Session has made a bounded correction for
`V0C-AUD-001/002`, and the Main Session has frozen the exact corrected
Candidate above.

Re-audit only:

1. whether both accepted findings are actually corrected;
2. whether the correction preserves the directly affected V0-C and accepted
   V0-B boundaries;
3. whether the corrected authoritative evidence binds the exact Candidate.

Do not reopen the rest of V0-C, search for unrelated improvements, repair
source, enter Stage 2 or repeat the original broad audit.

## 2. Required reading

Read completely:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md`;
4. `docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_START_PROMPT.md`;
5. `docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`;
6. `docs/reports/V0_C_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md`;
7. `docs/reports/V0_C_STAGE1_IMPLEMENTATION_REPORT.md`;
8. `docs/reports/V0_C_STAGE1_CLOSEOUT_DRAFT.md`;
9. this Prompt.

Then inspect only the corrected source/tests and cited ignored evidence needed
for the two findings.

## 3. Gate A — corrected Candidate identity

Before tests, probes or report creation, verify:

1. root `HEAD` is exactly
   `861b7241e8abf8608fc981a68bae39037f598f5d`;
2. root tracked and staged changes are empty;
3. untracked content is limited to:
   - `reference/`;
   - `docs/reports/V0_C_FOCUSED_INDEPENDENT_REAUDIT_START_PROMPT.md`;
4. independently recomputed Workbench digest is exactly
   `a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446`;
5. `.upstream/pi` is exactly
   `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
6. the failed-audit Candidate, original audit Prompt/Report and audit evidence
   remain unchanged;
7. no credentials, external network or Provider capability is opened.

If Gate A fails, write only a bounded pause result and stop.

## 4. Re-audit V0C-AUD-001

Confirm from source and deterministic proof:

- successful handle creation is followed immediately by an outer cleanup
  boundary covering `lifecycleProbe("handle_created")`, `debugIdentity()` and
  all later Run work;
- either injected post-creation throw closes the exact handle once;
- no Attempt, Outcome, Index or terminal marker is created by those failures;
- the normal path still closes only after terminal commit;
- initial and child Attempts still share one handle;
- prohibited-surface counters remain zero.

Run the existing focused tests. Add an audit-local ignored probe only if the
existing source/test evidence cannot establish one of these facts.

## 5. Re-audit V0C-AUD-002

Confirm from source and deterministic proof:

- Run validation consumes actual per-Attempt Verifier and validation objects
  plus their ArtifactRefs, rather than caller-projected IDs alone;
- Verifier Attempt relation, frozen identity/digest, path, digest, size and
  readback are validated;
- exactly one Verifier and one Attempt validation are required per started
  Attempt;
- exactly one Run-validation object and Journal event remain;
- the writer applies the shared dynamic closed-set policy to realized Index
  items before terminal commit;
- relationship, missing/duplicate, ref and realized-Index faults cannot commit a
  terminal marker or a committed valid Outcome;
- `inspectRunV0C()` explicitly rejects Verifier-to-Attempt/identity/ref drift;
- normal one- and two-Attempt Runs still commit and inspect successfully.

Distinguish an uncommitted preterminal artifact from a committed Outcome. Do not
promote absence of a general transaction system into a finding.

## 6. Bounded commands

Run only:

1. strict TypeScript;
2. `node --test workbench/tests/v0c-post-audit-correction.test.ts`;
3. `node --test workbench/tests/v0b-post-audit.test.ts`;
4. one complete `node --test workbench/test` regression;
5. `inspect` on the five corrected authoritative Runs recorded in the
   Implementation Report;
6. narrow read-only identity, source-delta, scan and protected-file checks.

Do not run a real Provider/model, use credentials, access the network, install
dependencies, modify Pi or generate unrelated experiments.

Formatting-only Markdown hard breaks and already disclosed line-ending/EOF
warnings are non-findings unless they change executable evidence identity.

## 7. Required report

Create only:

`docs/reports/V0_C_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md`

The report must include:

- Gate A identities;
- exact source/symbol review for both findings;
- commands, cwd, UTC intervals, exit codes and test counts;
- corrected authoritative Run inspection results;
- prohibited-surface counters;
- finding-by-finding resolution table;
- remaining limitations and non-claims;
- exactly one disposition:

```yaml
- PASS_FOCUSED_V0_C_REAUDIT
- REQUEST_V0_C_ADDITIONAL_BOUNDED_CORRECTION
- PAUSE_V0_C_REAUDIT
```

Audit evidence may be written only under ignored
`.runs/v0-c/reaudit/`. Preserve `.runs/v0-c/audit/` and all authoritative Runs.

## 8. Prohibited actions

Do not:

- modify Workbench, fixtures, tests or implementation reports;
- modify, stage or commit control/history files;
- stage files or create a Git commit;
- accept V0-C or update `CURRENT_STATE.md`;
- read credentials, call a real model/Provider or access external network;
- modify Pi or use private Pi imports;
- enter Stage 2;
- broaden the review beyond the two accepted findings and their required
  regressions.

## 9. Final stop point

After writing the re-audit report, stop and wait for Main Session review.
