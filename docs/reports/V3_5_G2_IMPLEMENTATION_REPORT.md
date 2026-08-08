# V3.5 Goal 2 Implementation and Frozen Real-Pair Report

```yaml
goal_id: V3_5_G2_REAL_ADAPTIVE_SKILL_CLOSURE
phase: frozen_real_pair_terminal_review
status: PAUSE_V3_5_G2_REAL_PAIR_INVALID_BASE_REQUEST_BUDGET
control_baseline_commit: b44197e3a5465058c4cb327613d775943f5f8444
initial_implementation_commit: ce58cdb35948c7f100773f3fb94762d23d7eccd5
execution_baseline_commit: ed2dc14e695233411f96af162d92b405188b04cf
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
goal_2_accepted: false
real_pair_root: .runs/v3-5-g2/real-pair-20260808-01
real_pair_status: invalid_pair
real_pair_authority_consumed: true
goal_3_authorized: false
v3_5_final_acceptance_authorized: false
```

Main returned one bounded pre-dispatch correction against implementation commit `ce58cdb35948c7f100773f3fb94762d23d7eccd5`. The correction commit SHA is returned to Main after it is created; a tracked report cannot contain its own SHA because its bytes participate in that SHA.

## Gate A

`Fact`: `git rev-parse HEAD` returned the exact Control Baseline `b44197e3a5465058c4cb327613d775943f5f8444`; the initial tracked status was clean.

`Fact`: the formal Contract status was `accepted_activated_implementation_not_started` and named `V3_5_G2_REAL_ADAPTIVE_SKILL_CLOSURE` as active.

`Fact`: under Main's clarified Gate A path rule, the read-only pinned checkout at `D:/AI/AI_Projects/project2/.upstream/pi` returned exact HEAD `027a5847901b5dde30270abaa1041046cd2b4b55` and clean status. No Pi file, package, link or generated output was changed.

`Fact`: `AGENTS.md`, `CURRENT_STATE.md`, the V3.5 Charter, authority rules, formal Goal 2 Contract, Goal 1 reports, V3 Closeout, relevant V3 reports, current Session/Read Model sources, V3 State/binding/Skill/runtime sources, Direct Pi, Verifier, artifact/hash/workspace sources and applicable pinned-Pi instructions/source were inspected before implementation.

## Implemented boundary

`Fact`: the implementation adds the exact held-out fixture, hidden external Verifier and calibration-only reference under `fixtures/v3-5/goal2/v35-stable-unique/`.

`Fact`: `materializeGoal2StateSelectionV35` and `inspectGoal2StateSelectionV35` create and validate a Goal-owned derived selection authority over exact historical State version 2 and Skill `adaptive-inefficient-success`. The accepted V3 State root and active pointer remain untouched. Pi's public Skill wrapper embeds the absolute Skill location, so the derived authority deliberately selects the read-only historical source rather than relocating the Skill and changing frozen wrapper SHA `329cca...`.

`Fact`: `freezeGoal2RunBindingV35` gives Base and Candidate the same selected State identity, Case context, base System Prompt and refinement lineage. Base binds no entry; Candidate binds only the exact accepted adaptive Skill and public Pi wrapper.

`Fact`: `executeGoal2PairV35` enforces fixed Base then Candidate order, exact IDs, byte-identical fresh Workspaces, fresh public JSONL Sessions, immutable Run artifacts, one Verifier per completed arm, per-arm and pair budgets, protected-byte stability, source revalidation before Candidate, one-use Provider authority per arm, no retry/fallback/replacement and an invalid-pair pause artifact on failure.

`Fact`: the existing V3 Direct Pi adapter now accepts an optional public persistent Session and an optional narrower Tool surface. Existing callers retain their original in-memory Session and full V3 Tool defaults. Goal 2 exposes only `workspace_read`, `workspace_write` and `run_command`; reads and writes are restricted to `src/subject.ts`, repository commands are disabled, and only the frozen `public_test` descriptor is admitted.

`Fact`: `inspectGoal2PairV35` validates exact evidence keys, digests, paths, Session historical prefixes, Case/State/binding/runtime/Verifier lineage, treatment identity, usage and aggregate budgets. It permits later Session continuation while preserving the original Run prefix and final subject snapshot.

