# V2-B R2 Context-corrected Stage 2 Execution Report

```yaml
date: 2026-08-07
goal_id: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
session_role: fresh_top_level_no_source_edit_r2_execution_session
sequence_id: v2b-r2-real-20260807-02
status: paused
sequence_reason: negative_not_valid
recommended_disposition: PAUSE_V2_B_R2_NEGATIVE_NOT_VALID
execution_baseline_commit: 571165a186444e16a0fafad2fcd886295d7efbab
execution_baseline_tree: bb7245412093f132fec4236711e7bbda96d0a1c1
manifest_id: 7784234c824bb5bfda328e19aec6730c1830db4930a8625a8bc96f2986d79014
workbench_source_digest: 4dc7bed1dd461023f53be9e760b22fee3015dba7096fd475072440e390151ba8
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
started_attempts: 4
credential_reads: 2
network_calls: 20
external_provider_calls: 20
real_model_calls: 20
actual_new_cost_usd: 0.0012750192
old_plus_new_r2_cost_usd: 0.0021159376
retry_performed: false
fallback_performed: false
replacement_performed: false
source_repair_performed: false
final_v2_b_or_v2_acceptance_made: false
```

## 1. Result

**Fact.** Gate H-R2 passed with zero Credential, network, external Provider and real-model access. The
tracked CLI rebuilt the immutable Manifest for `v2b-r2-real-20260807-02`; strict TypeScript passed;
`workbench/tests/v2b-r2.test.ts` passed 8/8 with zero skipped; the fixed local DeepSeek profile
resolved; tracked preflight returned `valid: true`; and the sequence root was absent before execution.

**Fact.** The controlled Primary traversed the Direct public `AgentHarness`, Tool lifecycle and public
JSONL Session with zero external/real calls. It settled, passed the public maintenance check, failed
the external target Verifier, and froze one immutable Recovery Seed before either Candidate started.

**Fact.** Real Candidates A and B both started exactly once from the same Seed Workspace digest. A
retained six parent Session entries and settled; B used a fresh Session with zero parent entries and
reached the Amendment-authorized quiescent `pre_dispatch_budget_terminal`. The common target Verifier
passed for both Candidates, all recorded hard gates passed, and the write-once Selector selected A.

**Fact.** The mandatory read-only Inspector after A/B returned `integrity_valid: true`, no errors. Its
`terminal_valid: false` was the expected incomplete-sequence state before the Negative.

**Fact.** The stable-format Negative started exactly once. It made eight real Provider/model calls and
twelve Tool calls, then produced the typed Case Pause `post_dispatch_or_invalid_stop` with reason
`execution_boundary`. No Negative Verifier result exists. The sequence terminal is therefore
`paused / negative_not_valid`. No retry, fallback, replacement, additional Case, additional Attempt or
Verifier continuation was run.

**Fact.** Final read-only inspection returned `integrity_valid: true`, `terminal_valid: true`, and
`errors: []`. This validates the integrity and terminalization of the paused evidence; it does not make
the Negative valid or satisfy Gate J-R2.

**Recommendation.** Return `PAUSE_V2_B_R2_NEGATIVE_NOT_VALID` to Main. The Positive real recovery
mechanism produced valid selected evidence, but the mandatory Negative did not produce its required
target-Verifier pass/no-branch result. This Session does not accept or close V2-B or V2.

## 2. Gate H-R2

| Check | Result |
|---|---|
| HEAD / tree | exact `571165a186444e16a0fafad2fcd886295d7efbab` / `bb7245412093f132fec4236711e7bbda96d0a1c1` |
| Tracked / staged state | clean before real access |
| Authoritative Pi | exact and clean at `027a5847901b5dde30270abaa1041046cd2b4b55` |
| Read-only emitted-package cache | exact and clean at the same Pi commit; public packages `0.82.1` |
| Public emitted imports | pass |
| Manifest | rebuilt by frozen CLI; ID `7784234c824bb5bfda328e19aec6730c1830db4930a8625a8bc96f2986d79014` |
| Workbench source digest | `4dc7bed1dd461023f53be9e760b22fee3015dba7096fd475072440e390151ba8` |
| Strict TypeScript | pass, zero diagnostics |
| Focused R2 suite | 8/8 pass, zero skipped |
| Fixed Provider profile | `deepseek` / `deepseek-v4-flash`, local resolution only |
| Tracked preflight | `valid: true` |
| Pre-access real counters | all zero |
| New sequence root | absent |

The ignored loader and TypeScript path map only routed public package names to the existing clean,
pinned emitted-package cache. They changed no tracked source, fixture, Verifier, Manifest semantics,
Case, budget or runtime route.

## 3. Frozen identities and activation

