# V3.7 Goal 2 Main Preliminary Review

```yaml
status: FAIL_MAIN_PRELIMINARY_REVIEW
goal: V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE
candidate_commit: 584d233e31485d1bd87a7392ddc361200477ecf6
candidate_tree: 3177f7303e82c0f774e4078773ed1669d65853f6
candidate_parent: 55f8caf17a7b118e68f2f2a18961da351c8b6990
focused_audit_started: false
goal_2_accepted: false
goal_3_started: false
```

## Result

Main verified the exact ten-path candidate and independently reproduced the focused
suite at 8/8. The positive deterministic chain works, Goal 1 configuration is unchanged
and the implementation Session's reported regressions/TypeScript results are credible.
The candidate nevertheless fails preliminary review because four contract boundaries
are not yet closed.

## Findings

### V37-G2-MAIN-P1-001 — State scope and promotion lineage are not authoritative

The new canonical value carries `state_store_scope_digest`, but
`state-feedback-g2.ts` never compares it with the caller-supplied `stateRoot` or the
Manifest-configured canonical location. Main copied the valid Store to another project-
contained location and the V3.7 assessment still returned `retain`:

```json
{"accepted_clone_scope":true,"result":"retain"}
```

The focused fixture also writes accepted State version, promotion Decision and active
pointer files directly. The follow-up Inspector checks their internal fields but does
not inspect the referenced promotion validation against the Candidate/staged State.
This permits a syntactically consistent manufactured promotion lineage and does not
prove the Charter Section 4.5 single-scope invariant.

### V37-G2-MAIN-P1-002 — Actual execution-profile equality is not observed

The schema-3 application-layer observation contains prompt/binding/authority identities
but none of the effective Provider, Tool, Command, Budget or Stop digests. It also omits
computed identities of the actual `taskPolicy` and `budgetProfile` supplied to
`executeBoundedTurn`. The settled Manifest records zero commands, so its command evidence
cannot establish the frozen command profile either. Binding/Evidence merely repeat the
registered values; the Inspector cannot prove equality with the V3.6 call inputs.

### V37-G2-MAIN-P1-003 — G2 decision logic is not actually canonical for V3.7

`state-feedback-g2.ts` evaluates fresh comparison/rollback only when
`legacyAdmission` is present. A negative V3.7 canonical input therefore cannot reach the
same strict immediate-parent/current comparison and rollback decision, regardless of
valid attribution. This changes semantics by source family instead of consuming one
canonical normal form as required by Charter Section 6.7.

### V37-G2-MAIN-P2-004 — Required historical and negative coverage is incomplete

The disabled-registration test creates only a workflow and profile, disables the Case,
and reloads the profile. It does not reopen a fully accepted follow-up binding, runtime,
Verifier, Outcome, Evidence, request and admission. The focused suite also does not
exercise honest formal negative/missing/invalid Verifier/Outcome handling. Its title and
the implementation report overstate the tested historical boundary.

## Independent checks

| Check | Result |
|---|---|
| exact identity, parent and ten-path allowlist | PASS |
| focused Goal 2 suite | PASS, 8/8 |
| copied-State-scope assessment repro | FAIL as expected; clone incorrectly accepted |
| runtime observation profile inventory | FAIL; five effective profile digests absent |
| Goal 1 config diff / Schema 2 guard | PASS |

No Credential, network, external Provider/model, Docker product, dependency installation
or Pi access occurred. Main's repro evidence is ignored under `.runs/v37/g2-main-review`.

## Disposition

Candidate `584d233e...` / `3177f730...` is preserved and is not an audit candidate.
Correction round 1 is required in the original dedicated implementation Session. Goal 2
remains unaccepted and Goal 3 remains locked.