`Fact`: `readGoal2SkillComparisonV35` replaces the Goal 2 unavailable-only boundary with an allowlisted comparison projection containing identities, result, efficiency and bounded usage only. It does not expose raw Session payloads, tool arguments, reasoning, credentials, absolute paths, hidden Verifier bytes or reference bytes.

## Main-requested bounded payload-fairness correction

`Fact`: Main preflight identified that V3 `model_payload_sha256` could represent a later request and therefore did not independently prove the actual first Provider payload treatment boundary. Real access remained forbidden while this defect was corrected.

`Fact`: the public Direct Pi adapter now exposes one optional pre-dispatch payload-observation callback without changing the accepted V3 runtime artifact schema or semantics. Goal 2 owns a capture that records the first actual `before_provider_payload` value exactly once and ignores later payloads.

`Fact`: `first-provider-payload.json` persists no raw payload, message, reasoning or credential material. It contains only identities, counts and SHA-256 digests for the canonical payload, treatment-normalized payload/messages, system/developer messages, tools, model, remaining request fields and top-level keys.

`Fact`: capture fails before Provider transport if Base is not the exact task text or Candidate is not exact `formatSkillInvocation(historical Skill) + "\n\n" + task`. Only a string or one text content block is accepted; missing, wrong, repeated or appended treatment text fails closed.

`Fact`: `inspectGoal2PairV35` validates the bounded artifact and reference, recomputes its digest and Session lineage, reconstructs the exact Candidate text from the isolated selected Skill plus the frozen Base task, and requires canonical equality after replacing only the exact last-user treatment text with one common marker. `comparison.fairness_valid` now depends on that same normalized first-payload proof.

Correction file delta before reports:

- `workbench/src/contracts/v35g2-types.ts`;
- `workbench/src/pi/pi-adapter-v3.ts`;
- `workbench/src/run-v3.ts`;
- `workbench/src/v35g2/payload-fairness-v35g2.ts` (new);
- `workbench/src/v35g2/pair-v35g2.ts`;
- `workbench/src/v35g2/inspect-v35g2.ts`;
- `workbench/tests/v35g2-real-adaptive-skill.test.ts`.

Focused coverage now includes the actual public Direct Pi/Faux payload path, exact wrong/missing/extra Skill treatment rejection, missing/tampered evidence, non-treatment request-field drift, and stability of the first capture after a later payload.

## Changed files and principal symbols

- Frozen fixture/reference/Verifier: six files under `fixtures/v3-5/goal2/v35-stable-unique/`.
- Goal 2 contracts: `workbench/src/contracts/v35g2-types.ts`.
- Frozen Case/profile constants: `workbench/src/v35g2/case-v35g2.ts`.
- State selection/binding: `materializeGoal2StateSelectionV35`, `inspectGoal2StateSelectionV35`, `freezeGoal2RunBindingV35`.
- Pair preparation/execution: `prepareGoal2PairV35`, `executeGoal2PairV35`, `executeGoal2RealPairV35`.
- Persistent inspection and projection: `inspectGoal2PairV35`, `readGoal2SkillComparisonV35`.
- Calibration: `runGoal2ReferenceCalibrationV35` plus tracked calibration/preflight CLIs.
- Frozen real entry point: `workbench/scripts/v35g2-real-pair.ts`, guarded by explicit token `V3_5_G2_REAL_PAIR_ONCE` and clean implementation-commit identity.
- Shared narrow seams: optional persistent `executionSession`, optional `BoundedToolRestrictions`, and `V35_WORKSPACE` external-Verifier environment key.
- Verification: `workbench/tests/v35g2-real-adaptive-skill.test.ts`, `workbench/tsconfig.v35g2.json`, and the tracked public emitted-Pi loader.
- Package scripts: `v35g2:typecheck`, `v35g2:test`, `v35g2:calibrate`.
- Reports: this report and `V3_5_G2_CLOSEOUT_DRAFT.md`.

No governance file, accepted V0-V3 fixture/report/evidence, closed V3 State authority, credential, `.env`, pinned Pi file, private Pi import, Goal 3 file or WebUI file changed.

## Frozen identity recalculation

