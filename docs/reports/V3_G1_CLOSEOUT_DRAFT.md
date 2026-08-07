# V3 Goal 1 — Closeout Draft

Date: 2026-08-08
Goal: `V3_G1_EVIDENCE_TO_CANDIDATE_STATE`  
Status: bounded real proposal passed; Main/user acceptance pending
Draft disposition: `PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE_PENDING_MAIN_ACCEPTANCE`

## 1. Draft disposition

**Fact:** The dedicated Goal 1 Session implemented and verified the complete currently authorized zero-call tranche. Three evidence triggers, the real frozen-check repeated-failure mechanism, evidence-linked Diagnosis/Lesson/Candidate formation, deterministic production, a Faux-tested bounded proposal adapter, strict host validation, two distinct real staged adapters, immutable reloadable State, and focused security tests are present.

**Fact:** After one combined Main-review correction, final verification passed strict TypeScript, 13/13 Goal 1 focused tests, 18/18 relevant V1-A regressions, 10/10 relevant V2-A recovery/post-audit regressions, Pi public runtime/type smokes, State reload/digest checks, and protected-file identity checks.

**Fact:** `G1-MAIN-001` is corrected: trusted-base prompt recomputation rejects a forged `composed_prompt_sha256`, and Skill reload rejects forged `disable_model_invocation` / `invocation_mode` even after the copied State's public wrapper identity is validly rebased. `G1-MAIN-002` is corrected: future-target canonical boundary preflight runs before any `mkdir`, and rejected workspace/accepted-base targets leave no directory, byte, or inventory residue.

**Fact:** The later bounded authorization was consumed exactly once: Credential reads 1, external requests 1, Provider calls 1, real-model calls 1, retries/fallbacks/replacements 0. DeepSeek `deepseek-v4-flash` returned direct JSON with one evidence-linked `prompt_addendum`; the existing host producer accepted it without repair or authority relaxation.

**Fact:** Candidate `candidate-48ee92898bdb1eeedfc33956a67725f0` (digest `48ee92898bdb1eeedfc33956a67725f030bae04d042238af147c30348379c7f4`) was staged as reload-equal inactive State `efbaf666637726231d3c3765a23bf579ebb6f2698dd6e8332904e0db938953d9`. Conservative cost was USD 0.0002016 against the USD 0.20 cap.

**Fact:** Pi, source, tests, fixtures, accepted base, active state, control files, and Git index/history were not changed by the real execution. Goal 2 and Goal 3 were not entered.

**Recommendation:** Main/user may now perform the finite Goal 1 acceptance review. This draft does not itself accept Goal 1 or create any later-Goal authority.

## 2. Exit summary

| Exit item | Draft result |
|---|---|
| Three deterministic Trigger fixtures | PASS |
| Real frozen repeated-check cycle | PASS |
| Immutable evidence provenance for Diagnosis/Lesson/Candidate | PASS |
| Deterministic producer | PASS |
| Bounded model-backed adapter with Faux valid/malformed output | PASS for zero-call mechanism |
| Real bounded model-backed proposal | PASS; exactly one request, direct JSON, host validation accepted |
| Real `prompt_addendum` Candidate | PASS; Candidate digest `48ee92898bdb1eeedfc33956a67725f030bae04d042238af147c30348379c7f4` |
| Real staged State | PASS; `staged_inactive`, reload equal, digest `efbaf666637726231d3c3765a23bf579ebb6f2698dd6e8332904e0db938953d9` |
| Authority/cost boundary | PASS; 1/1/1/1, zero retry/fallback/replacement, USD 0.0002016 |
| Prompt addendum staged State | PASS; State digest `330310751aede212be7cc792488c3644d87663d3f6906fac41c3e5bee199bc4e` |
| Adaptive Skill staged State | PASS; State digest `37c284ade18042e4b83e3c40af12ec2da6f7e846e7d26449d46a8dbd10c32d86` |
| Malformed/stale/authority proposal fail closed | PASS |
| Whole-Candidate atomic rejection | PASS |
| State exact-key/inventory/link/hardlink/write-once boundary | PASS |
| Main prompt derived-field repro | PASS: `PROMPT_TAMPER_REJECTED` |
| Main Skill authority-field repro after wrapper rebase | PASS: `SKILL_FLAGS_TAMPER_REJECTED` |
| Main prohibited-root residue repro | PASS: `BOUNDARY_REJECTED_NO_RESIDUE`; target absent |
| Accepted base and active bytes unchanged | PASS |
| Candidate not promoted | PASS; only `staged_inactive` exists |
| Goal 1 final acceptance | NOT CLAIMED |

