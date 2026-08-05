# V1-C fresh real Canary execution report

## Executive result

**Fact — execution-session disposition:** `CANARY_EXECUTION_EVIDENCE_COMPLETE_PENDING_MAIN_REVIEW`.

The one authorized Canary cell reached a Contract-valid terminal result. The common Verifier passed, the tracked Inspector reported `integrity_valid: true`, `terminal_valid: true`, `comparable: true`, and no errors, and the independent cross-check validated the complete evidence lineage and all 11 referenced artifacts.

**Fact:** the Run used 8 Provider requests, 10 Tool calls, 12,147 tokens, 17,083 ms active execution time, 1 Verifier Run, 0 child Attempts, and exactly USD `0.00042865199999999996`. This is below the USD 0.10 Canary cap, leaving USD `0.09957134800000001` of that envelope unused.

**Fact:** request ordinal 9 was rejected locally before dispatch because the Provider-request cap had already reached 8. The typed stop was recorded, consumed, and followed by `attempt_settled`, the common Verifier, and terminalization. It did not become a ninth Provider/network/model call.

**Inference:** the observed evidence satisfies the Execution Session's bounded Canary-validity checks. This Session does not accept the Canary or activate the full Pilot; both decisions remain Main-owned.

## Authority and stop boundary

- Goal: `V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION`
- Source editing: not authorized and not performed.
- Git staging/commit: not authorized and not performed.
- Authorized real scope: one planned Canary cell and one `run-next` process.
- Full Pilot, retry, fallback, replacement, V2, and V3: not authorized in this Session and not entered.
- Stop point: this report and ignored Canary evidence have been produced; the Session stops here.

## Frozen identities

| Identity | Expected | Observed |
|---|---|---|
| Authorization baseline commit / tree | `2aff5ccdcc7aa780cc4bf68f9030d6123c750d7b` / `c86860c7945baa48d790d613614db6b8d01f0d1e` | exact |
| Audited Execution Baseline commit / tree | `cc71cdb8952178ef1d7422f44359d6ca08473b18` / `7fa38a7b4484fa4076834c0cb01a46415bad0ac9` | exact parent of HEAD |
| Audited source Candidate commit / tree | `962b42a281d3092f0faf399b9f6f1ecaa0212f31` / `d828f9fdb23c7099cdb1e4d5a993ff5579422dd4` | exact grandparent of HEAD |
| Pinned Pi commit | `027a5847901b5dde30270abaa1041046cd2b4b55` | exact in both registered checkouts; both clean |
| Canary Manifest ID | `c26e75989623ae1218be0a3996c59de2ccbce946988396695b38bb9fdc482c4c` | exact and reconstructed |
| Workbench source digest | `4d12e4588917949ee84bb56c83ec67f7cb8093a304c8a3ab9980c97188174604` | exact and recomputed |
| Planned cell / Run | `v1c-canary-cell-01` / `v1c-canary-run-01-parse-duration-r1-a` | exact |
| Task / Arm | `v1-parse-duration` / `A_baseline` | exact |

**Fact:** Gate A began with a clean tracked and staged tree. Only the two expressly permitted ignored directory junctions were created because the fresh worktree lacked ignored dependencies:

- `workbench/node_modules` → `D:/AI/AI_Projects/project2/workbench/node_modules`
- `.runs/v0-a/pi` → `D:/AI/AI_Projects/project2/.runs/v0-a/pi`

Their resolved targets were validated before creation; no unexpected existing path was replaced and no dependency was installed or downloaded.

## Gate A and local Provider-boundary checks

**Fact:** the tracked Manifest reconstructed to one exact cell with caps of 0 child Attempts, 8 Provider requests, 12 Tool calls, 65,536 tokens, 300,000 ms, 1 Verifier Run, and USD 0.10. Retry, fallback, and automatic replacement were false.

**Fact:** the tracked Provider/profile boundary still matched the frozen official checkpoint: model `deepseek-v4-flash`, OpenAI-completions-compatible DeepSeek provider, base URL `https://api.deepseek.com`, request endpoint `/chat/completions`, non-thinking execution, Tool Calls, known usage fields, input price `0.14`, output price `0.28`, cache-read price `0.0028`, cache-write price `0`, context window `1,000,000`, and max tokens `384,000`. No unrelated browsing or standalone network probe was performed.

