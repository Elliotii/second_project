# Post-V3.5 Product Smoke Test Report

```yaml
status: ACCEPTED_OBJECTIVE_EVIDENCE
date: 2026-08-10
session_role: no_source_edit_real_execution_owner
objective_result: PASS_POST_V3_5_REAL_CROSS_PROCESS_PRODUCT_SMOKE
execution_baseline: 0c6032409c08f0eebcfacf69dafe341e1219fdf7
execution_baseline_parent: 2f4e18405c89dbd0e10de4fd1d3ab48e8e7052b7
pinned_pi: 027a5847901b5dde30270abaa1041046cd2b4b55
authority_digest: 071d1f74e157ff05657ccf56f9cd3cd403bac1af9d21f748e1dff007a7c56984
tracked_source_delta: none
real_journeys: 1
real_turns: 2
retry: 0
fallback: 0
replacement: 0
credential_reads: 2
network_calls: 11
external_provider_calls: 11
real_model_calls: 11
provider_profile: deepseek-v4-flash
```

## 1. Result

**Fact.** The one authorized journey passed its bounded product-smoke objective. One
host-launched loopback Workbench created one persistent Pi Session, completed two distinct
settled real Runs through the HTTP product surface, stopped the first direct server PID,
reopened the same Session in a fresh direct server process, and completed the context-
dependent second Turn. Both frozen external Verifiers and both Outcomes passed. The final
public suite passed 4/4.

**Fact.** No tracked source, test, fixture, control-state, accepted report, Charter,
Closeout, `CURRENT_STATE.md`, or Pi file was changed by the execution Session. At its
handoff, the Draft report was the only tracked worktree addition; nothing was staged or
committed there.

**Fact.** Main's first execution handoff supplied the incorrect long SHA
`0c603242d468d594c62478c1b77665658199c88a`. Gate A stopped before Credential, network,
Provider or model access. Main then corrected that mechanical prompt typo to the exact
repository value `0c6032409c08f0eebcfacf69dafe341e1219fdf7`; the journey proceeded only after exact
equality was re-established. The host Manifest records both values and that the correction
preceded real access.

## 2. Gate A and frozen authority

**Fact.** Initial and final repository/Pi checks were:

- Workbench HEAD: `0c6032409c08f0eebcfacf69dafe341e1219fdf7`;
- HEAD subject: `docs: freeze post-v3.5 smoke execution baseline`;
- HEAD parent: `2f4e18405c89dbd0e10de4fd1d3ab48e8e7052b7`;
- initial tracked status: clean;
- pinned emitted Pi root: `D:\AI\AI_Projects\project2\.runs\g006\pi`;
- Pi HEAD: `027a5847901b5dde30270abaa1041046cd2b4b55`;
- Pi status: clean;
- Node: `v24.14.1`; npm: `11.11.0`;
- strict TypeScript: exit 0;
- complete post-V3.5 enablement suite: exit 0, 10/10;
- final `git diff --check`: exit 0.

The emitted Pi checkout supplied the pinned public loader artifacts. `.upstream/pi` is not
present in this isolated execution worktree and was neither required nor modified.

**Fact.** The ignored host Manifest and authority froze:

- project/session/workspace: `post-v35-product-smoke` /
  `post-v35-smoke-session` / `parse-retry-after-workspace`;
- ordered Runs: `post-v35-smoke-turn-1`, `post-v35-smoke-turn-2`;
- loopback port: `43135`;
- Provider/model: `deepseek-v4-flash`;
- initial Workspace digest:
  `def8af5459c70435a412350ebc585ab1e50a8aa3d0b1732b6fcdc7e43eeda241`;
- host Manifest digest:
  `2650c40b3f3820b50583d66709a2a1c8e48401886aea1cc3f9dc91c260e2528c`;
- Turn prompt digests:
  `242a2e5ded28b3624f94fb130672071a3cc202c9536d07bb97737938069d0d81`
  and `d815b49c50afb0095b1b4c12a5163f48a2af3a91c45c42ef04798ab395cbd6ef`;
- frozen Verifier source digests:
  `f96787f4a81b2d6969d07bd240aed3ff6755660923c9c4e9ead7e6f78ca467db`
  and `48a5fb28044ad984e73d498ee5680d73d17cd95033617d52145fae90d4ed7859`;