| Identity | Recalculated value |
|---|---|
| Workspace tree | `4a45c560541f561143fc17302576970c521febc4ae81f2f384be2708faa89922` |
| Instruction | `96b1bf32248b220af6fc44021e57c314dbb57d32d37ae45505ca2ac1c9954c62` |
| Hidden Verifier | `470e9a49f27ebf3a14bd8d104f4e0a4a0e62a018e649352e56bfc418fa2a2fef` |
| Calibration reference | `083640cc7a47940ba184f7f031379531602f7d9924a8a8c018a8b534cce2d8c4` |
| Tool profile | `f5bae96962e5f920df282b3255bdea49b847bd5b3570aaed923770d4d2227859` |
| Budget profile | `6b20b55e7930b193b7975c15668bba883961c9d3976e9d200b45cfd69d96be21` |
| Provider profile | `6b90b83a047ce7745fc92a6f1ef99dd7f7ea6e046a5107e060f4b041e864cf32` |
| Case Authority | `43c2b1c2967826e61b236d3546f693a93424a127e25a5da9f4a0180617848fff` |
| Historical State version 2 | `0f6c5d44c815a0d1b267d7fdf2e0c01f50eb640d06da72fe9ff8fab343249927` |
| Historical Skill source | `152d00670b47b598cd54e4ba74a8eea580b16869e108b9027ebd3aee96f740c3` |
| Historical Skill wrapper | `329cca959c9f293d6d8e2dd56a89df14e21e069fd517633e405eb9893b675928` |
| Derived State selection | `a708c5e42e739350b447510f0f5dd91a93cfb6216bd3e3296a3f7fd9e7d1913a` |
| Historical State authority tree | `0c6167f82595ef36d6e9cdabbce8eac09f18b341f48694fcacb84ff6b48f3ffa` |

Exact fixture inventory:

| Path | Bytes | SHA-256 |
|---|---:|---|
| `instruction.txt` | 220 | `96b1bf32248b220af6fc44021e57c314dbb57d32d37ae45505ca2ac1c9954c62` |
| `reference/subject.ts` | 90 | `083640cc7a47940ba184f7f031379531602f7d9924a8a8c018a8b534cce2d8c4` |
| `verifier/v35-stable-unique.mjs` | 964 | `470e9a49f27ebf3a14bd8d104f4e0a4a0e62a018e649352e56bfc418fa2a2fef` |
| `workspace/package.json` | 87 | `7852a78b1be7f60e901da63681809950e0fa579aa52517b811a1f6baeea25013` |
| `workspace/src/subject.ts` | 97 | `2a95f2cc6bd25c22198f40c20fbfd1b204afc45f7120831f250b69dbcd292e86` |
| `workspace/test/public.test.mjs` | 252 | `46ee2aba0b4da27c8d4c22dab3b38b8d3da28e1b9731971a0b193f3050e2665b` |

## Commands and results

All commands ran from the isolated Goal 2 worktree unless an explicit `-C` path is shown.

1. `git rev-parse HEAD` — exit `0`; exact Control Baseline.
2. `git status --short` — exit `0`; blank before implementation.
3. `git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C D:/AI/AI_Projects/project2/.upstream/pi rev-parse HEAD` — exit `0`; exact pinned Pi SHA.
4. `git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C D:/AI/AI_Projects/project2/.upstream/pi status --short` — exit `0`; blank.
5. `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs ./workbench/scripts/v35g2-zero-access-preflight.ts --project-root . --output-root .runs/v3-5-g2/preflight-implementation --historical-state-root D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/project-state` — exit `0`; preflight digest `dbe8f13b...`; all access/cost counters zero.
6. `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs ./workbench/scripts/v35g2-reference-calibration.ts --project-root . --output-root .runs/v3-5-g2/reference-calibration` — exit `0`; public check `0`, hidden Verifier `0/passed`, calibration digest `a788f60d...`, all access/cost counters zero.
7. `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p workbench/tsconfig.v35g2.json --noEmit` — exit `0`.
8. `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/v35g2-real-adaptive-skill.test.ts` — exit `0`; `6/6` passed.
9. `node --experimental-loader ./.runs/v3-5-g2/runtime/public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/tool-profile.test.ts workbench/tests/v0b-verifier.test.ts workbench/tests/v35-persistent-session.test.ts workbench/tests/v3g3-admission.test.ts workbench/tests/v3g3-selective-reuse.test.ts` — initial sandbox invocation exit `1`, with `16` passes and only the two dependent V3 tests blocked by `EPERM` at their historical hardcoded external ignored evidence root.
10. The same established `v3g3-selective-reuse.test.ts` alone with approved access to its hardcoded ignored evidence root — exit `0`; `7/7` passed. Final unique affected regression result: `22/22` passed (`6` Tool, `2` Verifier, `6` Goal 1, `1` V3 admission, `7` V3 selective reuse/inspection).
11. `git diff --check` — exit `0`.
12. Protected-file `git diff --name-only -- AGENTS.md CURRENT_STATE.md <Charter> <Contract> .upstream/pi` — exit `0`; blank.

