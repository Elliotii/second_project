# V3.5 Goal 2 Zero-Access Implementation Report

```yaml
goal_id: V3_5_G2_REAL_ADAPTIVE_SKILL_CLOSURE
phase: zero_access_implementation_and_preflight
status: READY_FOR_MAIN_PREFLIGHT
control_baseline_commit: b44197e3a5465058c4cb327613d775943f5f8444
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
goal_2_accepted: false
goal_3_authorized: false
v3_5_final_acceptance_authorized: false
```

The exact implementation commit SHA is returned to Main after the authorized commit is created. A tracked report cannot contain its own commit SHA because its bytes participate in that SHA.

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

Ignored evidence:

- `.runs/v3-5-g2/preflight-implementation/zero-access-preflight.json`;
- `.runs/v3-5-g2/reference-calibration/calibration.json` and bounded outputs/workspace;
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

No credential name was resolved or read by an executed Goal 2 path. The real-pair CLI was implemented but not invoked.

## Remaining limitations and stop point

`Fact`: no real Base or Candidate outcome exists yet; no comparison result label may be claimed.

`Fact`: the emitted public Pi runtime/compiler used for local verification is the already-existing pinned `D:/AI/AI_Projects/project2/.runs/g006/pi` checkout. No dependency installation or network access occurred.

`Fact`: the derived State selection remains intentionally bound to the accepted historical State path because Pi's public explicit-Skill wrapper hashes that location. Drift or absence fails closed before dispatch.

`Recommendation`: Main should review this commit and ignored preflight/calibration evidence, then either send the explicit same-Session real-pair follow-up or return one bounded correction. This Session must not self-authorize real access.

`READY_FOR_MAIN_PREFLIGHT`