### 3.1 Sequence and controlled Seed

```yaml
sequence_id: v2b-r2-real-20260807-02
positive_run_id: v2b-r2-real-20260807-02-primary_positive-run
positive_primary_attempt_id: v2b-r2-real-20260807-02-primary_positive-run-primary-attempt-01
parent_session_id: v2b-r2-real-20260807-02-primary_positive-run-parent-session
recovery_seed_id: v2b-r2-real-20260807-02-primary_positive-run-recovery-group-01-seed-01
recovery_group_id: v2b-r2-real-20260807-02-primary_positive-run-recovery-group-01
failed_workspace_digest: 85d50969c9d7ede5c7b0e67186231c2d3cbc21ff9f82872ae7c3cd3f9fc6e86a
parent_session_digest: b454de44711f942c054fc86b503b115472e46d38b01ccd7ec83be160585f1e30
controlled_fixture_sha256: ac487bcab206535edf13ad2b77c5052f552ab0d27bcd8071b457d4bd187da1d9
controlled_fixture_provenance_source_run: v1c-full-pilot-run-14-parse-duration-r2-a
created_before_candidate_attempts: true
```

The controlled Primary recorded three Faux dispatches, two Tool calls, 4,400 tokens, one maintenance
check and one target Verifier run, but zero Credential/network/external Provider/real-model calls and
USD `0`. It settled; maintenance exited `0`; the target Verifier exited `1` with valid failure
`duration_behavior`.

### 3.2 Activation table

| Ordinal | Case | Activation | Attempts | Result |
|---:|---|---|---:|---|
| 1 | `primary_positive` / `v1-parse-duration` | activated once | 3: controlled Primary, A, B | valid controlled Seed; both Candidates valid; A selected |
| 2 | `contingency_positive` | skipped as frozen | 0 | `primary_formed_valid_seed_or_post_dispatch_terminal` |
| 3 | `negative` / `v1-stable-format` | activated once | 1 | typed Pause; no Verifier result; sequence `negative_not_valid` |

No Case or Attempt was activated twice. No unplanned Case/path exists.

## 4. Candidate A/B outcomes and Selection

The two Candidate initial Workspace digests are byte-identical to the Seed:
`85d50969c9d7ede5c7b0e67186231c2d3cbc21ff9f82872ae7c3cd3f9fc6e86a`.
Their common Artifact digest is
`5ddfe6d8fd7397cad8ac22769e439050c7b80bd81d31804e5213e69184873229`, and their immediate recovery
Prompt digest is
`57660dce3dfb2308731e5ec23045bf02241cdb008948f45572d14d0a9a10bb81`.

| Field | A | B |
|---|---|---|
| Candidate ID | `v2b-r2-real-20260807-02-primary_positive-run-recovery-group-01-candidate-a` | `v2b-r2-real-20260807-02-primary_positive-run-recovery-group-01-candidate-b` |
| Attempt ID | `...candidate-a-attempt-01` | `...candidate-b-attempt-01` |
| Strategy | `continue_failed_session` | `fresh_session_from_failure_seed` |
| Session ID | `...candidate-a-session` | `...candidate-b-session` |
| Parent history entries | 6 | 0 |
| Initial context messages | 8 | 2 |
| Agent completion | `settled` | `pre_dispatch_budget_terminal` |
| Terminal reason | `settled` | `budget_stopped` |
| Quiescent terminal | not applicable | all eight quiescence fields satisfied |
| Provider requests | 4 | 8 |
| Tool calls | 4 | 8 |
| Tokens | 9,334 | 13,540 |
| Verifier runs / status | 1 / passed | 1 / passed |
| Real cost USD | `0.0004492320` | `0.0004381776` |
| Final Workspace digest | `f8975311aa0cc8288c20dbb0dbc43ef386876ac21a58314f8e2386f882d2166e` | `456442a9d7fe947b0a4ff7b46d9ad8fed87c4ec774fc32e04325b76a60b8e23a` |
| Evidence / budget / hard gates | valid / within limits / all pass | valid / within limits / all pass |

The write-once Selection artifact is
`substrate/selection.json`, SHA-256
`d00aae8daddf6c2185debe9093cf04c35c85161bcb28e740edb8c8130d6f0fa2`.
Both Candidates were eligible. A was selected first by the frozen secondary ordering because its
allowed semantic diff size was `237`, versus B's `252`; A also used fewer tokens and Tool calls.

Candidate Session artifact SHA-256 values are:

- A: `6765c42aa3496ecfe7d29cdf2ecbdde9817004204d636a2a0225d9d05b488e0b`;
- B: `35216e69d72da5a63549042edc94f3e3263ec8ddb6cc3c8e87f36f12d6cfaffa`.

## 5. Negative hard stop