**Fact:** the exact zero-call preflight returned `status: ready`, named the exact next cell, and reported credential/network/Provider/model counters all zero. Its preflight-only Pilot root remained absent.

Commands and results, run from the repository root unless noted:

```text
git rev-parse HEAD^{commit}                                      # exit 0; 2aff5ccdcc7aa780cc4bf68f9030d6123c750d7b
git rev-parse HEAD^{tree}                                        # exit 0; c86860c7945baa48d790d613614db6b8d01f0d1e
git rev-parse HEAD^1^{commit}                                    # exit 0; cc71cdb8952178ef1d7422f44359d6ca08473b18
git rev-parse HEAD^1^{tree}                                      # exit 0; 7fa38a7b4484fa4076834c0cb01a46415bad0ac9
git rev-parse HEAD^2^{commit}                                    # exit 0; 962b42a281d3092f0faf399b9f6f1ecaa0212f31
git rev-parse HEAD^2^{tree}                                      # exit 0; d828f9fdb23c7099cdb1e4d5a993ff5579422dd4
git status --short                                               # exit 0; empty before execution
git -C D:/AI/AI_Projects/project2/.upstream/pi rev-parse HEAD     # exit 0; pinned Pi commit
git -C D:/AI/AI_Projects/project2/.upstream/pi status --short    # exit 0; empty
git -C D:/AI/AI_Projects/project2/.runs/v0-a/pi rev-parse HEAD   # exit 0; pinned Pi commit
git -C D:/AI/AI_Projects/project2/.runs/v0-a/pi status --short   # exit 0; empty
node .runs/v0-a/pi/node_modules/typescript/bin/tsc -p workbench/tsconfig.json
                                                                  # exit 0
node --test workbench/tests/v1c-budget-stop.test.ts               # exit 0; 13/13
node --test workbench/tests/v1b-stage1.test.ts workbench/tests/v1b-cli.test.ts
                                                                  # exit 0; 31/31
node workbench/src/cli.ts v1b preflight --manifest fixtures/manifests/v1/v1c-real-canary-execution.json --pilot-root .runs/v1-c/canary/preflight-only
                                                                  # exit 0; ready; counters 0/0/0/0
```

An initial combined local wrapper containing the three deterministic verification commands exceeded the shell executor's 64-second wrapper limit and ended with wrapper exit 124. Each exact command was then run separately and passed. This occurred before Credential resolution and made zero real calls. The same three exact commands were also run after the Canary and passed again: strict TypeScript exit 0, V1-C 13/13, and V1-B 31/31.

## Opaque Credential handling and the single real command

**Fact:** the parent shell did not contain `DEEPSEEK_API_KEY` before or after execution. The only Credential file accessed was `D:/AI/AI_Projects/project2/.env.g005`, and only the same-process preload read it. The preload rejected inherited, absent, empty, duplicate, or malformed values; it never printed, hashed, measured, serialized, or persisted the value and removed it from the process environment on exit.

The one and only real `run-next` command was:

```text
node --import ./.runs/v1-c/canary/opaque-credential-preload.mjs workbench/src/cli.ts v1b run-next --manifest fixtures/manifests/v1/v1c-real-canary-execution.json --pilot-root .runs/v1-c/canary/pilot --stage2-real-authority
```

Result: exit 0. Sanitized stdout identified Run `v1c-canary-run-01-parse-duration-r1-a`, `verifier_status: passed`, and counters `credential_reads: 1`, `network_calls: 8`, `provider_calls: 8`, `model_calls: 8`. Stderr was empty. No second `run-next` was started.

## Run, usage, reservation, and Outcome evidence

| Field | Exact observed value |
|---|---:|
| Provider requests | 8 |
| Network / Provider / model calls | 8 / 8 / 8 |
| Credential reads | 1 |
| Tool calls | 10 |
| Tokens | 12,147 |
| Active execution time | 17,083 ms |
| Verifier Runs | 1 |
| Child Attempts | 0 |
| Exact cost | USD `0.00042865199999999996` |
| RunResult disposition | `required_terminal` |
| Terminal disposition / failure class | `terminal` / `task_pass` |
| Common Verifier | `passed`, exit 0, 79 ms, no timeout |

Per-request known usage and cost:

| Request | Tokens | Cost USD |
|---:|---:|---:|
| 1 | 839 | `0.0000203504` |
| 2 | 987 | `0.000048770399999999996` |
| 3 | 1,492 | `0.0001376088` |
| 4 | 1,559 | `0.0000312424` |
| 5 | 1,643 | `0.000028380800000000004` |
| 6 | 1,745 | `0.0000449008` |
| 7 | 1,873 | `0.0000666008` |
| 8 | 2,009 | `0.0000507976` |

**Fact:** all eight Provider reservations have matching known-usage commits; their exact sums match the terminal totals. No pending reservation remained. Journal ordering is:

```text
local_budget_stop_recorded
→ local_budget_stop_consumed
→ attempt_settled
→ verifier_completed
→ run_terminal
```

The stop diagnostic records request ordinal 9, `provider_requests_before: 8`, `provider_requests_requested_after: 9`, and `pending_before: false` / `pending_after: false`. This is the corrected typed local pre-dispatch cap stop and not a Provider response.

**Fact:** there was one initial Attempt only:

- Session: `v1b-session-be03c594-6a20-430f-9f1c-78c72a2bb3ba`
- Attempt: `v1c-canary-run-01-parse-duration-r1-a-a1`
- Workspace: `v1c-canary-run-01-parse-duration-r1-a-workspace`
- Workspace tree: SHA-256 `93b497551ff7fc760d550127a94027cbcb47e51a0f9167190553273d2f4fc6b0`, 3 files, 597 bytes

No child Attempt, same-Run retry, fallback, replacement, second Run, or recovery was present.

## Inspector and independent cross-check

Tracked Inspector command:

```text
node workbench/src/cli.ts v1b inspect --pilot-root .runs/v1-c/canary/pilot --run v1c-canary-run-01-parse-duration-r1-a
```

Result: exit 0; `integrity_valid: true`, `errors: []`, `terminal_valid: true`, `comparable: true`, terminal failure class `task_pass`, Verifier `passed`, and exact budget/counter values matching the terminal evidence.

Independent evidence command:

```text
node .runs/v1-c/canary/independent-cross-check.mjs > .runs/v1-c/canary/independent-cross-check.stdout.json
```

Result: exit 0. It confirmed Manifest equality and identity, Ledger states `planned → started → terminal`, 24 ordered Journal events, 8 reservations/commits, the local-stop/settled/Verifier/terminal sequence, exact budget and real-call counters, one settled Attempt, no child/recovery, RunResult/terminal/Verifier agreement, Inspector validity/comparability, and the size and SHA-256 of all 11 referenced artifacts.

During creation of this audit-local helper, three earlier executions of the same helper command exited 1 solely because the new assertions used an abbreviated Journal event name, expected `terminal` instead of the recorded `required_terminal` RunResult disposition, and addressed the Inspector's terminal evidence at the wrong nesting level. The helper was corrected without changing product artifacts; its final execution passed. Two earlier executions of the evidence scanner similarly exited 1 on detector false positives before its patterns were narrowed. None of these local read-only helper iterations accessed the Credential or network or made a real call.

## Protected paths, secret scan, and Source Delta

**Fact:** the product terminal scan reports `{ passed: true, match_count: 0, reasoning_payloads: 0 }`. The final evidence-wide scan command is:

```text
node .runs/v1-c/canary/scan-evidence.mjs > .runs/v1-c/canary/scan-evidence.stdout.json
```

It exits 0 and reports 26 files scanned with zero files matching Credential-shaped, bearer-token, authorization-value, reasoning-payload, fake-sensitive-marker, or private-key patterns. The scanner emits paths/pattern classes only and never matched content.

**Fact:** protected workspace hashes remained exact:

- `workspace/package.json`: `7852a78b1be7f60e901da63681809950e0fa579aa52517b811a1f6baeea25013`
- `workspace/test/public.test.mjs`: `7d97d524d60aa297fdc5660b4f881f00aee76f8c2a2191919e395517e8d0ce77`

**Fact — Source Delta:** execution left source, tests, fixtures, Manifest, Contract/Charter/09/ADR, Pi, references, and `CURRENT_STATE.md` unchanged. The tracked Manifest's worktree object and HEAD blob both remain `23451353652483c8c4fd432bf25cd3857e941d33`. Both Pi checkouts remain pinned and clean. The only tracked change produced by this Session is this permitted report. Ignored changes are the two permitted junctions and `.runs/v1-c/canary/` evidence. Nothing was staged or committed.

