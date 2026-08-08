# V3.5 Goal 2.5 Replacement Real Pair Execution Report

```yaml
report_status: PASS_V3_5_G2_5_REPLACEMENT_REAL_PAIR_EXECUTION_PENDING_MAIN_DISPOSITION
date: 2026-08-09
session_role: fresh_top_level_no_source_edit_real_execution_session
execution_baseline: 91fb8be73f809a67bedf58efcf520914ce93f737
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pair_id: v35-g25-stable-unique-pair-01
pair_root: C:/Users/HUAWEI/.codex/worktrees/d073/project2/.runs/v3-5-g2-5/real-pair-replacement-20260809-01
unique_execution_command_exit_code: 0
replacement_authority: consumed_once_successfully
retry: 0
fallback: 0
automatic_or_additional_replacement: 0
additional_pair: 0
additional_arm: 0
additional_case: 0
goal_2_5_accepted_or_closed: false
v3_5_accepted_or_closed: false
goal_3_entered: false
```

## Outcome

**Fact.** Gate H passed before any Credential-resolver read, network access or Provider
dispatch. The sole frozen replacement command ran exactly once and exited `0`. It created
Base first, obtained a valid Base Task Outcome, then created Candidate. No `pause.json`
exists.

**Fact.** Both arms reached the normal public-Pi `settled` trajectory after one successful
terminating `public_test`, and the frozen external Verifier ran exactly once per arm and
returned `passed`. This report records the execution evidence but does not accept Goal 2.5,
V3.5 or Goal 3.

## Gate H

| Gate | Observed before Credential/network access | Result |
|---|---|---|
| Project identity | `HEAD 91fb8be73f809a67bedf58efcf520914ce93f737`; tracked status blank | pass |
| Pinned Pi identity | `HEAD 027a5847901b5dde30270abaa1041046cd2b4b55`; tracked status blank | pass |
| Historical State root | exists; version `2`; selected digest `0f6c5d44c815a0d1b267d7fdf2e0c01f50eb640d06da72fe9ff8fab343249927`; inventory digest `0c6167f82595ef36d6e9cdabbce8eac09f18b341f48694fcacb84ff6b48f3ffa` | pass, read-only |
| Credential file | `D:/AI/AI_Projects/project2/.env.g005` exists; value was not read or inspected by the Session | pass |
| Fresh Pair root | absent before the command | pass |
| Frozen Workspace | `4a45c560541f561143fc17302576970c521febc4ae81f2f384be2708faa89922` | exact |
| Frozen Prompt | `96b1bf32248b220af6fc44021e57c314dbb57d32d37ae45505ca2ac1c9954c62` | exact |
| Frozen Verifier | `470e9a49f27ebf3a14bd8d104f4e0a4a0e62a018e649352e56bfc418fa2a2fef` | exact |
| Frozen reference bytes | `083640cc7a47940ba184f7f031379531602f7d9924a8a8c018a8b534cce2d8c4` | exact |
| Frozen Skill | `adaptive-inefficient-success`; source `152d00670b47b598cd54e4ba74a8eea580b16869e108b9027ebd3aee96f740c3`; wrapper `329cca959c9f293d6d8e2dd56a89df14e21e069fd517633e405eb9893b675928` | exact |
| Legal command IDs | exactly `public_test`; frozen descriptor and source assertions passed | pass |
| Old partial Pair | remained at `C:/Users/HUAWEI/.codex/worktrees/3819/project2/.runs/v3-5-g2-5/real-pair-20260809-01`; inventory digest before and after `5bbcf70d7d6272d6314443d423a409d2b1072067013ffe25295a678a70a8ca16` | unchanged; not copied, overwritten or continued |

The read-only Gate assertion initially hit one PowerShell quoting parse error before module
evaluation. It performed no Credential read, network access, write or real execution. The
same assertion was then passed through Node stdin and returned `assertions: passed`. This
was not the frozen Pair command and did not consume execution authority.

## Unique command

Working directory:
`C:/Users/HUAWEI/.codex/worktrees/d073/project2/workbench`

```text
node --env-file=D:/AI/AI_Projects/project2/.env.g005 --experimental-loader ./scripts/v35g2-public-pi-loader.mjs scripts/v35g25-real-pair.ts --project-root C:/Users/HUAWEI/.codex/worktrees/d073/project2 --pair-root C:/Users/HUAWEI/.codex/worktrees/d073/project2/.runs/v3-5-g2-5/real-pair-replacement-20260809-01 --historical-state-root D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/project-state --execution-baseline 91fb8be73f809a67bedf58efcf520914ce93f737 --authorize-real-pair V3_5_G2_5_REAL_PAIR_ONCE
```

