# FINAL_CAPSTONE_G1_IMPLEMENTATION_REPORT

## Disposition

**Recommendation:** `PASS_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION`

This is a Working Session recommendation, not Goal acceptance. No Candidate commit, control-state update, audit acceptance, Goal 2 work, staging, or Git commit was performed.

## Main Review bounded correction

**Fact:** Main Review disposition `REVISE_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION` identified two correctable semantic identity findings. This report now incorporates the bounded correction:

- `G1-MAIN-P1-001` closed: V3 admission rejects version 0, empty applicable binding, null promotion lineage, or a runtime path inconsistent with the bound State. The positive source now stages, symmetrically validates, promotes, and binds the admitted prompt State before the Goal 3 follow-up Run.
- `G1-MAIN-P1-002` closed: V2 `source_run_ids` contains only the single top-level Run ID. Candidate Path IDs and hard gates remain separate admission provenance. Schema-1 `comparison` is omitted because Candidate Paths are not peer Runs.

Only `workbench/src/refinement/evidence-admission-g1.ts`, `workbench/tests/final-capstone-g1-evidence-admission.test.ts`, and the two Working Session reports changed in this correction. The Goal 1 contract-types and independent Inspector modules were reread and left byte-identical.

The correction resumed at the same HEAD/tree/branch with zero tracked and staged delta. Main's two pre-existing correction-control documents were read and left unchanged:

| Correction control document | SHA-256 |
|---|---|
| `docs/reports/FINAL_CAPSTONE_G1_MAIN_REVIEW.md` | `1057c8f02465c82700ac2c3b7b641353cac67cdff94c225f9adc29d346487576` |
| `docs/reports/FINAL_CAPSTONE_G1_BOUNDED_CORRECTION_PROMPT.md` | `8593c7643b091b9619a6bc4764e9052a05a526ce925d20c028f5a4d491e5cda2` |

## Gate A — exact control identity

**Fact:** Gate A passed before the first source edit in the sole authoritative worktree `C:\Users\HUAWEI\.codex\worktrees\g25main\project2`.

| Item | Observed |
|---|---|
| Branch | `codex/v2-b-bounded-r2` |
| HEAD | `4c4d2f3f397be7784700a2323c2afeaecbad03f0` |
| HEAD tree | `f21b32938beaf638a68749aff28967d79aaa34a0` |
| Tracked delta before implementation | `0` |
| Staged delta before implementation | `0` |
| Pre-existing untracked set before implementation | Exactly the five files below |
| Pinned Pi HEAD | `027a5847901b5dde30270abaa1041046cd2b4b55` |
| Pinned Pi tree | `0aa996c1d6108d5ffd8ff24ff498d08720283f29` |
| Pinned Pi status | tracked/staged clean |
| Node | `v24.14.1` |
| Local TypeScript | `5.9.3`; SHA-256 `8d5fa5bd883fec0979fc2004f1fe1d99aef40570155d550eadc0b03b55513bf0` |
| Public emitted Pi resolution | `packages/agent/dist/index.js` (`Agent` exported); `packages/ai/dist/index.js` (45 namespace exports) |
| Credential reads | `0` |
| External network calls | `0` |
| External Provider/model calls | `0` |
| Real-model calls | `0` |

The five pre-existing untracked control/evidence documents were rehashed before editing and again after verification:

| Path | Recomputed SHA-256 |
|---|---|
| `docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md` | `721560f141ec0a55a26728a753820525bf46fa66935d0c54e4d6e9a81ed9a5da` |
| `docs/第二项目_Codex交接包_2026-07-30/SECOND_PROJECT_FINAL_CAPSTONE_VERSION_CHARTER.md` | `d36532233b113a81b5027f2c906c9281fae732ca4bf198e0281eff1bc5fc07dd` |
| `docs/第二项目_Codex交接包_2026-07-30/SECOND_PROJECT_FINAL_CAPSTONE_GOAL_1_CONTRACT.md` | `d965c1e47cb18262572eedd33318527e534409178e59b70e7b522ab1842d9963` |
| `docs/reports/SECOND_PROJECT_FINAL_CAPSTONE_GOAL_1_READINESS_REPORT.md` | `6cbc2692d97cd22b97287642c1ea12878f3278d41b1ec2ec942bdfa614cc5c35` |
| `docs/reports/SECOND_PROJECT_FINAL_CAPSTONE_GOAL_1_WORKING_SESSION_START_PROMPT.md` | `061d5c7d39ecf7d36a21849d890b545e7def79c4292045e10dce189188070359` |