- writable paths only `src/**` and `test/**`; protected `package.json`;
- only logical command `public_test`, resolved to current Node `--test` in the Workspace;
- binding status `not_applicable`.

Per Turn the frozen ceiling was 16 Provider requests, 24 Tool calls, 131072 combined
tokens, USD 0.20 and 900000 ms. Whole journey ceilings were 32/48/262144/USD 0.40/
1800000 ms, with at most two Credential reads. Retry, fallback and replacement were zero.

**Fact.** Credential preflight examined only exact path metadata for
`D:\AI\AI_Projects\project2\.env.g005`: it existed as an ordinary non-link file. No
content was read at startup. The Browser/HTTP request bodies contained no Credential path,
Provider selector, model selector, roots, command descriptors or Verifier configuration.

## 3. Journey and process evidence

| Phase | Objective evidence | Result |
| --- | --- | --- |
| A | Exact HEAD/Pi/status, strict TS, 10/10 enablement tests, launcher/API/authority/read-model checks | PASS |
| B | Install-free ESM Workspace, prompts, Verifiers, marker, IDs, tree and budgets frozen before dispatch | PASS |
| C | Turn 1 settled; Verifier and Outcome passed; marker absent from Workspace; public tests 3/3 | PASS |
| D | Direct PID 22328 stopped; subsequent PID absent and listener count 0 | PASS |
| E | Fresh PID 16604 reopened the same data/Workspace/authority and showed the same Session with Run 1 | PASS |
| F | Turn 2 settled; authenticated prior chain observed; exact marker exported; public tests 4/4 | PASS |
| G | Two safe Runs visible through API/UI; budgets passed; PID 16604 absent and listener count 0 | PASS |

### Server 1 and Turn 1

**Fact.** The successful direct host process was Node PID `22328`, started at
`2026-08-10T06:21:09.999Z`. Its startup event bound `127.0.0.1:43135`, mode
`real_product_smoke`, and the exact authority digest above. Turn 1 HTTP dispatch ran from
`2026-08-10T06:27:05.743Z` to `2026-08-10T06:27:23.589Z` and returned HTTP 201.

The first stop check at `2026-08-10T06:28:21.2955394Z` already proved listener count 0,
although the Windows process object was still briefly visible. The independent follow-up at
`2026-08-10T06:28:30.4372821Z` proved both PID absent and listener count 0. The launcher
command cell then closed with exit 0.

### Server 2 and Turn 2

**Fact.** A new direct Node PID `16604` started at `2026-08-10T06:28:46.284Z` over the
same data root, Workspace, authority and loopback port. Before dispatch, HTTP and the UI
showed the same Session and exactly one prior Run. Turn 2 ran from
`2026-08-10T06:29:33.638Z` to `2026-08-10T06:29:41.368Z` and returned HTTP 201.

At `2026-08-10T06:31:02.9565917Z`, PID `16604` was absent and listener count was 0. The
second launcher command cell closed with exit 0. A final independent check again reported
listener count 0.

## 4. Run, Verifier and Outcome identities

| Field | Turn 1 | Turn 2 |
| --- | --- | --- |
| Run ID | `post-v35-smoke-turn-1` | `post-v35-smoke-turn-2` |
| schema / settled | 2 / true | 2 / true |
| prior Run | null | `post-v35-smoke-turn-1` |
| catalog Manifest SHA-256 | `9b75180ff729565a4edcf6504c735f1864ddceaf63abee8c717640160cebd039` | `8954663afa23a2d1bb032a24d9dca8f57ffab47ac11d6251b3338ba1792ccbb4` |
| Verifier ID | `post-v35-smoke-turn-1-verifier` | `post-v35-smoke-turn-2-verifier` |
| Verifier result SHA-256 | `6d2d31fcf6afff05d30671bd8432cc1a1898d1bd0da29d8bee8b14a6f0ab11ad` | `5118b15c0b55bcbaec0d45062f30e1c1832451e2830c3c4d589099e3a89ca116` |
| Verifier exit/status | 0 / passed | 0 / passed |
| Outcome SHA-256 | `30284efd4382af639325fec3d6792a151b256350cc47f2e65166fa2f37a30ba6` | `a03ab587b7f2a1a70729cdd084994d315c5f7bebab193817ea188a61da6bd75e` |
| Outcome | passed | passed |
| binding | not_applicable | not_applicable |