Exit code: `0`. The only diagnostic was Node's existing experimental-loader deprecation
warning. `--env-file` loaded the environment opaquely; the key value was never printed,
copied, persisted, normalized or inspected.

## Pair and arm results

| Field | Base | Candidate |
|---|---|---|
| Session ID | `v35-g25-stable-unique-base-session-01` | `v35-g25-stable-unique-candidate-session-01` |
| Run ID | `v35-g25-stable-unique-base-run-01` | `v35-g25-stable-unique-candidate-run-01` |
| Treatment binding | no adaptive Skill | exact `adaptive-inefficient-success` |
| Terminal reason | `successful_public_test` | `successful_public_test` |
| Trajectory Outcome | `settled` | `settled` |
| Task Outcome | `passed` | `passed` |
| Provider request attempts | 3 | 3 |
| Provider dispatches / responses | 3 / 3 | 3 / 3 |
| Tokens | 1,983 input + 200 output = 2,183 | 2,779 input + 174 output = 2,953 |
| Tool calls | 3 | 3 |
| Cost USD | `0.0001404424` | `0.0001392328` |
| Verifier | exactly 1; `passed`; exit `0`; not timed out | exactly 1; `passed`; exit `0`; not timed out |
| Verifier attempt ID | `v35-g25-stable-unique-base-run-01-attempt` | `v35-g25-stable-unique-candidate-run-01-attempt` |
| Public check / termination | succeeded / true | succeeded / true |
| Public settled events | 1 | 1 |
| Pending Provider / Tool / side effect | `0 / 0 / 0` | `0 / 0 / 0` |
| Usage known | true | true |

The Candidate Runtime file contains cumulative access counters (`credential_reads: 2`,
`network/external_provider/real_model: 6/6/6`). Per-arm increments are one opaque
Credential-resolver read and three network/Provider/model calls for each arm.

Whole-Pair counters:

```yaml
arms: 2
credential_resolver_reads: 2
network_calls: 6
external_provider_calls: 6
real_model_calls: 6
provider_dispatches: 6
provider_responses: 6
input_tokens: 4762
output_tokens: 374
total_tokens: 5136
tool_calls: 6
verifier_runs: 2
cost_usd: 0.0002796752
retry: 0
fallback: 0
automatic_or_additional_replacement: 0
additional_pair: 0
additional_arm: 0
additional_case: 0
```

All per-arm and whole-Pair caps passed. The seventeenth-attempt budget terminal was not
reached by either arm.

## Fairness, Tool and integrity evidence

**Fact.** The authenticated preflight fixes Base-first order and byte-identical initial
Workspace digest
`4a45c560541f561143fc17302576970c521febc4ae81f2f384be2708faa89922`.
The actual first Provider payloads have identical normalized payload digest
`0dc3d59e0dfb352c103314c5c79f46e2e785a9e2a5cea43a18febc4e4dd15077`
outside the frozen Skill treatment. Payload fairness digest is
`6d7288f5637e022b0bc1c5c3ea2052208ebfeccce30cfd47218b292af1f64043`.

**Fact.** Both first payloads expose the same actual Tool-interface digest
`92c9898d61c0f14a7f6ab9e4b7ee1119650347eb6823bb4fe542a3ab0ba5b3ec`.
Both arms executed the same ordered Tool names: `workspace_read`, `workspace_write`,
`run_command`; their call-argument digests are equal. A safe derived call/result projection
has Base digest `a5db84ca38aa92e75deae66e06a901d854e36a8b44b72c182370a10459a0ae72`
and Candidate digest
`84d745abbdb8b284394ab07bfc62710a0b0cd69a72408f0628dac9f31560d49e`.
The final command-result content hashes differ, while Tool identity, call order and call
arguments remain equal.

**Fact.** Both arms finished with Workspace tree digest
`7bc3efd92e80fb559544ed45c59c3f0fdb7ebdb37cc5deeb67f48f68a1efe915`;
each `src/subject.ts` equals the frozen reference digest. Protected-byte digest is
`85d2cfe5fbd7624a61b329dba945b42d955812fa6eede6f5e06d3d46ac262745`
for both arms.

**Fact.** Neither arm used the fallback budget checkpoint (`checkpoint_ref: null`). Both
used authenticated settled handoffs. Official read-only handoff inspection passed with
Runtime authenticated, live Session reopen equal, Tool calls closed, Workspace unchanged
since terminal, protected bytes unchanged and handoff persisted before Verifier. Handoff
digests are Base
`a11d4735755ff2463d45dcfafe4d91c866a53f328bfef38d84d411bd3fca20f6`
and Candidate
`4d6ab60790aae7f42b07852279b2efbf0bb152f00dc49e5d2939548d8f4ac305`.