## Implementation and complete tracked delta

**Fact:** No accepted-core file was edited. The implementation creates exactly the four source/test files allowed by Contract section 5, plus the two required reports. No tracked fixture was needed.

| New file / symbol | Purpose |
|---|---|
| `workbench/src/contracts/final-capstone-g1-types.ts` — `TrustedEvidenceHostRegistrationG1`, `TrustedEvidenceAdmissionRecordG1`, family/result types | Narrow exact persisted contract for Host registration, inventory/provenance, derived Evidence, and Inspector output. |
| `workbench/src/refinement/evidence-admission-g1.ts` — `validateHostRegistrationG1`, `inspectorIdentityG1`, `deriveTrustedEvidenceAdmissionG1`, `admitTrustedEvidenceG1`, `validateAdmissionEnvelopeG1` | Implements the three-family Host-registration boundary, independent reuse of existing Inspectors, complete link-free/hardlink-free source inventory, schema-1 `FrozenEvidenceV3` derivation, unchanged projector invocation, and idempotent write-once-equivalent persistence. |
| `workbench/src/inspect-final-capstone-g1.ts` — `inspectTrustedEvidenceAdmissionG1` | Reopens ordinary files, enforces project-relative/link-free paths, reruns the existing family Inspector through fresh derivation, and compares the complete stored admission/Frozen/projector record. |
| `workbench/tests/final-capstone-g1-evidence-admission.test.ts` | Focused deterministic positive, immutability, process-reopen, and fail-closed matrix for Goal 1. |
| `docs/reports/FINAL_CAPSTONE_G1_IMPLEMENTATION_REPORT.md` | This raw implementation/verification report. |
| `docs/reports/FINAL_CAPSTONE_G1_CLOSEOUT_DRAFT.md` | Contract acceptance mapping and non-authoritative PASS recommendation. |

Pre-report hashes of the four implementation/test files were:

| File | Lines | Bytes | SHA-256 |
|---|---:|---:|---|
| `workbench/src/contracts/final-capstone-g1-types.ts` | 95 | 2,643 | `ef7ae9178224d57055bcc8686f36db92d8546405e4645258fe8a062f9715a99d` |
| `workbench/src/refinement/evidence-admission-g1.ts` | 307 | 25,651 | `c7a7bfd87e35c9ef9ab8474f326323addb06b2315a7d89b12fe74636087c2eb7` |
| `workbench/src/inspect-final-capstone-g1.ts` | 57 | 3,668 | `19f0c4584df342e29267a8c501d2cbf4a45f7fe7c47dd49fe0fa0e64f566cc74` |
| `workbench/tests/final-capstone-g1-evidence-admission.test.ts` | 369 | 31,879 | `856fbb6bda9d5f6b2a7328ef1bbf0b4bbc62a81fc8937832ab80928a5b6a19af` |

## Authority and data flow

```text
Host-owned exact-key registration
  -> family-specific existing Inspector rerun
  -> complete ordinary-file source inventory + digests
  -> frozen admission/provenance record
  -> schema-1 FrozenEvidenceV3
  -> existing projectImprovementOpportunityV3
  -> write only <admission-root>/<admission-id>/admission.json
```

**Fact:** Eligibility is absent from source artifacts and is not a caller boolean. It is accepted only from the separate exact-key Host registration with `authority: "host"`, `adaptation_eligible: true`, and the frozen Goal 1 policy ID. Agent-, browser-, and source-artifact-authored authority values fail closed.

**Fact:** Admission does not write a Candidate, State version, active pointer, Workspace, source artifact, comparator result, promotion, rollback, or V3.6 object. A dedicated test snapshots V0, V2, V3 bundle (including State/pointer/Workspace), and accepted `workbench/src` tree digests before admission and proves they remain identical afterward.

## Supported and rejected family matrix