### Bounded correction commands and results

1. `git rev-parse HEAD; git status --short; git show --no-patch --format="%H%n%P%n%s" HEAD` — exit `0`; exact clean parent `ce58cdb35948c7f100773f3fb94762d23d7eccd5` before correction.
2. `node D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc -p workbench/tsconfig.v35g2.json --noEmit` — first correction iteration exit `1` for one missing test import; corrected in scope. Final run exit `0`.
3. `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/v35g2-real-adaptive-skill.test.ts` — first correction iteration exit `1`, `7/8` passed, exposing the public Faux single-text-block payload shape; corrected without relaxing exact text. Final run exit `0`, `8/8` passed.
4. `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/v35-persistent-session.test.ts workbench/tests/v3g3-admission.test.ts` — exit `0`, `7/7` passed (`6` Goal 1 plus `1` V3 admission).
5. `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/v3g3-selective-reuse.test.ts` — sandbox run exit `1` with `EPERM` at its historical external ignored evidence root and no source assertion failure; approved rerun exit `0`, `7/7` passed.
6. `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs ./workbench/scripts/v35g2-zero-access-preflight.ts --project-root . --output-root .runs/v3-5-g2/preflight-correction-ce58 --historical-state-root D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/project-state` — exit `0`; unchanged preflight digest `dbe8f13b...`; every access/cost counter `0`.
7. `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs ./workbench/scripts/v35g2-reference-calibration.ts --project-root . --output-root .runs/v3-5-g2/reference-calibration-correction-ce58` — exit `0`; public check `0`, Verifier `0/passed`, unchanged calibration digest `a788f60d...`, every access/cost counter `0`.

Ignored evidence:

- `.runs/v3-5-g2/preflight-implementation/zero-access-preflight.json`;
- `.runs/v3-5-g2/reference-calibration/calibration.json` and bounded outputs/workspace;
- `.runs/v3-5-g2/preflight-correction-ce58/zero-access-preflight.json`;
- `.runs/v3-5-g2/reference-calibration-correction-ce58/calibration.json` and bounded outputs/workspace;
- disposable focused-test evidence under `.runs/v3-5-g2/tests/`;
- fresh disposable V3 regression evidence created by the accepted historical test under its hardcoded ignored authority root.

## Zero-access proof

```yaml
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
base_real_arm_started: false
candidate_real_arm_started: false
```

These counters describe the completed implementation/correction phase before Main authorized real execution. No credential was resolved during that phase.

## Sole frozen real-pair execution

Main passed preflight and authorized exactly one pair from Execution Baseline `ed2dc14e695233411f96af162d92b405188b04cf` at `.runs/v3-5-g2/real-pair-20260808-01`.

### Final pre-dispatch Gate

`Fact`: immediately before credential access, HEAD was exact `ed2dc14e...`, its parent was `ce58cdb...`, Control Baseline `b44197e...` was an ancestor, tracked/staged status was clean, pinned Pi was exact `027a584...` and clean, and the pair root did not exist.

`Fact`: fresh zero-access dispatch preflight and calibration reproduced:

- Case Authority `43c2b1c2967826e61b236d3546f693a93424a127e25a5da9f4a0180617848fff`;
- State selection `a708c5e42e739350b447510f0f5dd91a93cfb6216bd3e3296a3f7fd9e7d1913a`;
- selected State version `2`, digest `0f6c5d44...`;
- Skill source `152d0067...`, wrapper `329cca95...`;
- preflight `dbe8f13b...` and calibration `a788f60d...`;
- all pre-dispatch credential/network/Provider/model/cost counters `0`.

