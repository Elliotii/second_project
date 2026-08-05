# V1-C R2 Pilot Execution Report

Date: 2026-08-06 (Asia/Hong_Kong)
Goal: `V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION`
Session role: fresh, dedicated, no-source-edit corrected full-Pilot R2 Execution Session

## Outcome

**Fact:** Execution stopped before cell 05 at the first material Pause Condition. Four initial Runs were started; all four are terminal, integrity-valid, comparable, and secret-clean. No retry, fallback, replacement, or later cell was launched.

**Fact:** The cell-04 launcher was invoked with the frozen command, but the outer command runner returned exit `124` after approximately five seconds. By the time read-only reconciliation ran, the child product process had completed cell 04 with one settled Attempt, eight Provider requests, a passing Verifier, and terminal evidence. Because helper loading, Credential resolution, Pilot mutation, and real Provider use had already occurred, this cannot be classified as a permitted zero-side-effect mechanical error. The exact product-process exit code was not recoverable.

**Recommendation:** Main should preserve this Pilot root without retrying cell 04. Any continuation or replacement requires a new explicit decision; this Session has no authority to make one.

## Frozen identity

| Item | Observed value | Result |
|---|---|---|
| HEAD | `c37ef6e6676cba245c0929dcdf98401f004fab54` | exact |
| tree | `a1d01cb6345a3534493874a67bbed30711b34c44` | exact |
| parent | `9f57be00f9d84279db01a6a2e17db80e9eae571d` | exact |
| Manifest | `fixtures/manifests/v1/v1c-full-pilot-execution-r2.json` | exact reconstruction |
| Manifest ID | `c1587d04277a327bf0bd54bcf5abf6194663513f7c5960d3425bcbd322e78e14` | exact |
| source digest | `2de1b76f7b9304ebe6d75e04ba3fa172f1d433cc219ad63ff10e6d6ff08c7ad3` | exact |
| Pi commit, both registered checkouts | `027a5847901b5dde30270abaa1041046cd2b4b55` | pinned and clean |
| helper SHA-256 | `2d83b0e1e3eafecb774a3e6faf4f6ac1ec29984ee256dc750a06805e3f577438` | exact before and after execution |
| Pilot root | `.runs/v1-c/full-pilot-r2/pilot` | fresh before execution |

## Gate A

**Fact:** Gate A passed before Credential resolution:

- HEAD, tree, parent, empty tracked/staged status, and absent Pilot root matched the Contract.
- The Manifest reconstructed byte-for-byte, contained 24 unique cells and Runs in frozen order, and bound the exact Candidate/source/Pi/budgets.
- Both Pi checkouts were pinned and clean after their applicable `AGENTS.md` files were read. Only command-local `safe.directory` was used.
- Validated local junctions were created without installation or download for `workbench/node_modules` and `.runs/v0-a/pi`.
- The accepted helper was copied byte-for-byte without displaying or editing it; its SHA-256 matched.
- The parent process had no inherited `DEEPSEEK_API_KEY`.
- Strict TypeScript passed.
- The focused V1-B/V1-C pair passed 40/40 tests.
- Tracked zero-call preflight returned `ready`, selected cell 01, and reported all real-call counters as zero.
- Preflight left the Pilot root absent.

## Executed Runs

| Cell | Arm | Run | Launcher exit | Initial | Final | Attempts | Comparable | Provider | Tools | Tokens | Active ms | Verifiers | Child | Cost USD |
|---:|:---:|---|---:|:---:|:---:|---:|:---:|---:|---:|---:|---:|---:|---:|---:|
| 01 | A | `v1c-full-pilot-run-01-parse-duration-r1-a` | 0 | passed | passed | 1 | yes | 8 | 10 | 12,223 | 13,892 | 1 | 0 | 0.0003565240 |
| 02 | B | `v1c-full-pilot-run-02-parse-duration-r1-b` | 0 | passed | passed | 1 | yes | 8 | 10 | 12,405 | 10,483 | 1 | 0 | 0.0003847872 |
| 03 | C | `v1c-full-pilot-run-03-parse-duration-r1-c` | 0 | failed | failed | 2 | yes | 16 | 18 | 60,956 | 88,527 | 2 | 1 | 0.0026890416 |
| 04 | A | `v1c-full-pilot-run-04-bounded-index-r1-a` | 124 outer / product unknown | passed | passed | 1 | yes | 8 | 10 | 10,509 | 10,211 | 1 | 0 | 0.0003057264 |

Each tracked Inspector call returned exit `0`. For every Run, Inspector reported `integrity_valid=true`, `terminal_valid=true`, `comparable=true`, no errors, one `planned -> started -> terminal` Ledger chain, matching settled Attempt and Verifier counts, unchanged protected paths, and a passing secret scan with zero matches and zero reasoning payloads.

Cell 03 was Recovery-eligible, Recovery-started, and Recovery-unsuccessful. Both Attempts settled. Its task failure is valid comparison evidence and was not itself a Pause Condition.

## Pause evidence

**Fact:** The outer command runner for cell 04 reported:

```text
Exit code: 124
command timed out after 5034 milliseconds
```
**Fact:** Subsequent tracked inspection showed cell 04 terminal and passed with eight Provider/model/network calls and one Credential read. Its product evidence records 10,211 ms active execution time, so the product process continued beyond the outer runner's reported timeout window. A process inventory after reconciliation found zero matching live `v1b run-next` processes.

**Inference:** The outer runner ended its wait/ownership before the child Node process terminalized. The immutable terminal evidence reconciles the Run's usage and outcome, but it cannot reconstruct the lost product-process exit code.

**Fact:** This meets the Contract's Pause boundary because execution-side effects occurred and the required exact per-process exit code is unknown. No cell 05 or later cell was launched.

## Scope and integrity after pause

- HEAD and tree remain exact.
- Tracked/staged status was empty immediately after the pause reconciliation.
- The helper digest remains exact.
- The parent process still has no inherited Credential variable.
- No Credential value was printed, hashed, measured, normalized, edited, or persisted by this Session.
- No source, test, fixture, Manifest, task, Skill, Prompt, Verifier, Tool Profile, Provider/model, budget, control-state, or historical evidence file was edited.
- No staging or commit occurred.

## What remains unverified

- Cells 05-24 were not started.
- Blocks 2-8 are incomplete; only block 1 has a complete fairness result.
- A final 24-cell aggregate and a completed fixed-protocol descriptive comparison do not exist.
- The product-process exit code for cell 04 is unrecoverable from current evidence.

## CURRENT_STATE_UPDATE_PROPOSAL

```yaml
active_goal: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
status: PAUSED_R2_EXECUTION_AFTER_CELL_04
facts:
  execution_baseline_commit: c37ef6e6676cba245c0929dcdf98401f004fab54
  manifest_id: c1587d04277a327bf0bd54bcf5abf6194663513f7c5960d3425bcbd322e78e14
  pilot_root: .runs/v1-c/full-pilot-r2/pilot
  started_runs: 4
  terminal_runs: 4
  comparable_runs: 4
  invalid_runs: 0
  passed_runs: 3
  failed_runs: 1
  pause_condition: cell_04_outer_launcher_exit_124_after_real_side_effects_product_exit_unknown
  later_cells_started: false
  tracked_source_changed: false
decision_required:
  - Main must decide whether this preserved partial Pilot is closed as diagnostic evidence or whether a separately authorized continuation/replacement is warranted.
prohibited_without_new_authority:
  - retrying cell 04
  - launching cell 05 or later
  - editing source or control state
  - entering V2
```
