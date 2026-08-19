# V3.7 Goal 1 Closeout

```yaml
goal: V3_7_G1_REGISTERED_RECOVERY_EVIDENCE_BRIDGE
status: CLOSED_ACCEPTED
disposition: PASS_V3_7_G1_REGISTERED_RECOVERY_EVIDENCE_BRIDGE
accepted_candidate_commit: 7261226904a1c7c1414b0aed7927fc5ebd92c86a
accepted_candidate_tree: bcb6dfc77bef4b9330b10a4ab6dc3b13de095180
integrated_main_commit: ad8b02f497c8468e30bce50650ed1922a401088f
integrated_main_tree: e5bf8959f3cb5f283c47721b12f6d1475dffc95a
goal_2_unlocked: true
```

## Acceptance

Main accepts Goal 1 under the amended Charter contract. The registered recovery bridge
now binds Primary Run identity to workflow registration before execution, derives
registry authority independently of caller runtime roots, verifies frozen Task/Source/
Verifier content and exact registered candidate-template content, and preserves accepted
historical Artifacts only through read-only reopen when the Manifest is disabled.

The three findings raised by the first focused audit were corrected under the accepted
one-time audit-remediation amendment, passed Main preliminary review, and passed a fresh
independent read-only re-audit. The source/config/test bytes integrated in Main are the
same bytes as the immutable audited candidate; subsequent Main changes are control and
closeout records only.

## Deliverables and evidence

- Implementation report: `docs/reports/V3_7_G1_IMPLEMENTATION_REPORT.md`
- Main remediation review: `docs/reports/V3_7_G1_AUDIT_REMEDIATION_MAIN_REVIEW.md`
- Independent remediation re-audit:
  `docs/reports/V3_7_G1_AUDIT_REMEDIATION_REAUDIT.md`
- Historical failed audit and superseding amendment remain preserved for traceability.

Verification completed:

- three original blocking reproductions: 3/3 passed;
- Goal 1 focused suite: 14/14 passed;
- V2-A, V3 Goal 1 and V3 Goal 2 regressions: 24/24 passed;
- Final Capstone G1/G2 inherited-loader regressions: 34/34 passed;
- aggregate independent re-audit checks: 75/75 passed;
- strict seven-entry TypeScript: zero diagnostics;
- 720-file frozen snapshot inventory: zero missing and zero digest mismatch;
- Amendment allowlist: exact 11/11; Schema 2 guard: 5/5 paths absent.

## Remaining qualifications

The isolated worktrees do not contain the ignored Node type package required by the
literal full-repository TypeScript command. Parent-only spawned Capstone commands also
retain the documented loader-resolution limitation. Equivalent strict compilation and
inherited-loader suites passed, so no Goal 1 product assertion remains unverified.

Credential reads, network calls, external Provider/model calls, Docker product work,
dependency installation and Pi access were zero.

## Final decision

Goal 1 is closed and accepted. Goal 2 is unlocked, but may begin only through the fresh
dedicated Goal 2 Implementation Session and its Main-frozen exact allowlist/test list.
Goal 3A and Goal 3B remain locked.
