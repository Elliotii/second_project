# V1-B Pause-path Focused Independent Audit Prompt

You are a fresh independent Audit Session. Audit only the frozen V1-B
pause-path corrected Candidate and the fixed replacement-revision boundary.

## Frozen identity and authority

```yaml
candidate_commit: cdc9780fd6b3e9b34cdc4156713377d601c595ec
candidate_tree: fced95adf974cf95f26cb7a3c88ed871a7202ab8
pause_evidence_baseline_commit: c68e834b654d56a1ce8312b6f5f085230e74d7d1
original_execution_baseline_commit: 19617319c13a9eecbb325682c920e79d1517b89d
original_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
credential_reads_authorized: 0
network_authorized: false
provider_calls_authorized: 0
real_model_calls_authorized: 0
source_repair_authorized: false
git_stage_or_commit_authorized: false
v2_authorized: false
```

Before testing, read `AGENTS.md`, `CURRENT_STATE.md`, the formal V1-B Contract,
the accepted Pause Recovery Amendment, Stage 2 Main Pause Review, Correction
Report/Closeout Draft and the exact changed source/tests. Verify exact HEAD/tree,
clean tracked/staged state and root pinned Pi exact/clean. Do not edit source,
tests, fixtures, Manifest, controls, Pi or reference material.

## Focused questions

### 1. Durable ordering and dispatch boundary

- From pinned Pi source and the public emitted path, verify that the
  `before_provider_request` handler completes before an HTTP request can be
  dispatched.
- Demonstrate that reservation journal persistence happens before that handler
  returns. A journal/write callback failure must prevent dispatch and must not
  create a false terminal/comparable result.
- Verify `pause-evidence.json` and `attempt_paused` are durable before the Pilot
  appends `paused`; an incomplete chain must fail closed.

### 2. Typed attribution, counters and accounting

- Reproduce all six closed pause phases without real access.
- Independently check request ordinal and credential/network/provider/model
  counters against the phase and reservation event. Try a coherently rehashed
  counter-transition/snapshot mismatch, not only a phase rename.
- When dispatch may have occurred and usage is absent/invalid, require the full
  pending token and USD reservation; pre-reservation failure must carry no such
  charge.
- Check that cleanup/close failure cannot silently replace or erase the typed
  pause evidence.

### 3. Inspector and denominator boundary

- A coherent pause may be `integrity_valid` only as paused evidence; it must
  remain `terminal_valid=false`, `comparable=false`, without RunResult or
  terminal artifacts.
- Missing, duplicate, reordered, byte-tampered and coherently rehashed evidence,
  including secret/error/payload/reasoning-shaped data, must fail closed.
- Aggregate may retain conservative usage but must add zero effect-denominator
  Runs and must not claim Gate O completion.

### 4. Replacement identity and one-sequence cap

- Revision 2 must bind the exact predecessor, USD 0.10 prior debit, USD 1.90
  replacement cap, unchanged 24-cell A/B/C layout, 24 new Run IDs, 25 maximum
  cross-sequence initial starts and eight maximum child Attempts.
- Determine whether the actual preflight/execution handoff can enforce these
  rules, rather than merely exposing an unused validator. Reject arbitrary
  revision 2 construction, predecessor drift, reused/nonmember IDs, a second
  replacement, retry/fallback/automatic replacement or cap changes.
- Confirm the historical tracked Manifest/fixture remains immutable and that
  dynamic test construction does not hide a required final replacement
  Manifest Gate.

### 5. Required regressions and boundaries

- strict TypeScript;
- V1-B focused suite, currently expected 26/26;
- sequential V1-A/V0-C regressions, currently expected 42/42;
- recompute candidate Workbench digest, expected
  `634879c68345ccb689ba3768197612db1cad83e575f217d5f125cabba5d9c0d5`;
- prove zero credential/network/Provider/model access and zero source/control/
  fixture/Pi/reference/staged delta by the Audit Session.

## Severity and stop rule

Report only Contract-relevant findings. Do not expand into a general durable
runtime, transactional platform, Pi compatibility audit or V2 design.

- `P0`: secret/dispatch/budget boundary can be violated or evidence can be
  accepted as terminal/comparable.
- `P1`: a realistic coherent bypass, replacement identity/cap bypass or missing
  mandatory execution Gate can invalidate the replacement Pilot.
- `P2`: bounded correctness/documentation issue that does not invalidate the
  replacement Pilot.

If a P0/P1 exists, return `REVISE_FOCUSED_V1_B_PAUSE_PATH_CANDIDATE` with the
smallest bounded correction. Otherwise return
`PASS_FOCUSED_V1_B_PAUSE_PATH_AUDIT`.

Create only:

- `docs/reports/V1_B_PAUSE_PATH_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`;
- uniquely named ignored audit evidence under `.runs/v1-b/audit/`.

Do not repair, stage, commit, create a replacement Manifest/Execution Baseline,
read credentials, use network, run a real Pilot, modify controls or enter V2.
Stop after the report and return to Main Session.
