# V1-B Pause-path Focused Independent Re-audit Prompt

```yaml
status: authorized_focused_reaudit
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
session_role: original_fresh_pause_path_audit_session
candidate_commit: c360ebc4af9ef941252e6aff99638eca00b161e0
candidate_tree: 96f1f6ed016971e8801c9229ece4004bbc782f62
candidate_workbench_source_digest: 0494bd0f749cd587df779596c95f84fafc1c4fe65f57eabf511810476d5989e7
rejected_candidate_commit: cdc9780fd6b3e9b34cdc4156713377d601c595ec
original_audit_disposition: REVISE_FOCUSED_V1_B_PAUSE_PATH_CANDIDATE
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
audit_scope:
  - P1-001
  - P1-002
  - P1-003
credential_reads_authorized: 0
external_network_authorized: false
provider_calls_authorized: 0
real_model_calls_authorized: 0
source_repairs_authorized: false
git_commit_authorized: false
stage_2_authorized: false
v2_authorized: false
```

## 1. Role and scope

You are the same independent Audit Session that produced
`V1_B_PAUSE_PATH_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`. Re-audit only the three
accepted P1 findings against the exact corrected Candidate above, plus strict
TypeScript, the full V1-B focused suite and the required sequential V1-A/V0-C
regressions.

Do not broaden this into a general V1-B review. Do not repair source, tests,
fixtures, reports or control state. Do not create a replacement Manifest or
Execution Baseline, read credentials, use network, call a Provider/model, run
Stage 2 or enter V2.

## 2. Candidate checkout and identity Gate

Your audit worktree is
`C:/Users/HUAWEI/.codex/worktrees/1772/project2`.

The first-audit report has now been copied byte-for-byte into the corrected
Candidate by Main Session. If the old worktree's untracked copy blocks checkout:

1. compare its SHA-256 with the Candidate blob;
2. preserve only that old copy under the existing ignored first-audit evidence
   root;
3. switch/detach to the exact Candidate;
4. do not delete or overwrite any existing ignored audit evidence.

Then verify before audit commands:

- `HEAD` is `c360ebc4af9ef941252e6aff99638eca00b161e0`;
- `HEAD^{tree}` is `96f1f6ed016971e8801c9229ece4004bbc782f62`;
- tracked and staged state are clean;
- Candidate contains the first audit report and both bounded correction prompts;
- Workbench source digest is exactly
  `0494bd0f749cd587df779596c95f84fafc1c4fe65f57eabf511810476d5989e7`;
- pinned Pi is exact
  `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
- historical Manifest fixture is unchanged from the first audit.

If any identity differs, stop with `PAUSE_IDENTITY_MISMATCH`.

## 3. P1-001 re-audit — exact counter story

Independently reproduce the original coherent counter rewrite. Rehash all
dependent journal/pause/ArtifactRef/ledger bindings exactly as before.

Pass requires:

- Inspector rejects the coherent real-mode `0->0` transition / `1` snapshot
  contradiction;
- exact mode, phase, request ordinal, Attempt/Session/Workspace identity,
  reservation order and cap relations are enforced;
- all six legitimate typed pause phases still have an allowed exact matrix;
- a valid coherent pause remains nonterminal and noncomparable;
- full pending reservation/conservative accounting still holds when dispatch
  may have occurred.

Do not require broader multi-request or general telemetry behavior.

## 4. P1-002 re-audit — cleanup cannot erase pause

Use the independent throwing-close seam from the first audit.

Pass requires:

- the caller receives the sanitized `V1BTypedPauseError`, not the raw close
  error;
- the raw audit marker appears nowhere in persisted/public evidence;
- the durable order is
  `pause-evidence.json -> attempt_paused -> ledger paused`;
- the Run is nonterminal, noncomparable and zero-dispatch;
- no retry/fallback/next-cell behavior occurs.

Limit this re-audit to the durable typed-pause finding; do not open a general
resource-lifecycle audit unless a new concrete P0/P1 is directly observed.

## 5. P1-003 re-audit — replacement sequence on the public path

Exercise the actual tracked `preflightV1B`, `runNextV1B` and CLI surfaces, not
only helper unit tests.

Pass requires:

- revision 2 without exact sequence authority fails before Pilot creation or a
  `started` relation;
- mismatched/rehashed authority fails;
- the exact predecessor Manifest, original paused Run, one predecessor start,
  USD 0.10 debit and revision-2 Run membership are bound;
- the validator is invoked before Pilot initialization/Provider authority,
  before every initial start and before every child start;
- reused/nonmember initial IDs, child 9 and cap drift fail before append;
- one Manifest-derived claim cannot bind two fresh Pilot roots;
- no retry, fallback or automatic replacement appears;
- no final real replacement Manifest is created by the audit.

The Main Session remains responsible for freezing the one exact final Manifest,
authority file, Pilot root and command in the future Execution Baseline. Do not
expand this focused re-audit into a general distributed lock or scheduler audit.

## 6. Required commands and evidence

Run:

1. strict TypeScript;
2. `tests/v1b-stage1.test.ts` + `tests/v1b-cli.test.ts` (expected 31 tests);
3. the required sequential V1-A/V0-C regressions (expected 42 tests);
4. independent adversarial checks for P1-001 through P1-003;
5. source digest, forbidden-path, historical Manifest, Pi, index and real-access
   checks.

Write only a new unique ignored re-audit evidence directory and:

`docs/reports/V1_B_PAUSE_PATH_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md`

The report must contain exact commands/exit codes, evidence paths, findings,
zero-access accounting and one disposition:

- `PASS_FOCUSED_V1_B_PAUSE_PATH_REAUDIT`;
- `REVISE_FOCUSED_V1_B_PAUSE_PATH_CANDIDATE` only for a new concrete defect
  inside P1-001..003;
- `PAUSE_SCOPE_OR_ARCHITECTURE` if correction would require a third cycle,
  general platform work, V2 or another expanded boundary.

Do not stage or commit. Stop after the report.