| Source | Admission decision | Preserved authority |
|---|---|---|
| V0-B committed verifier-backed terminal Run | Supported | Run/attempt/session/workspace identity, terminal reason, Outcome/failure attribution, Verifier, complete artifact inventory |
| V0-C committed verifier-backed terminal Run | Supported | Run and all attempts, recovery summary, terminal reason, Outcome/failure attribution, final Verifier, complete artifact inventory |
| V2-A recovery/comparison Run | Supported only for Inspector-valid `recovery_selected` with exactly two common-Verifier passing Candidate Paths | the single parent Run ID; Recovery Seed/group; both Candidate Path IDs, hard gates and budgets; common artifact/Verifier identity; full Selection; no schema-1 peer-Run comparison claim |
| V3 Goal 3 bound-State follow-up | Supported only after `inspectGoal3RunV3` and binding recomputation pass and the binding proves a promoted non-base State, at least one applicable entry, non-null promotion lineage, and matching runtime path | State revision/version/digest/decision, binding/context/entries/promotion lineage, Case Authority, Manifest/runtime/Verifier, pointer-drift observation |
| V2 initial pass, incomplete recovery, failed peer, or invalid Selection | Rejected for this family |
| Ordinary V3.6 daily Run, including claims of settled Trace/ChangeSet | Rejected: unknown source family; daily false eligibility is not upgraded |
| Any fourth or unknown family | Rejected |

## Positive admission identities and Inspector results

The identities below are from the final focused test evidence. All four independent Inspector results were `integrity_valid: true`, `errors: []`, and were also revalidated after a new Node process opened the stored evidence.

| Case | Admission ID | Admission digest | Evidence ID | Evidence digest | Projector |
|---|---|---|---|---|---|
| V0-B PASS | `admission-2bd54508579ac031be2315d7c1726c07` | `717eac3c7db75b8b0f1f20efc7050f96228d0f7632fd355f2870bdbdf613527b` | `evidence-7f38963f3deebb472677e31ff8ee7d5b` | `2cea213c37a93297d2e53daf3793cfb68e640ee1fd431d3899fb0043d05298f7` | `no_opportunity` |
| V0-C agent-attributed FAIL | `admission-802d61acc77e2f845bae182c8d4920a4` | `ac6ac94cd9731c164a0208e2043191d098a5ed8dfbd966c57915a0d8260621cc` | `evidence-b9d3eca26f00d9d0c219b4b6d624b44b` | `cdc0195349f8ab5628428a55cc4f156aa20fdaf97b049104cac8fed2abb17ab7` | `opp-ea41caf68ee9f20fb7e4c7c1c5892c0c` (`hard_failure`) |
| V2 two-Candidate-Path recovery | `admission-447cf2f6a2e41f894eae3d9a4c479120` | `a27ebe87b5a946a1ea849335f4c59d5764e6277afbc5e05cbd1847a6efe657d5` | `evidence-4b37377b6bd3851d94101ac6dd89f98f` | `7ef5b0be85e9f9ea58575036f55647842286357f5bb8dbe65386810ba514f96b` | `no_opportunity`; `source_run_ids = ["g1-v2-recovery-comparison"]`; schema-1 `comparison` omitted |
| V3 promoted bound-State follow-up | `admission-adf99f6d0bf2aa5cef26d5bb833b5664` | `6cc7b7f8572ea515a282ddd122e9b82e6a6c3f8fd0913409b2cb95290e0c7a6c` | `evidence-006b8f230916e00d268ca8a9b925cfc9` | `223de0f71cfb20c52a4c111f38f7ee83d09d075ff21e0e925892a76a72acc841` | `no_opportunity`; State version 1; `prompt_addendum` runtime |

The V0-B idempotence/immutability registration produced a second valid identity (`admission-3f530784746f1b2b63e2057caa1b535f`) solely to prove a new admission writes only its record. Exact repeated admission of the original registration returned the same ID/digest with `idempotent_existing: true`.

## Negative-test matrix

| Rejected boundary | Evidence in focused test |
|---|---|
| Artifact tamper | V0 Outcome byte tamper rejected by existing Inspector/digest lineage |
| Missing/invalid Verifier | V0 Verifier result removal rejected |
| Nonterminal/uncommitted Run | V0 terminal removal rejected |
| Unclosed lineage | V0 journal terminal-line removal rejected |
| Invalid attribution | coherently unauthorized failure-class mutation rejected by existing Inspector identity |
| Missing/ambiguous State identity | nonexistent V3 State root and caller-added State field rejected |
| Unbound/base State mislabeled as follow-up | Inspector-valid version 0 with `bound_entries: []` and `lineage: null` rejected with `V3 bound-State follow-up requires a promoted non-base State, applicable bound entry, and promotion lineage` |
| Cross-project identity | Host registration/project mismatch rejected |
| Source-root escape | `..` source root rejected before source inspection |
| Symlink/junction/reparse point | junction in source path rejected |
| Prohibited hardlink | additional link to terminal bytes rejected through `nlink !== 1` inventory rule |
| Stale Inspector fingerprint | substituted fingerprint rejected before admission |
| Unknown source family | `v36_daily` and its settled/Trace/ChangeSet/eligibility claims rejected |
| Unknown key | caller validity key and ambiguous State key rejected by exact-key validation |
| Admission/FrozenEvidence digest tamper | both stored digest variants rejected by independent Inspector |
| Eligibility escalation | `agent`, `browser`, and `source_artifact` authority rejected |

