# FINAL_CAPSTONE_G1_IMPLEMENTATION_REPORT

## Disposition

**Working Session recommendation:** `PASS_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION`

This is the hit-only authority-root correction report, not Goal acceptance. Goal 1 remains active and unaccepted; Goal 2 remains unauthorized. No staging, commit, Candidate freeze, audit dispatch, control-state change, or product integration occurred.

## Main hit and required red phase

**Fact:** Main re-review retained `G1-AUDIT-P1-001`: a caller could clone a registration, change its ID and self-digest, create a second matching plain `hostAuthorization` object, and have both accepted.

Before changing implementation, the focused test was extended with the exact combined forgery and invoked all relevant exported boundaries. The red run was:

| Command | Exit | Result |
|---|---:|---|
| `node --test tests/final-capstone-g1-evidence-admission.test.ts` | 1 | 18 passed, 4 failed |

The parent combined-forgery case and all three boundary subtests failed as intended:

- direct derivation: `Missing expected rejection`;
- file admission: `Missing expected rejection`;
- reopen inspection: returned only `admission recomputation mismatch`, not an authority-root rejection.

The regression remains in the final suite as `combined registration and matching plain authorization forgery cannot cross any exported boundary`.

## Semantic correction

Registration integrity remains an ordinary self-digest, but approval is no longer accepted from any caller object, boolean, ID, digest, or path.

- `TrustedEvidenceHostAuthorizationG1` and every exported `hostAuthorization` parameter were removed.
- A module-private, frozen `FIXED_HOST_APPROVALS_G1` is now the bounded Host-owned trust root. It freezes the exact approved project/registration ID/digest tuples and cannot be extended through any exported API.
- `fixedHostApprovalG1` compares the integrity-validated registration against that fixed root and internally derives the persisted `TrustedEvidenceHostApprovalG1` record.
- `deriveTrustedEvidenceAdmissionG1` accepts only project root, expected project ID, and registration. A caller cannot submit approval material.
- `admitTrustedEvidenceG1` accepts only the registration path and fixed request context. The path selects bytes to inspect; it cannot create approval.
- `inspectTrustedEvidenceAdmissionG1` uses the same derivation and therefore the same fixed root when reopening.
- Extra caller properties such as a forged matching `hostAuthorization` are inert and cannot affect approval.

The fixed root is deliberately not a generic registry. Changing its approvals requires an authorized source change to the Host boundary itself. Exact replay of an already approved registration remains authorized; changing its project, ID, context, source locator, Inspector identity, or digest does not.

Post-correction reproduction:

```json
{"boundary":"derive","accepted":false,"error":"Host-owned approval root does not approve this registration identity/digest"}
{"boundary":"admit","accepted":false,"error":"Host-owned approval root does not approve this registration identity/digest"}
{"boundary":"reopen","accepted":false,"errors":["Host-owned approval root does not approve this registration identity/digest"]}
```

No credentials, signing, network access, external dependency, generic registry, plugin system, or product integration was added.

## Starting gate and control identity

| Item | Observed |
|---|---|
| Sole worktree | `C:\Users\HUAWEI\.codex\worktrees\g25main\project2` |
| Branch | `codex/v2-b-bounded-r2` |
| HEAD | `0c1c91efcbed3f0db4a3735de1996deff99f9bac` |
| HEAD tree | `194a90cac93cd1fe4c398f9db3db1829f0b9196e` |
| Staged delta | 0 before correction; 0 at handoff |
| Pinned Pi HEAD/tree | `027a5847901b5dde30270abaa1041046cd2b4b55` / `0aa996c1d6108d5ffd8ff24ff498d08720283f29` |
| Pinned Pi status | clean |
| Accepted Contract SHA-256 | `d965c1e47cb18262572eedd33318527e534409178e59b70e7b522ab1842d9963` |