```yaml
negative_run_id: v2b-r2-real-20260807-02-negative-run
negative_attempt_id: v2b-r2-real-20260807-02-negative-run-primary-attempt-01
negative_session_id: v2b-r2-real-20260807-02-negative-run-parent-session
starts: 1
pause_phase: post_dispatch_or_invalid
pause_reason: execution_boundary
sequence_status: paused
sequence_reason: negative_not_valid
provider_requests: 8
tool_calls: 12
tokens: 13668
active_execution_time_ms: 11640
verifier_runs: 0
real_cost_usd: 0.0003876096
real_call_counters:
  credential_reads: 1
  network_calls: 8
  external_provider_calls: 8
  real_model_calls: 8
```

No Negative Failure Packet, Recovery Seed, Candidate directory, Selection artifact or Verifier result
exists. The required stable-format target-Verifier pass was therefore not observed. The Negative is
not a valid no-branch pass, even though it also created no recovery objects. Amendment Hard Exit Section 13.6
applies; Negative failure cannot authorize replacement.

## 6. Raw-to-derived usage and cost reconciliation

| Component | Provider requests | Real calls | Tool calls | Tokens | Verifier runs | Active ms | Cost USD |
|---|---:|---:|---:|---:|---:|---:|---:|
| Controlled Primary | 3 Faux | 0 | 2 | 4,400 | 1 | 636 | `0` |
| Candidate A | 4 | 4 | 4 | 9,334 | 1 | 10,283 | `0.0004492320` |
| Candidate B | 8 | 8 | 8 | 13,540 | 1 | 10,571 | `0.0004381776` |
| Negative | 8 | 8 | 12 | 13,668 | 0 | 11,640 | `0.0003876096` |
| New sequence total | 23 including 3 Faux | 20 | 26 | 40,942 | 3 | 33,130 | `0.0012750192` |

The attempt evidence sums exactly to the sequence ledger and terminal. The sequence reserved four
Attempts conservatively (`32` Provider requests, `48` Tool calls, `262,144` tokens, `1,200,000` active
ms, four Verifiers and USD `0.80`); these are reservations, not actual spend.

All actual per-Attempt costs are below USD `0.20`; the Positive Recovery Group actual cost is USD
`0.0008874096`, below USD `0.60`; and the new sequence actual cost is USD `0.0012750192`. Adding the
binding old-sequence cost USD `0.0008409184` yields USD `0.0021159376`, below the aggregate USD `1.40`
ceiling.

## 7. Inspector, evidence and source/secret boundary

The final tracked Inspector returned:

```yaml
integrity_valid: true
terminal_valid: true
errors: []
terminal_status: paused
terminal_reason: negative_not_valid
```

Primary authoritative artifact identities:

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| Manifest build stdout | 9,594 | `1683cdfb66abae30d41fcdccec6a109b83a89ebc11945bb220942a1028325fa1` |
| Sequence Manifest | 9,594 | `dda9a80b91d415d37e8a3e7a7acdaedb32562a440939253424ed66568141939e` |
| Sequence ledger | 14,004 | `a1ef1d987b8b2c3c08335af46fa1991a5577b5c20bdedd5807c69b51fe9f82e8` |
| Sequence terminal | 1,586 | `31802d6a3d063691c9cf33638d09cee764b528d7a7a1630ccb21b079d952ef55` |
| Positive Run terminal | 1,636 | `1ea3a551c9377dba375f81ef2cdc9c965b8da3b18bfee2f229af23a157447954` |
| Positive substrate terminal | 2,312 | `31c94f6394d8aa900cc3b982631a23202f3afecb8eaa88280482255472759abd` |
| Recovery Seed | 3,205 | `c90004120459cf1bf38360c8e30c62eb1dc794dd3aefacc55ac2bb0566eda227` |
| Candidate A | 3,302 | `78ef25def84d03800a4a681fea2fa9bccbe5f04726da396924081ddc15dbdf87` |
| Candidate B | 3,530 | `49af46021cd44d666f6772302710c1378c84962b2d7ffbb361787dad363375cb` |
| Negative Pause | 1,118 | `f5555f010b3c9e605cf62cc4e0a8f13deb2af9dada6f4aca366ba04ce05d5577` |

The Credential was read opaquely twice, once for the Positive Run and once for the sole Negative Run.
Its value was not printed, returned, hashed, compared, measured or persisted. Inspector acceptance
proves the tracked schema-aware secret/reasoning boundary over the generated sequence evidence.

Immediately before report creation, HEAD/tree and the tracked/index state still matched the Execution
Baseline, the live source digest still matched the Manifest, and both authoritative Pi and the emitted
package cache remained clean at the pinned commit. No source, test, fixture, Skill, Prompt, Verifier,
Manifest, control, Pi, reference, Git index or commit was changed. The only tracked delta created by
this Session is the two R2 reporting files.

