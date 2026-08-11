# V3.6 Goal 2 Deterministic Acceptance Report

```yaml
status: passed_execution_baseline_ready
goal: V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
control_baseline: 992f721c4f05b7c78761966c7b8f79a6b4b3a2d3
initial_implementation_commit: 20dbe4c11aa5b1a64d75dfa63b6893536adb021f
corrected_implementation_commit: 5ec7d2b0e81e54e2c8a73200e39f45ba631b244f
corrected_implementation_tree: 830fa2e28b6052c106f29252fdc6a1af5f1c9980
focused_audit_report_commit: f93e9d55ff4cdafd32d794c5bee9a1dc0892f942
focused_audit_disposition: PASS_V3_6_G2_FOCUSED_AUDIT
execution_baseline: 781e95211e7cc6beb572c50ec18e36e0a952b1f9
execution_baseline_tree: 6a54c220d7286560d6e4e0ea52f34c39fb5718ae
real_journey_status: not_started
disposition: PASS_V3_6_G2_DETERMINISTIC_SUBSTRATE
```

## Main disposition

Main accepts the corrected Goal 2 implementation as the deterministic substrate for the
single frozen real product Journey. This is not yet final Goal 2 or V3.6 acceptance.

The candidate now provides the Contract-defined single Docker registered-command path,
immutable terminal evidence, managed-copy bounded edits, current-head-bound immutable
ChangeSet, safe review, Host-only Apply/Discard/Export, truthful partial-apply material,
one-successful-Apply Session terminalization, and a tracked two-Turn product entry.

## Evidence accepted

- Dedicated implementation and bounded correction commits are exact descendants of the
  Goal 2 Control Baseline.
- Strict TypeScript passed.
- The dedicated implementation Session reported 79/79 Contract-focused and affected
  regressions passing with zero failures and zero skips.
- Main reran `npm run v36g2:test`: 15/15 passed, including real Docker execution,
  timeout/descendant termination, exact-name cleanup, current-head Change Handoff,
  final-response budget enforcement and product-entry preflight.
- Main's exact-name container remainder query returned zero Goal 2 containers.
- Main executed the tracked product entry end-to-end with a Faux provider: two Turns in
  one persistent Session, Docker commands, frozen Verifier, non-empty ChangeSet and
  Host-controlled Apply completed with zero Credential, network or external-model access.
- The fresh focused audit found no Contract-local defect and recommended
  `PASS_V3_6_G2_FOCUSED_AUDIT`. Its Docker runtime evidence is correctly attributed to
  Main-assisted host execution rather than independent audit execution.
- The 14-file correction delta secret scan found zero matches. Pi remained pinned and
  clean, and the implementation did not modify control state.

## Accepted limitations

This acceptance does not claim a real-model Journey, process-crash recovery,
multi-file atomicity, automatic rollback, exactly-once effects, arbitrary-project
compatibility, protection from Docker/Host compromise, a second backend or Host command
fallback. Those limits remain binding for the final claim.

## Next authorized step

Freeze the exact resulting Execution Baseline and launch one fresh top-level,
no-source-edit Product Acceptance Session. It may execute only the Contract's two fixed
prompts in one Session, use the existing opaque DeepSeek Credential within the frozen
limits, run Docker with `--network none`, and perform the single frozen Apply path. It
must not retry, fall back, replace, add another task or edit runtime/evidence semantics.