The worktree began with the previous six-file uncommitted Working Session correction. Six pre-existing untracked Main/control reports were identified separately and left unmodified:

| Path | SHA-256 |
|---|---|
| `docs/reports/FINAL_CAPSTONE_G1_POST_AUDIT_CORRECTION_MAIN_REREVIEW.md` | `17829361061404a2675986792e7b68049f3075b93b7b7412e6b097b9a0f558d7` |
| `docs/reports/FINAL_CAPSTONE_G1_AUTHORITY_ROOT_CORRECTION_PROMPT.md` | `b9eed097423504c4e8db5efcadb56c896ed53c2993b2de5b550ec97528082d83` |
| `docs/reports/FINAL_CAPSTONE_G1_FOCUSED_AUDIT_MAIN_REVIEW.md` | `e24de503266d8015299ea94716abea747835b7443da8c2e05206894f91d26b81` |
| `docs/reports/FINAL_CAPSTONE_G1_FOCUSED_AUDIT_PROMPT.md` | `cf8aaa1d07b4a20569834f346242bc7fed4f7e16d2793b19cb23af24f0de625b` |
| `docs/reports/FINAL_CAPSTONE_G1_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md` | `37b8a97ea16bd29171de8a1a9f7bb7998e7a3a65722e0e06a9707388d4130c60` |
| `docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md` | `721560f141ec0a55a26728a753820525bf46fa66935d0c54e4d6e9a81ed9a5da` |

## Exact final tracked delta

The final diff from rejected Candidate `0c1c91e...` contains five allowed paths; `workbench/src/inspect-final-capstone-g1.ts` was restored byte-identical to the rejected Candidate because it now reaches the common fixed root through derivation without a caller authorization parameter.

| Changed path | Final correction |
|---|---|
| `workbench/src/contracts/final-capstone-g1-types.ts` | Registration contains no grant; persisted internally derived fixed approval has its own narrow type. |
| `workbench/src/refinement/evidence-admission-g1.ts` | Private fixed approval root, fixed-root resolver, and caller-approval-free exported derivation/admission APIs. |
| `workbench/tests/final-capstone-g1-evidence-admission.test.ts` | Required red-first combined forgery across all boundaries plus fixed-root positive/negative coverage. |
| `docs/reports/FINAL_CAPSTONE_G1_IMPLEMENTATION_REPORT.md` | This report. |
| `docs/reports/FINAL_CAPSTONE_G1_CLOSEOUT_DRAFT.md` | Revised acceptance mapping. |

No out-of-allowlist tracked file changed. `CURRENT_STATE.md`, accepted-core V0-V3.6, Main/audit/control reports, Pi, historical Runs, State, active pointers, Workspaces, Sources, and Git state were not modified.

Pre-report implementation hashes:

| File | Lines | Bytes | SHA-256 |
|---|---:|---:|---|
| `workbench/src/contracts/final-capstone-g1-types.ts` | 101 | 2,807 | `f77f7e87f34c650aced5b1854a6ffa415eeadf1070517bd6199aba3ef92013b2` |
| `workbench/src/refinement/evidence-admission-g1.ts` | 330 | 27,291 | `a71b813c59f4e008b8f6c83a6381b500a7476cdd2a8e525eb575a927e9911493` |
| `workbench/src/inspect-final-capstone-g1.ts` | 57 | 3,668 | `19f0c4584df342e29267a8c501d2cbf4a45f7fe7c47dd49fe0fa0e64f566cc74` (unchanged) |
| `workbench/tests/final-capstone-g1-evidence-admission.test.ts` | 450 | 34,602 | `5b9696418a2c2bb8eb8e045d85c0ddad4f8f26f6bf27ef2cc698c50d57721cf2` |

## Supported and rejected source matrix