## 8. Commands and exit codes

| Command/check | Exit/result |
|---|---|
| exact `git show -s --format=%H%n%T HEAD`; tracked/index clean | 0; exact baseline |
| authoritative Pi and emitted-cache identity/clean checks | 0; exact pinned commit |
| public emitted import smoke through ignored loader | 0 |
| frozen `v2b-stage2 build-manifest` through materializer | 0 |
| strict TypeScript with ignored audited public-Pi path map | 0 |
| `node --test workbench/tests/v2b-r2.test.ts` with loader propagation | 0; 8/8, zero skipped |
| local fixed Provider-profile preflight | 0; zero access |
| tracked `v2b-stage2 preflight` | 0; `valid: true`, all counters zero |
| first opaque `run-next` wrapper | 0; Positive `recovery_selected`, A selected |
| mandatory post-A/B tracked Inspector | 0; integrity valid, no errors, sequence incomplete |
| second opaque `run-next` wrapper | 0 process exit; typed sequence terminal `paused / negative_not_valid` |
| final tracked Inspector | 0; integrity and terminal valid, no errors |
| final tracked preflight/identity/source/Pi checks | 0 |

A preliminary PowerShell `git rev-parse HEAD^{tree}` invocation was parsed incorrectly and emitted an
irrelevant Git ambiguity error. It occurred before any real access and was immediately replaced by
the unambiguous `git show -s --format=%T HEAD`, which proved the required tree. It changed no state.

## 9. Gates, claims and remaining decisions

| Gate | Result |
|---|---|
| Gate H-R2 | pass |
| Gate I-R2 controlled Seed and real A/B | pass; both valid, A selected |
| Gate J-R2 real Negative | hard stop; no Verifier result |
| Gate K-R2 final reconciliation | evidence/terminal/source/Pi reconciliation pass for the paused sequence |

Allowed claims:

- the Workbench formed a valid controlled verifier-failed Seed through the Direct public lifecycle;
- real A/B started from identical Seed Workspace bytes with parent Session history as the primary
  treatment delta;
- both real Candidates passed the target Verifier and hard gates, and the frozen Selector selected A;
- the single Negative attempt did not produce a valid target-Verifier result;
- the paused sequence is integrity-valid and terminal-valid, with exact bounded cost.

Not allowed:

- V2-B or V2 passed or closed;
- the required Negative pass/no-branch behavior was demonstrated;
- A is generally superior to B;
- natural real-model failure was recovered end to end;
- statistical improvement, production durability, OS sandbox, exactly-once Tool, SDK/Extension/RPC
  integration, V3 capability or self-evolution.

Main/user must disposition this hard stop. This Session recommends
`PAUSE_V2_B_R2_NEGATIVE_NOT_VALID` and grants no continuation authority.

## 10. `CURRENT_STATE_UPDATE_PROPOSAL`

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  proposal_only: true
  active_goal: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
  r2_stage_2_status: paused_after_valid_positive_and_invalid_negative
  execution_baseline_commit: 571165a186444e16a0fafad2fcd886295d7efbab
  execution_baseline_tree: bb7245412093f132fec4236711e7bbda96d0a1c1
  sequence_id: v2b-r2-real-20260807-02
  manifest_id: 7784234c824bb5bfda328e19aec6730c1830db4930a8625a8bc96f2986d79014
  sequence_status: paused
  sequence_reason: negative_not_valid
  inspector_integrity_valid: true
  inspector_terminal_valid: true
  inspector_errors: []
  controlled_seed_valid: true
  positive_a_b_valid: true
  candidate_a_verifier: passed
  candidate_b_verifier: passed
  selected_candidate_id: v2b-r2-real-20260807-02-primary_positive-run-recovery-group-01-candidate-a
  negative_started_once: true
  negative_verifier_result: absent
  negative_recovery_objects: 0
  actual_usage:
    started_attempts: 4
    provider_requests_including_controlled_faux: 23
    real_provider_model_calls: 20
    tool_calls: 26
    tokens: 40942
    active_execution_time_ms: 33130
    verifier_runs: 3
    real_cost_usd: 0.0012750192
  old_plus_new_r2_cost_usd: 0.0021159376
  credential_reads: 2
  retry_fallback_replacement_extra_case_or_attempt: 0
  stage_2_source_manifest_control_pi_delta: 0
  recommended_disposition: PAUSE_V2_B_R2_NEGATIVE_NOT_VALID
  final_v2_b_acceptance: pending_main_and_user
  final_v2_acceptance: pending_main_and_user
  v3_authorized: false
```