## Evidence paths

Evidence root: `.runs/v1-c/canary/`.

- Index: `.runs/v1-c/canary/EVIDENCE_INDEX.md`
- Sanitized real-command streams: `.runs/v1-c/canary/run-next.stdout.txt`, `.runs/v1-c/canary/run-next.stderr.txt`
- Inspector streams: `.runs/v1-c/canary/inspect.stdout.json`, `.runs/v1-c/canary/inspect.stderr.txt`
- Pilot Manifest and Ledger: `.runs/v1-c/canary/pilot/manifest.json`, `.runs/v1-c/canary/pilot/ledger.jsonl`
- Run root: `.runs/v1-c/canary/pilot/runs/v1c-canary-run-01-parse-duration-r1-a/`
- Journal: `journal.jsonl`
- Frozen config: `config/cell.json`, `config/manifest-ref.json`, `config/instruction.md`, `config/verifier.mjs`
- Outcome: `run-result.json`
- Terminal evidence: `terminal.json`, `terminal-evidence.json`
- Verifier: `attempts/01-v1c-canary-run-01-parse-duration-r1-a-a1/verifier-result.json`, `verifier-output.txt`
- Product secret scan: `secret-scan.json`
- Final Workspace: `workspace/`
- Independent cross-check: `.runs/v1-c/canary/independent-cross-check.mjs`, `.runs/v1-c/canary/independent-cross-check.stdout.json`
- Evidence-wide protected scan: `.runs/v1-c/canary/scan-evidence.mjs`, `.runs/v1-c/canary/scan-evidence.stdout.json`

## Remaining unverified claims and Main-owned decisions

- **Unconfirmed:** Main has not yet reviewed or accepted this Canary evidence.
- **Unconfirmed:** the conditional USD 1.90 full-Pilot pre-authorization has not been activated; this Session does not determine whether it may activate.
- **Unconfirmed:** no full-Pilot comparison, arm-level result, statistical/descriptive conclusion, or V1-C Goal completion claim exists yet.
- **Unconfirmed:** the exact cost has not been reconciled against an external Provider billing console; it is the exact tracked cost derived from the returned known usage fields and frozen prices.
- **Unconfirmed:** behavior outside this one task/Arm/Run and outside the frozen Provider checkpoint is not tested by this Canary.

**Recommendation:** Main should review the cited raw evidence, the Inspector output, the independent cross-check, the final Source Delta, and the Contract Pause Conditions. Only Main should decide whether this is a valid Canary and whether the user's conditional full-Pilot authorization activates.

## CURRENT_STATE_UPDATE_PROPOSAL

This is a proposal only; this Session did not edit `CURRENT_STATE.md`.

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_goal: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
  execution_session_disposition: CANARY_EXECUTION_EVIDENCE_COMPLETE_PENDING_MAIN_REVIEW
  canary:
    manifest_id: c26e75989623ae1218be0a3996c59de2ccbce946988396695b38bb9fdc482c4c
    cell_id: v1c-canary-cell-01
    run_id: v1c-canary-run-01-parse-duration-r1-a
    outcome: task_pass
    verifier_status: passed
    terminal_valid: true
    integrity_valid: true
    comparable: true
    inspector_errors: []
    provider_requests: 8
    network_calls: 8
    provider_calls: 8
    model_calls: 8
    credential_reads: 1
    tool_calls: 10
    tokens: 12147
    active_execution_time_ms: 17083
    verifier_runs: 1
    child_attempts: 0
    cost_usd: 0.00042865199999999996
    typed_local_stop:
      reason: provider_request_cap
      request_ordinal: 9
      rejected_before_dispatch: true
      recorded: true
      consumed: true
      attempt_settled_before_verifier: true
      pending_reservation: false
    secret_scan:
      passed: true
      match_count: 0
      reasoning_payloads: 0
    retry_same_run: false
    fallback: false
    replacement: false
    second_run_started: false
  source_delta:
    tracked_product_changes: 0
    tracked_report_only: docs/reports/V1_C_CANARY_EXECUTION_REPORT.md
    current_state_edited: false
    staged: false
    committed: false
  main_review_required: true
  full_pilot_authority_activated: false
  execution_session_stop: true
```