Both catalog entries reference the same Session JSONL and carry the same authenticated
catalog Session identity digest
`362af20ab2319e6c6767d04a622768fd769cb17d837b5f0d81c26345a7243844`.
Catalog order is exactly Turn 1 then Turn 2. Both Manifest result/outcome byte identities
were accepted by the single safe inspection path.

## 5. Cross-process Session-prefix proof

**Fact.** Immediately after Turn 1, its persisted Pi Session prefix was:

- `session_entry_count_after_turn`: 17;
- `session_entries_sha256_after_turn`:
  `0f827823ccb02f50dafd31b62d32be622c38088f5f7fb0652a1ea416605e6944`.

After fresh-process reopen, authenticated history validation required the current JSONL's
first 17 entries to hash to that exact value before Credential resolution or model
creation. Turn 2 could not have dispatched if this check failed. The reopened
`session.buildContext()` then produced 17 prior Provider messages with digest
`05c524fe754dfb27dfb9cb50a6dbdd3e6f785f55ee18843622447e9140bf3940`.
The first and every subsequent Turn 2 Provider request observed that exact same digest;
`provider_observed_prior_context_sha256` equals `prior_context_sha256` byte for byte.

**Inference.** This is an authenticated cross-representation equality chain:

```text
persisted JSONL first 17 entries
  -- exact count/digest validation --> reopened buildContext over that prefix
  -- 17-message digest equality --> Provider-observed prior prefix
```

The JSONL-entry SHA (`0f8278...`) and Provider-message SHA (`05c524...`) are deliberately
not numerically equal because they hash different serializations. The proof is the
fail-closed entry-prefix equality followed by exact derived-context/provider equality, not
an invalid comparison of hashes from two representation domains. This distinction is a
reporting limitation but not a break in the authenticated continuation chain.

Run 2 also records `context_reconstructed: true`, the exact prior Run reference, and a
strictly increased final Session prefix count of 27 with digest
`7658c4c64ac2c83d3e1f903ab242134059a7bc7005360ef85f24c2e1102777a1`.

## 6. Behavioral continuation and Tool lifecycle

**Fact.** The generated continuation marker was absent from the initial Workspace, absent
from the frozen Turn 2 prompt, and had zero Workspace hits after Turn 1. Turn 2 exported
the exact prior marker as the named `continuationMarker` export. The test file contains the
exact `Sun, 06 Nov 1994 08:49:37 GMT` edge case and proves a zero delay when `nowMs`
equals that date. `package.json` remained protected with its sole `node --test` script.

Turn 1 recorded nine Tool calls and nine exactly ordered matching Tool results. Turn 2
recorded five calls and five matching results. The safe UI showed only bounded Workspace
read/list/write/edit and `public_test` lifecycle projections. No extra command, Task,
Skill treatment, Goal 2.5 rerun or external side-effect tool appeared.

The first Turn's first `public_test` correctly exposed JavaScript's permissive
`Date.parse("-1")` behavior and exited 1; the Agent made one bounded source correction and
the next `public_test` passed 3/3. This was normal within-Turn Tool progression, not a
Provider retry. Turn 2's only `public_test` passed 4/4. The frozen retry/fallback/
replacement counters remained 0/0/0.

## 7. Real access and budgets

| Counter | Turn 1 | Turn 2 | Whole journey | Ceiling |
| --- | ---: | ---: | ---: | ---: |
| Credential reads | 1 | 1 | 2 | 2 |
| Provider/network/model calls | 7 | 4 | 11 | 16 per Turn / 32 whole |
| Tool calls | 9 | 5 | 14 | 24 per Turn / 48 whole |
| input tokens | 11,054 | 14,793 | 25,847 | — |
| output tokens | 1,199 | 542 | 1,741 | — |
| combined tokens | 12,253 | 15,335 | 27,588 | 131,072 per Turn / 262,144 whole |
| cost USD | 0.0006364064 | 0.0003261272 | 0.0009625336 | 0.20 per Turn / 0.40 whole |
| enforced Run wall time | 17,784 ms | 7,666 ms | 25,450 ms | 900,000 per Turn / 1,800,000 whole |