**Fact.** Session/Run linkage re-opened and authenticated. Base has 7 Session entries,
entry digest `6d0f127e6eeaf4fe63e68c12014d772b473ad6f649d1ce143f79a185f6830c39`
and link digest `db605a7dcc769704d7b62cc56c01f71cd2f5ecc059160f0599f8dda8ea992109`.
Candidate has 7 entries, entry digest
`7dcb20fc5ca5da8a5a305058f7b0d40ce20db9c0b4e4d0ccd858f8fb23f53ff4`
and link digest `e6be856ee9aa8f7ab23823ee7bff99edbe226f936d6dd713156e4aae9352a91e`.

The authenticated comparison digest is
`243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f`.
Pair-root tree digest after execution is
`0b26257510d554005bc758f8ebbb60d4323e1b88c2b47c2e8a65240d7d4ca4f8`.
There is no primary stop or pause artifact.

## Complete Evidence Index

All paths are relative to the Pair root.

| Path | Bytes | SHA-256 |
|---|---:|---|
| `authority/case/v35-g2-stable-unique-case-01.json` | 1271 | `97346c47f63fe37f28f00bffc704fa08742451788e8dd5ad6df20694bf3fbaf5` |
| `authority/state-selection/selection.json` | 1075 | `9ad2286c5e4e9fd6479a6e149a744610d92caa6c2e45b5b5f0fe2a86303ec53e` |
| `comparison.json` | 1086 | `26e398c922d1b78e3a5784b83875077156f63bd7eb42f6d46e5d7ccf0d636da9` |
| `preflight.json` | 622 | `1d38ad126a9c999c36951c7ec3e91fcc97ca85df9aa0607638755a0a3ba83b71` |
| `runs/v35-g25-stable-unique-base-run-01/binding.json` | 1813 | `624fbb34a753aecd0754cd120b9a7d53e48a20f6311dfdf50f78ad5919cab2bf` |
| `runs/v35-g25-stable-unique-base-run-01/first-provider-payload.json` | 1475 | `a878bbf027434fcbbcc0fa8dced751319739062c0bba04316b5c6f58401b2d18` |
| `runs/v35-g25-stable-unique-base-run-01/goal25-manifest.json` | 2555 | `2034e76e179710cec6eb8a57003fa4aab142cfe5cbfa66e139827737b62f0ed2` |
| `runs/v35-g25-stable-unique-base-run-01/outcome.json` | 340 | `1bab21cb155870bed92beb279b669dc105442e13bdf0a7b93677e8948fc9ebd8` |
| `runs/v35-g25-stable-unique-base-run-01/runtime-v35g25.json` | 1489 | `230b030e98e9d145620381ab3e40d283d1d944948444446c0f61e6fdf697ea39` |
| `runs/v35-g25-stable-unique-base-run-01/session-run-link.json` | 800 | `274a9b8b14ba1b426597a37728c6cf94380a8331b0dbe488c7805ce7a3b764e2` |
| `runs/v35-g25-stable-unique-base-run-01/settled-handoff/pre-verifier.json` | 1965 | `9e8d245f59f58a8e6f47b7774f060d93626db71e14c8a1482ec2eb67be3421fc` |
| `runs/v35-g25-stable-unique-base-run-01/settled-handoff/session-pre-verifier.jsonl` | 4428 | `165aa509fd7689a7b9a725caac5b0741508a834a930e48ec2b3a77955cd6c907` |
| `runs/v35-g25-stable-unique-base-run-01/settled-handoff/workspace-pre-verifier.json` | 375 | `9bac06f0e5f6acbad6bcb438f86aa17003f691200829cf0d5197a06c5f369b6d` |
| `runs/v35-g25-stable-unique-base-run-01/verifier/output.txt` | 121 | `fd64ef12337bd5afc99e1824544d611ca2544e07d36fd66190fe3f4f76fc5ea2` |
| `runs/v35-g25-stable-unique-base-run-01/verifier/result.json` | 1522 | `56f09b88bc4784d4d938c4dab6f27303cd26398d46a0cf7c97567be7aa2a5c58` |
| `runs/v35-g25-stable-unique-base-run-01/verifier/source.mjs` | 964 | `470e9a49f27ebf3a14bd8d104f4e0a4a0e62a018e649352e56bfc418fa2a2fef` |
| `runs/v35-g25-stable-unique-candidate-run-01/binding.json` | 2195 | `ef3e515efe5dda21659d8735a5239593a43a67c76542b15128c4e112d602af11` |
| `runs/v35-g25-stable-unique-candidate-run-01/first-provider-payload.json` | 1566 | `775e1d0840670e847f047affe6f792d04cb157251b3dcdddfeca97fb000cc9d6` |
| `runs/v35-g25-stable-unique-candidate-run-01/goal25-manifest.json` | 2580 | `5471e806189b5d5b5588cb101f25b95da70238b621c200a0119fc6743921d824` |
| `runs/v35-g25-stable-unique-candidate-run-01/outcome.json` | 345 | `9350398396081145c8e5e697d30d189bb5d43bb222806760dad08b708d194e1d` |
| `runs/v35-g25-stable-unique-candidate-run-01/runtime-v35g25.json` | 1500 | `0749ad04a46bf0a080d607d8efe9702acf3b60035e48da382b445194403661f9` |
| `runs/v35-g25-stable-unique-candidate-run-01/session-run-link.json` | 830 | `c750ba98388d93e730bf0bb8e0af47ed56f78fe27225830a6cdb205051203fda` |
| `runs/v35-g25-stable-unique-candidate-run-01/settled-handoff/pre-verifier.json` | 1985 | `6d96beebcb0a3c69790477c41f42a17c96b8e6663819f8c7b83ed12b11a4afcf` |
| `runs/v35-g25-stable-unique-candidate-run-01/settled-handoff/session-pre-verifier.jsonl` | 5046 | `2331cb7c70f098af943a7bed6a385e26042bb00db5bda1d1f615601737d3c368` |
| `runs/v35-g25-stable-unique-candidate-run-01/settled-handoff/workspace-pre-verifier.json` | 375 | `9bac06f0e5f6acbad6bcb438f86aa17003f691200829cf0d5197a06c5f369b6d` |
| `runs/v35-g25-stable-unique-candidate-run-01/verifier/output.txt` | 121 | `fd64ef12337bd5afc99e1824544d611ca2544e07d36fd66190fe3f4f76fc5ea2` |
| `runs/v35-g25-stable-unique-candidate-run-01/verifier/result.json` | 1532 | `6b2a3889a6e8e6d3c1dbd63c9c7990dd7e2fb0373f33a9922940338026df9e39` |
| `runs/v35-g25-stable-unique-candidate-run-01/verifier/source.mjs` | 964 | `470e9a49f27ebf3a14bd8d104f4e0a4a0e62a018e649352e56bfc418fa2a2fef` |
| `sessions/--C--Users-HUAWEI-.codex-worktrees-d073-project2-.runs-v3-5-g2-5-real-pair-replacement-20260809-01-workspaces-base--/2026-08-08T22-58-18-994Z_v35-g25-stable-unique-base-session-01.jsonl` | 4428 | `165aa509fd7689a7b9a725caac5b0741508a834a930e48ec2b3a77955cd6c907` |
| `sessions/--C--Users-HUAWEI-.codex-worktrees-d073-project2-.runs-v3-5-g2-5-real-pair-replacement-20260809-01-workspaces-candidate--/2026-08-08T22-58-24-383Z_v35-g25-stable-unique-candidate-session-01.jsonl` | 5046 | `2331cb7c70f098af943a7bed6a385e26042bb00db5bda1d1f615601737d3c368` |
| `workspaces/base/package.json` | 87 | `7852a78b1be7f60e901da63681809950e0fa579aa52517b811a1f6baeea25013` |
| `workspaces/base/src/subject.ts` | 90 | `083640cc7a47940ba184f7f031379531602f7d9924a8a8c018a8b534cce2d8c4` |
| `workspaces/base/test/public.test.mjs` | 252 | `46ee2aba0b4da27c8d4c22dab3b38b8d3da28e1b9731971a0b193f3050e2665b` |
| `workspaces/candidate/package.json` | 87 | `7852a78b1be7f60e901da63681809950e0fa579aa52517b811a1f6baeea25013` |
| `workspaces/candidate/src/subject.ts` | 90 | `083640cc7a47940ba184f7f031379531602f7d9924a8a8c018a8b534cce2d8c4` |
| `workspaces/candidate/test/public.test.mjs` | 252 | `46ee2aba0b4da27c8d4c22dab3b38b8d3da28e1b9731971a0b193f3050e2665b` |

## Change and authority boundary

**Fact.** The only generated execution content is the ignored fresh Pair root above. The
only tracked/uncommitted deliverable created by this Session is this report. No source,
test, fixture, Manifest input, historical State, control file, Pi file or dependency was
edited; nothing was staged or committed.

**Fact.** The one authorized replacement Pair is consumed. There was no retry, fallback,
automatic replacement, second replacement, extra Pair, extra arm, extra Case, tuning or
source correction. This Session stops for Main's limited evidence review and disposition.

## Remaining authority

- Main must independently review the evidence and decide the Goal 2.5 disposition with the
  user.
- This execution does not establish general Skill superiority: both fixed-case arms passed.
- Goal 3 and final V3.5 acceptance remain unauthorized.

