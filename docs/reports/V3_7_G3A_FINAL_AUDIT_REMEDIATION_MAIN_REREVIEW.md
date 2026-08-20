# V3.7 Goal 3A Final Audit Remediation Main Rereview

## Disposition

- **Fact:** `PASS_V3_7_G3A_FINAL_AUDIT_REMEDIATION_MAIN_REREVIEW`.
- **Fact:** Reviewed Candidate commit `a764749e0d7f0355cef06decdcd5541af62a8f2f`, tree `070ce4177ebacf0250aeedf2e0db38c842c1e8a4`, parent dispatch baseline `80b4172eae945349b993d598378116d6d42a374a`.
- **Fact:** This is the sole Candidate authorized by the final audit-remediation Amendment and changes exactly its five allowed paths.
- **Fact:** Goal 3A is not yet accepted. Goal 3B and real access remain locked pending fresh independent re-audit PASS and Main integration.

## Finding closure

### V37-G3A-EXAUDIT-P1-001

- **Fact:** `runRegression()` reloads the workflow registration and derives the real-access declaration from the Host-loaded Manifest.
- **Fact:** A real-declared Case now always supplies the exact `configuredPort` to `executeSymmetricValidationV3`; `regressionCandidatePass` can select the internal rejection adapter only for a non-real frozen deterministic Case.
- **Fact:** With the deterministic switch false, the supplied real-declared validation port ran both symmetric arms, produced promotion and advanced to `ready_for_follow_up`.
- **Fact:** A throwing supplied real-declared port was called once; the action failed, receipt count and stage stayed unchanged, and neither rejection nor promotion artifact appeared. No fallback ran.
- **Fact:** The frozen deterministic negative route still reaches the honest `candidate_rejected` terminal.

### V37-G3A-EXAUDIT-P2-002

- **Fact:** The temporary real-Case helper now creates one tracker before its four mocks. All four mocks close over that exact tracker and record local invocation through `recordLocalMock`.
- **Fact:** The tracker separates local mock invocations from an explicit actual-external-operation boundary. The local mocks contain only deterministic V2/Faux/filesystem/verifier behavior and never invoke the external-operation recorder.
- **Fact:** The complete route records local calls `primary=1`, `candidate_proposal=1`, `regression_validation=2`, `follow_up_runtime=1`; actual Credential/network/Provider/model counts remain `0/0/0/0`.
- **Fact:** Formal simulated Manifest counter tuples remain separately labelled and are not used as actual-operation evidence.

## Main verification

All commands ran serially from `workbench/`.

| Verification | Main result |
|---|---|
| G3A authority/Product/HTTP | PASS, 22/22 |
| accepted G1/G2 | PASS, 25/25 |
| V2 | PASS, 11/11 |
| V3 | PASS, 19/19 |
| V3.6 Product/HTTP/change handoff | PASS, 10/10 |
| authorized existing TypeScript compiler | PASS, zero diagnostics |
| exact `npm run typecheck` wrapper | unavailable because its fixed ignored worktree compiler path is absent |
| G3A demo smoke | PASS; loopback start/stop, project and Docker commands `0` |
| parent/tree, one-Candidate rule, five-path allowlist and Candidate `diff --check` | PASS |
| thirteen accepted v1 hashes and config/fixture preservation | PASS |

- **Fact:** The user-owned untracked `docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md` remains outside the Candidate and this Main control commit.
- **Fact:** No new issue meets the accepted must-fix threshold.

## Re-audit freeze recommendation

- **Recommendation:** Freeze `a764749e0d7f0355cef06decdcd5541af62a8f2f` / tree `070ce4177ebacf0250aeedf2e0db38c842c1e8a4` as the immutable final Goal 3A re-audit Candidate.
- **Recommendation:** A fresh independent read-only Session must re-run the P1 bypass repro against both real and deterministic declarations, inspect tracker wiring and counter separation, rerun affected regressions and confirm the exact Candidate identity/allowlist before any Goal 3A acceptance.