| Source | Result and preserved identity |
|---|---|
| V0-B/V0-C verifier-backed terminal Run | Supported only with fixed Host approval and existing Inspector-valid terminal/Outcome/Verifier/artifact lineage. |
| V2-A recovery/comparison | Supported only for Inspector-valid selected recovery; preserves one real Run ID, Seed/group, both Candidate Paths, common Verifier, hard gates, budgets, and Selection. |
| V3 Goal 3 bound-State follow-up | Supported only for a promoted non-base State with applicable binding, recomputable lineage, consistent runtime path, Case Authority, and existing Inspector success. |
| V3 version 0 / empty binding / null lineage | Rejected explicitly. |
| V3.6 daily or any unknown/fourth family | Rejected by exact source-family boundary; settled/Trace/ChangeSet claims do not confer eligibility. |
| Valid source under unapproved or modified registration identity/digest | Rejected by the fixed Host approval root. |

## Corrected admission identities

All four positives independently reopened with `integrity_valid: true`, and V0-B also reopened in a fresh Node process.

| Case | Admission ID | Admission digest | Evidence ID | Evidence digest |
|---|---|---|---|---|
| V0-B PASS | `admission-44457ecf38bd0c05f2674a1da9feeb8e` | `c4f3b4327a289707c8d772156a2653c9af97fd9227b4328485d43667b95515aa` | `evidence-b0b3c2523816f31269845d901b985c3f` | `53350a082b8b1ce556ca06c8ce7508a5aa8a8ae8767269013f41da1dc212d565` |
| V0-C agent FAIL | `admission-0fc9ba18bd2148d3adfbe985919c4385` | `44952abb8631c80c65878ce6687cc317c2e72560aa3c4446ef5d76f7b86e690e` | `evidence-591785c9a08259d4add9fc431b2dae63` | `09be496e308c2adf60654d6652fc87fb0a6078a7fe9491896ac30cf49473a0de` |
| V2 recovery/comparison | `admission-2c6d5d08d67cdbd065505880d84adffc` | `e8ddf2a7b2233aed9f01aeabe30cde591e90fe84de52d3c2f70ac5c3dcc8e2a6` | `evidence-c0be39cef9c1760aa8cd035143380fcb` | `263326f1992d9e8079a10596ec908346f9ac594d2b2942de1b50fd4dfed965fe` |
| V3 promoted bound-State | `admission-62f2896d6c590fc257804b32997725c4` | `bf475c53e8b8c3b4d77d03595e92e23bc89c26258731606b91cd50a3de23f0fb` | `evidence-09f13419fec8fb94419fc840de4b757c` | `23d7557a83636e091b97e0d3aa1ed96f1fce7d6f5a45171f48d4de9333887fb9` |

### V2 truthfulness retained

- Run: `g1-v2-recovery-comparison`, the only `source_run_id`.
- Recovery group/Seed: `g1-v2-recovery-comparison-recovery-group-01` / `g1-v2-recovery-comparison-recovery-group-01-seed-01`.
- Candidate Paths: `...candidate-a` and `...candidate-b`; selected `...candidate-b`.
- Common artifact/Verifier digest: `ba1ef09060e724a4494ca58ed2e45a2197c87bd99aff81708528320391ed2d97`; all eight hard gates per Candidate remain frozen.
- Schema-1 `comparison` remains omitted because Candidate Paths are not peer Runs.

### V3 promoted binding retained

- State version/digest: `1` / `8c26430e7b17adfec0e59f329eb371b75cb97965f31aa16b5b885d0dbe03790a`.
- Decision: `decision-cd8566516c667a6d50ae4f151f877712`; decision digest `cd8566516c667a6d50ae4f151f8777124b99179867ddc8d9ea853be5910c9427`.
- Binding digest: `f1c254ae96775c3435b7ee33c701f5faff0c4766e120dee0544d73f1628e88ca`; one applicable `prompt_addendum` entry and matching runtime path.
- Promotion admission digest: `32d166ccc03a359aedbd8d2704bc9c55108d59fa99b4a9df950a0f9a14338132`.
- Case Authority digest: `244b2174dd38c604ca7056ff1bd5959863be3ed1c0b7ecf892a1c9d3029ea259`.