**Fact.** Credential content was read opaquely exactly once per real Turn/process. It was
never printed, echoed, hashed, persisted or sent to the Browser. Network, external
Provider and real-model counts are each exactly 11 and map one-to-one to Provider requests.
No unexpected Credential read or Provider/profile drift was observed.

## 8. Safe HTTP and WebUI observations

**Fact.** Before Session creation, `/api/v1/overview` reported the real-product-smoke
mode and `/api/v1/sessions` returned an empty safe list. The browser showed the same mode,
Session controls and host-authorized Turn control. After each Run, HTTP and the WebUI
showed Session/Run linkage, bounded user/assistant/Tool projections, real counters,
Verifier, Outcome and binding status.

The final safe API had exactly two Run IDs and 33 projected message/tool items. A recursive
field-name scan found no Credential, Authorization, API-key or reasoning field, and the
Credential path was absent. Browser observations likewise showed no Credential, raw
Provider payload, private reasoning object or host-only authority fields. Raw Pi JSONL
remains local under the ignored data root and is not a report/API artifact.

## 9. Exact verification commands and exits

Representative commands are shown with the Credential argument redacted:

| Command | Exit / result |
| --- | --- |
| `git rev-parse HEAD` and `git status --short` | 0; exact baseline; clean |
| emitted Pi `git rev-parse HEAD` / `git status --short` with command-local safe.directory | 0; exact pinned SHA; clean |
| `npm.cmd run v35g2:typecheck` (workbench) | 0 |
| `npm.cmd run postv35:enablement:test` (workbench) | 0; 10/10 |
| corrected safe preflight through the public Pi loader | 0; all frozen identities passed |
| `node .../product-http.mjs create` | 0; HTTP 201 |
| `node .../product-http.mjs turn-1` | 0; HTTP 201; settled/pass/pass |
| `npm.cmd test` after Turn 1 | 0; 3/3 |
| exact `Stop-Process -Id 22328` plus separate PID/listener check | 0; PID absent; listener 0 |
| second host launcher over the same roots/authority | 0 after stop; PID 16604 |
| reopened Session HTTP/UI inspection | 0; same Session, one prior Run |
| `node .../product-http.mjs turn-2` | 0; HTTP 201; settled/pass/pass |
| final `npm.cmd test` | 0; 4/4 |
| exact `Stop-Process -Id 16604` plus PID/listener check | 0; PID absent; listener 0 |
| final safe HTTP projection scan | 0; two Runs; no forbidden fields/path |
| final HEAD/status/Pi/listener check and `git diff --check` | 0; exact/clean/0/0 |

### Preserved nonzero and logical-failure evidence

All observed nonzero exits and setup failures are retained rather than hidden:

1. Before real access, the first safe-loader spelling used a Windows backslash module
   specifier and exited 1 with `ERR_INVALID_MODULE_SPECIFIER`; the corrected slash form
   passed.
2. Two pre-start compound PowerShell checks exited 1 only because an empty
   `Get-NetTCPConnection` query reported no listener; explicit count-based checks exited 0
   with count 0.
3. Two `Start-Process` orchestration attempts returned shell exit 0 but no PID because the
   host environment contained duplicate case variants of `Path`; neither reached the
   launcher or Credential.
4. The first ignored Node launcher helper used an over-deep relative Workbench path and
   exited 1 with `server PID unavailable`. A non-detached successor returned PID 23576 but
   that process ended with its parent and produced no server event.
5. The next launcher reached product code but the public launcher's parser rejected the
   explicit `--port 43135` because it had already initialized that exact default. The
   wrapper returned 0 while the child exited 1; stderr is preserved. Removing only the
   redundant host argument used the same frozen default port and started PID 22328.
6. The first browser tab became stale before navigation completed. No request was
   dispatched; a fresh tab in the same browser session opened the local UI successfully.
7. One read-only `rg` diagnostic exited 1 because it included a nonexistent optional test
   filename; the actual source/test matches were returned and no file changed.