## Final verification commands

The Windows shell tried to associate the extensionless `tsc` JavaScript entry point with a desktop application when invoked directly. That invocation was not counted as verification. The same already-present, hash-verified TypeScript 5.9.3 entry point was therefore launched explicitly through the already-present Node executable; there was no install or download.

| Command | Exit | Tests |
|---|---:|---:|
| `node 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit` | 0 | typecheck, no test count |
| `node --test tests/final-capstone-g1-evidence-admission.test.ts` | 0 | 17 passed, 0 failed |
| `node --test tests/v3g1-evidence-to-candidate.test.ts` | 0 | 13 passed, 0 failed |
| `node --test tests/v3g2-validate-promote-reject-rollback.test.ts` | 0 | 6 passed, 0 failed |
| `node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts` | 0 | 8 passed, 0 failed |

Total final tests: **44 passed, 0 failed**.

## Tracked and ignored evidence inventory

**Fact:** `.runs/final-capstone/g1/` is ignored and contains 571 files / 1,055,427 bytes after the corrected final focused suite:

| Ignored subtree | Files | Bytes | Purpose |
|---|---:|---:|---|
| `admissions/` | 5 | 100,407 | write-once-equivalent admission records |
| `host-registrations/` | 5 | 4,207 | exact-key Host authority inputs |
| `sources/` | 172 | 233,159 | byte-copy V0 inputs, deterministic V2, promoted/bound Faux V3 positive, and inspected unbound V3 negative |
| `negative/` | 389 | 717,654 | isolated tamper/path/link/hardlink variants |

No historical V0–V3.6 evidence or fixture was modified. The two V0 source runs were copied byte-for-byte into the Goal 1 ignored root. V2 and V3 source evidence was generated under that root. Required V3 regressions created only their existing ignored test evidence.

## Remaining unverified items and claim limits

- **Fact:** No independent focused Audit Session has reviewed this Working Session delta; Main decides whether the risk boundary requires one before creating a Candidate commit.
- **Fact:** No Git Candidate commit or Execution Baseline exists for Goal 1.
- **Fact:** The V3 positive fixture uses accepted V3 helpers to stage, symmetrically validate, promote, and bind a prompt State solely to create valid source evidence. Goal 1 admission itself still has no State publication, assessment, replacement, promotion, or rollback authority; those remain Goal 2 or later authority.
- **Fact:** Host authority is represented by a separate exact-key registration file supplied to a Host-only API boundary. Deployment must keep that registration location outside Agent/browser write authority; Goal 1 does not add an OS permission or generic registry service.
- **Fact:** V2 coverage is the accepted bounded deterministic two-arm recovery substrate. It is not statistical superiority evidence and does not claim a natural failure.
- **Fact:** No CLI, Web UI, daily V3.6 integration, generic adapter registry, mining, clustering, Experience DB, or continual loop was added.
- **Fact:** No Credential, external network, Provider/model, or real-model access occurred.

## CURRENT_STATE_UPDATE_PROPOSAL (report-only; not applied)

```yaml
active_goal: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
status: implementation_reported_pending_main_review
control_baseline:
  commit: 4c4d2f3f397be7784700a2323c2afeaecbad03f0
  tree: f21b32938beaf638a68749aff28967d79aaa34a0
working_session_result:
  recommendation: PASS_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
  implementation_report: docs/reports/FINAL_CAPSTONE_G1_IMPLEMENTATION_REPORT.md
  closeout_draft: docs/reports/FINAL_CAPSTONE_G1_CLOSEOUT_DRAFT.md
  verification: 44_passed_0_failed_plus_typecheck
  credential_reads: 0
  network_calls: 0
  external_provider_calls: 0
  real_model_calls: 0
acceptance: pending_main_review
candidate_commit: null
next_authorized_control_point: Main review; optionally freeze Candidate and dispatch a focused independent audit
goal_2_authority: not_granted
```

**Recommendation:** Main should inspect the cited new symbols and raw admission identities, decide whether to freeze a Candidate and run the Contract’s risk-driven independent audit, and only then accept or return a bounded correction. This Working Session must not update `CURRENT_STATE.md` itself.