The opaque wrapper loaded only `DEEPSEEK_API_KEY` from `D:/AI/AI_Projects/project2/.env.g005` into the single Node execution chain and removed the environment variable in `finally`. Its value was not printed, persisted, hashed or summarized.

Exact authorized Node invocation inside that wrapper:

```text
node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs ./workbench/scripts/v35g2-real-pair.ts --project-root . --pair-root .runs/v3-5-g2/real-pair-20260808-01 --historical-state-root D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/project-state --implementation-commit ed2dc14e695233411f96af162d92b405188b04cf --authorize-real-pair V3_5_G2_REAL_PAIR_ONCE
```

Command result: exit `1`. Base consumed 16 actual Provider/model requests. The 17th pre-dispatch request attempt was rejected locally with `Goal 3 provider request budget exceeded`; the Harness failure-report path then also failed closed with `Goal 3 Provider usage exceeded its pre-dispatch reservation`. `pause.json` records `status: invalid_pair` and one credential read plus 16 network/external-Provider/real-model calls. No retry, fallback, replacement, Candidate or extra Case occurred.

### Persisted terminal facts

| Metric | Base | Candidate | Pair total |
|---|---:|---:|---:|
| Credential resolutions | 1 | 0 | 1 |
| Actual Provider/model requests | 16 | 0 | 16 |
| Pre-dispatch request attempts | 17 | 0 | 17 |
| Input tokens, including cache accounting | 18,448 | 0 | 18,448 |
| Output tokens | 902 | 0 | 902 |
| Total tokens | 19,350 | 0 | 19,350 |
| Tool calls | 16 | 0 | 16 |
| Cost USD | 0.000552272 | 0 | 0.000552272 |
| Hidden external Verifier runs | 0 | 0 | 0 |

`Fact`: the Base public JSONL Session exists with 34 entries: one user message, 16 real assistant `toolUse` messages, 16 Tool results and one local error assistant message. Its bounded historical-prefix digest is `abc4bdf6c0e1ba33df763d0b5d5d3c5c48c431c27e9238198daf60c42d44f327`.

`Fact`: Base workspace final tree digest is `7bc3efd92e80fb559544ed45c59c3f0fdb7ebdb37cc5deeb67f48f68a1efe915`, equal to the calibration reference workspace. This is not a Verifier result: `verifier/result.json` does not exist because the arm did not settle within its request budget.

`Fact`: Candidate workspace stayed at initial digest `4a45c560...`; no Candidate Run or Session was created. Protected bytes for both workspaces match frozen digest `85d2cfe5fbd7624a61b329dba945b42d955812fa6eede6f5e06d3d46ac262745`.

`Fact`: Base Run contains only `binding.json` and the immutable Verifier source snapshot. It has no `runtime.json`, Goal 2 Manifest, Verifier result or `first-provider-payload.json`. Consequently first-payload normalized fairness is not persistently provable for this invalid pair.

`Fact`: `inspectGoal2PairV35` returned `integrity_valid: false` because `comparison.json` does not exist. `readGoal2SkillComparisonV35` returned `source_status: unavailable` with null result and efficiency. The observed terminal status is `invalid_pair`; no valid Base/Candidate comparison label exists.

`Fact`: post-terminal inspection revalidated the exact historical State authority tree digest `0c6167f8...`, selection/Skill/fixture/Verifier identities, clean source commit `ed2dc14e...`, and clean pinned Pi `027a584...`.

## Remaining limitations and stop point

`Fact`: the sole real authority is consumed. It produced an invalid Base budget-stop prefix, no Candidate, no external Verifier result and no comparison. No full Goal 2 evidence claim may be made.

`Fact`: the emitted public Pi runtime/compiler used for local verification is the already-existing pinned `D:/AI/AI_Projects/project2/.runs/g006/pi` checkout. No dependency installation or network access occurred.

`Fact`: the derived State selection remains intentionally bound to the accepted historical State path because Pi's public explicit-Skill wrapper hashes that location. Drift or absence fails closed before dispatch.

`Recommendation`: Main should preserve the pair root and review whether to close Goal 2 with an invalid/inconclusive limitation. Any rerun, replacement, new budget, correction or revised protocol would require new explicit authority and cannot be inferred from this report.

`PAUSE_V3_5_G2_REAL_PAIR_INVALID_BASE_REQUEST_BUDGET`