8. One post-Turn marker-check compound command returned 0 but contained a relative-path
   `Get-ChildItem` error. It was not accepted as evidence; the corrected fail-on-error check
   returned 0 and proved zero marker hits.
9. Inside Turn 1, the first bounded `public_test` Tool result exited 1 (2 pass, 1 fail) on
   the negative numeric edge. The Agent corrected the implementation and the second Tool
   result exited 0 (3/3). This is preserved in the Session safe projection and Tool trace.

No item above consumed an extra real journey, Credential read, Provider retry, fallback or
replacement. Real access remained 0 until the single Turn 1 HTTP dispatch.

## 10. Evidence index

The ignored root is `.runs/post-v3-5-product-smoke/final-journey/` and contains:

- `authority/real-smoke-authority.json`, `host-manifest.json` and its digest;
- `orchestration/` freeze, preflight, host launcher and product HTTP helpers;
- `logs/server-1.*` and `logs/server-2.*` startup/warning/failure history;
- `evidence/http-create.json`, both Turn responses, final inspection and
  `execution-observations.json`;
- `data/catalog-v1.json`, the local Pi Session JSONL, two immutable Run Manifests,
  two Verifier source/result/output groups and two Outcomes;
- `verifiers/turn-1-verifier.mjs` and `turn-2-verifier.mjs`;
- the generated install-free `workspace/` with protected `package.json`, final source and
  public tests.

## 11. Source delta, findings and limitations

**Fact.** Tracked product source/test delta is none. The model changed only ignored
Workspace `src/parse-retry-after.mjs` in Turn 1 and Turn 2, and
`test/parse-retry-after.test.mjs` in Turn 2. The Session created no maintenance commit.

**Finding (ordinary startup usability).** Supplying the documented explicit
`--port 43135` currently fails because launcher argument parsing treats its preinitialized
default as a duplicate. This journey used the same frozen port through the launcher's
public default, before dispatch and without a product-source edit. Main may route this as a
separate ordinary maintenance issue; it did not invalidate the tested route.

**Limitation.** The safe evidence intentionally exposes two different digest domains for
Session JSONL entries and derived Provider messages. It proves the required continuation
through a fail-closed authenticated transformation chain, but does not offer one identical
SHA string spanning those two serializations.

**Limitation.** This is one small install-free Node task, one Provider profile, one Session
and two settled Turns. It does not prove in-flight crash recovery, exactly-once external
Tool effects, broad model/task generality, remote security, database durability, automatic
catalog rebuild, Skill advantage, V3.6/V4 readiness or any reopened V3.5 claim.

**Execution-session recommendation.** Main should review the execution draft and ignored evidence
and decide whether to record the explicit-port parser issue as ordinary maintenance.
The journey must not be rerun and no further Credential/network/Provider/model authority
should be consumed.

## 12. Main review and final maintenance disposition

**Fact.** Main independently inspected both schema-v2 Run Manifests, both Outcomes, the
catalog/evidence identities, the execution Draft, and the final PID/listener state. The
two server PIDs were absent and listener count on 127.0.0.1:43135 was zero. The observed
usage remained within every frozen per-Turn and whole-journey ceiling.

**Fact.** The ordinary explicit-port parser issue was fixed after the real journey in
commit 0fa4d79a56df01b00f1a674f3b915d2886b6f7a0. The fix separates duplicate-argument
detection from the default port and adds a zero-call subprocess regression proving that
explicit port 0 starts successfully without Credential resolution while a genuinely
duplicated port is rejected. The real journey was not rerun.

Main re-ran strict TypeScript, the complete 11-test enablement suite, and the six Goal 3
focused regressions after integrating that maintenance commit; all passed. Pi remained
at the pinned commit and clean.

Final disposition:

    ACCEPT_POST_V3_5_REAL_CROSS_PROCESS_PRODUCT_SMOKE

This disposition proves one natural two-Turn real product journey, cross-process settled
Session continuation, authenticated Run/Verifier/Outcome evidence, bounded resource
accounting and safe local inspectability. It does not reopen V3.5, authorize V3.6/V4,
establish production security, or substitute objective evidence for separate user UX and
comprehension feedback.