## 3. Verification and evidence

| Check | Result |
|---|---|
| strict TypeScript through pinned emitted compiler | exit 0 |
| `npm --prefix workbench run v3g1:test` | exit 0; 13/13 |
| V1-A focused regression | exit 0; 18/18 |
| V2-A recovery/post-audit regression | exit 0; 10/10 |
| public Pi runtime/type smoke | exit 0 |
| zero-call State generation/reload | exit 0; both reload equal and inactive |
| final identity/status/diff checks | exit 0; protected blobs equal, staged diff empty, Pi clean |
| authorized real-proposal runner | exit 0; disposition `PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE_PENDING_MAIN_ACCEPTANCE` |
| post-execution strict TypeScript | exit 0 |
| post-execution Goal 1 focused suite | exit 0; 13/13, zero skipped |

Canonical corrected raw summary: `.runs/v3-g1/evidence/main-review-correction-20260807-01/evidence-summary.json`. It records both Main tamper repros as rejected, the prohibited-root target as absent, two valid inactive State reloads, protected identities, and all real-access counters as zero. Detailed source delta, commands, development/Main-review repairs, artifact identities, and protected/Pi checks are in `docs/reports/V3_G1_IMPLEMENTATION_REPORT.md`.

Authoritative real-proposal evidence: `.runs/v3-g1/real-proposal/v3g1-real-proposal-20260808-02/`. Its `evidence-index.json` SHA-256 is `0f9d62c976546a2364121cb65d467e3d0f591b65154f3cced64da6672c557373`; `execution-result.json` records the exact counters, usage/cost, protected identity, Candidate and State identities. The safe Provider response contains no Credential or reasoning payload. The preserved pre-dispatch runner-digest failure is `.runs/v3-g1/real-proposal/v3g1-real-proposal-20260808-01/execution-failure.json` with all authority counters zero. Exact command/exit evidence is supplemented at `.runs/v3-g1/real-proposal/v3g1-real-proposal-20260808-02-post-verification/evidence-index.json` (SHA-256 `d4bfb10a5c41b9bb2a16612687bd516a2e80058c7434e468173b38c98a7de8ef`).

## 4. Source and authority boundary

The frozen Candidate Baseline contains only the previously reviewed eight authorized Workbench product/test paths plus this Closeout Draft and the Implementation Report. The bounded real execution changed no tracked source/test/fixture/control path; its only tracked post-execution edits are these two reports. `AGENTS.md`, `CURRENT_STATE.md`, the Charter, authority rules, accepted reviews/Closeouts/fixtures, accepted base prompt, accepted V1 Skill, Pi source/emitted artifacts, and references remain unchanged. No files are staged and no commit exists.

The implementation contains no comparator, Promotion/Reject decision, active pointer, rollback, selective binding, Goal 2/3 runtime, alternate State kind, router, repository, daemon, subagent, SDK/Extension/RPC route, Verifier change, or authority-plane edit.

## 5. Remaining gate and stop

The single real-call authority has been consumed and is not reusable. Only Main/user finite acceptance remains. This draft grants no further Credential/network/Provider/model call, promotion/reject decision, active binding, commit, Goal 2, or Goal 3 authority. The Session stops now.

## 6. CURRENT_STATE_UPDATE_PROPOSAL

For Main review only; `CURRENT_STATE.md` was not modified.

```yaml
active_goal: V3_G1_EVIDENCE_TO_CANDIDATE_STATE
goal_1_zero_call_candidate: ready_for_main_review
goal_1_bounded_real_proposal: pass_pending_main_acceptance
goal_1_disposition: PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE_PENDING_MAIN_ACCEPTANCE
goal_1_final_acceptance: pending_main_user_acceptance
credential_reads_observed: 1
external_network_calls_observed: 1
provider_calls_observed: 1
real_model_calls_observed: 1
retry_fallback_replacement_observed: 0
real_candidate_id: candidate-48ee92898bdb1eeedfc33956a67725f0
real_state_digest: efbaf666637726231d3c3765a23bf579ebb6f2698dd6e8332904e0db938953d9
real_state_status: staged_inactive
accepted_base_mutated: false
active_state_mutated: false
git_staged_or_committed: false
goal_2_authorized: false
goal_3_authorized: false
```

`PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE_PENDING_MAIN_ACCEPTANCE`