The explicit unbound negative remains:

```json
{"accepted":false,"error":"V3 bound-State follow-up requires a promoted non-base State, applicable bound entry, and promotion lineage"}
```

## Final Contract verification

Run from `C:\Users\HUAWEI\.codex\worktrees\g25main\project2\workbench` using existing local dependencies only:

| Command | Exit | Result |
|---|---:|---|
| `node 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit` | 0 | TypeScript clean |
| `node --test tests/final-capstone-g1-evidence-admission.test.ts` | 0 | 22 passed, 0 failed |
| `node --test tests/v3g1-evidence-to-candidate.test.ts` | 0 | 13 passed, 0 failed |
| `node --test tests/v3g2-validate-promote-reject-rollback.test.ts` | 0 | 6 passed, 0 failed |
| `node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts` | 0 | 8 passed, 0 failed |

Final aggregate: **49 passed, 0 failed**, plus clean typecheck.

## Negative coverage

The focused suite rejects combined registration/authorization forgery at all three exported boundaries; changed registration identity/digest; caller `host_grant`; caller-selected unapproved registration path; cross-project identity; unknown family/key; stale Inspector; artifact/Outcome/journal tamper; missing Verifier/terminal; invalid attribution; source escape; junction/reparse; hardlink; missing/ambiguous State; unbound base State; and stored admission/FrozenEvidence digest mutation.

## Ignored evidence and immutability

`.runs/final-capstone/g1/` remains ignored: 573 files / 1,057,374 bytes.

| Subtree | Files | Bytes |
|---|---:|---:|
| `admissions/` | 5 | 101,741 |
| `host-registrations/` | 7 | 4,818 |
| `sources/` | 172 | 233,161 |
| `negative/` | 389 | 717,654 |

The two additional registration files preserve the changed-ID and combined-forgery regressions. Admission writes only its own immutable record; explicit tree-digest coverage proves no Source, State, pointer, Workspace, or accepted source mutation.

## Zero-access counters and remaining limits

| Counter | Value |
|---|---:|
| Credential reads | 0 |
| External network calls | 0 |
| External Provider/model calls | 0 |
| Real-model calls | 0 |
| Dependency installations | 0 |

- The fixed approval root is intentionally bounded to the currently authorized Goal 1 registrations. Adding or changing an approval requires reviewed source change; no runtime enrollment surface exists.
- This is an in-process code trust root, not cryptographic authentication or an OS permission boundary. Callers able to modify accepted source already control the Host implementation; protecting accepted source is the existing project control boundary.
- No independent re-audit has reviewed this hit-only correction. Main acceptance remains pending.
- Goal 1 does not authorize State assessment/publication, replacement, promotion/rollback, V3.6 integration, statistical recovery conclusions, or continual learning.

## CURRENT_STATE_UPDATE_PROPOSAL (report-only; not applied)

```yaml
active_goal: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
status: authority_root_correction_reported_pending_main_rereview
control_baseline:
  commit: 0c1c91efcbed3f0db4a3735de1996deff99f9bac
  tree: 194a90cac93cd1fe4c398f9db3db1829f0b9196e
working_session_result:
  recommendation: PASS_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
  red_reproduction: 18_passed_4_failed_expected
  final_verification: 49_passed_0_failed_plus_typecheck
  credential_reads: 0
  network_calls: 0
  external_provider_calls: 0
  real_model_calls: 0
acceptance: pending_main_rereview_and_any_required_reaudit
candidate_commit: null
goal_2_authority: not_granted
```

## Recommendation

**Recommendation:** `PASS_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION` for Main hit-focused re-review. Main alone may freeze a corrected Candidate, dispatch a fresh re-audit, accept Goal 1, or update control state. This Working Session stops here.
