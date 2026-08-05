# V1-C Full Pilot Execution Report

## Executive result

**Fact - Session disposition:**
`PAUSE_V1_C_FULL_PILOT_SOURCE_DIGEST_AUTHORITY_CONFLICT_AFTER_CELL_04`.

Main and the user authorized the mechanical correction from
`--import .runs/v1-c/full-pilot/opaque-credential-preload.mjs` to
`--import ./.runs/v1-c/full-pilot/opaque-credential-preload.mjs`. All six immediate re-entry checks
passed without reading the Credential file. The corrected product surface initialized the Pilot and
completed cells 01 through 04 in frozen Manifest order.

Before cell 05, the Session detected an authority/evidence conflict:

```text
Continuation Start Prompt workbench_source_digest:
  4d12e4588917949ee84bf56c83ec67f7cb8093a304c8a3ab9980c97188174604
Tracked Manifest, Pilot Manifest and all four Run evidence records:
  4d12e4588917949ee84bb56c83ec67f7cb8093a304c8a3ab9980c97188174604
```

The root HEAD/tree, tracked source and both Pi targets remained unchanged. The conflict therefore is
not observed post-launch source drift; it is a mismatch between the separately frozen prompt value and
the baseline-derived tracked evidence identity. It falls under the Contract's evidence-conflict Pause
Condition. The Session did not launch cell 05 or reinterpret the mismatch as another mechanical launch
correction.

## Re-entry and frozen-boundary checks

The following checks exited 0 before the corrected launch:

- helper SHA-256 remained exactly
  `2d83b0e1e3eafecb774a3e6faf4f6ac1ec29984ee256dc750a06805e3f577438`;
- `.runs/v1-c/full-pilot/pilot` was absent;
- all 24 planned Run IDs were unique and unused;
- the parent process had no inherited `DEEPSEEK_API_KEY`;
- tracked delta was limited to the already authorized reports and the Git index was empty;
- primary and registered Run Pi targets were clean at
  `027a5847901b5dde30270abaa1041046cd2b4b55`.

The deterministic Gate A suite was not repeated, as directed. Root identity remained:

```text
HEAD    a751e57e6fd22ef278eb0ddcd01aa52932fd19d7
tree    58409e16af6e2fdac322ac3d7508997e3b480167
parent  e1dc93ffd65edca04d47d493b24fda833151e685
```

## Per-cell execution evidence

Every `run-next` process used the corrected helper specifier and selected exactly the next Manifest
cell. A tracked `v1b inspect` followed each process before the next cell began.

| Cell | Arm | Final result | Attempts | Child | Requests | Tools | Tokens | Active ms | Cost USD |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 01 `parse-duration-r1-a` | A | pass | 1 | 0 | 8 | 10 | 12,747 | 17,387 | 0.0004718056 |
| 02 `parse-duration-r1-b` | B | pass | 1 | 0 | 8 | 9 | 13,492 | 18,273 | 0.00057750560000000006 |
| 03 `parse-duration-r1-c` | C | initial fail, eligible Recovery, final pass | 2 | 1 | 16 | 17 | 54,263 | 84,100 | 0.0024027136 |
| 04 `bounded-index-r1-a` | A | pass | 1 | 0 | 8 | 10 | 10,911 | 11,703 | 0.00035914480000000004 |

**Fact:** All four Runs are terminal, integrity-valid, comparable and `task_pass`. All Attempts are
settled. Each Run preserved protected paths, passed the secret scan and has known usage and cost.

**Fact:** Cell 03's initial Verifier failed. It was a C initial Attempt, Recovery was eligible and budget
was available, exactly one child Attempt started, and the common final Verifier passed. No A or B Run
received runtime treatment.

## Exact accounting at pause

| Counter | Observed |
| --- | ---: |
| Corrected `run-next` processes | 4 |
| Credential-file reads | 4 |
| Network calls | 40 |
| Provider calls | 40 |
| Model calls | 40 |
| Tool calls | 46 |
| Tokens | 91,413 |
| Active execution time | 131,463 ms |
| Verifier Runs | 5 |
| Initial cells | 4 |
| Child Attempts | 1 |
| Invalid Runs | 0 |
| Full-Pilot cost | USD 0.0038111696 |

The accepted Canary remains separate at USD `0.00042865199999999996`. The observed whole V1-C real
sequence cost is USD `0.0042398216`, below the USD 2.00 hard cap. No pending reservation or unknown
usage/cost was observed.

## Inspector, lineage and aggregate checks

The tracked Inspector exited 0 for every created Run. For each Run it cross-checked the Pilot Manifest,
Ledger/Journal, Run/Attempt, Session/Workspace, Verifier, Outcome, protected-path and secret-scan
evidence. All four terminal chains were valid.

The tracked aggregate command was invoked read-only after the pause and exited 1 with
`A/B delta is not exactly the frozen Skill treatment in block 1`. Block 1 is complete (cells 01-03), so
this is an independent fairness/control rejection, not an artifact of the incomplete second block.

A sanitized field-path comparison reproduced the aggregate normalization and found one remaining A/B
difference after the context user text and payload digest were normalized:

```text
$.provider_payload.messages[1].content[0].text
```

The tracked `normalizedExactDispatch()` normalizes the treatment text in `context.messages` but leaves
the corresponding frozen treatment text in `provider_payload.messages`. Therefore the aggregate rejects
the completed A/B pair. This is a tracked aggregate-path defect/evidence conflict; source repair is not
authorized and no aggregate or Policy result was accepted.

## Gate A self-audit correction

**Fact:** The earlier Gate A reconstruction check established equality between the reconstructed and
tracked Manifest but did not compare their source digest byte-for-byte against the separately supplied
Start Prompt constant. The Session incorrectly reported that the prompt digest matched. The per-Run
digest assertion after cell 04 exposed this omission.

**Recommendation:** Main must decide whether the Start Prompt digest was a governance typo or whether
the tracked baseline/Manifest is outside the intended authority. Main must also disposition the
independent aggregate fairness-control rejection. Fixing `normalizedExactDispatch()` would be source
repair and is outside this Session. No additional product process is authorized until both issues are
resolved explicitly.

## Delta and remaining unverified

Product source/protected delta is zero. Tracked changes remain limited to the four authorized reports;
the Git index is empty. The helper bytes are unchanged. Pi and root identities remain frozen.

Unverified work includes cells 05-24, a functioning fixed 24-cell aggregate, the remaining fairness
blocks, further Recovery observations and any comparative promotion decision.
