# Post-V3.6 ES-N03 Tool-accounting Terminalization — Affected-Finding Recheck

```yaml
scope: original_focused_audit_hit_item_recheck_only
affected_findings:
  - POST-V3.6-ES-N03-AUDIT-P1-001
  - POST-V3.6-ES-N03-AUDIT-P3-002
corrected_candidate_audit_baseline_commit: 6df87e2a4711fd6b3b0b61a6aa720f35815a70ff
corrected_candidate_audit_baseline_tree: ae34aa9744726220c03959f5f708913dafe41577
main_owner_record_commit: 8f14e714987eda969c12345e0ee90698fcef1db4
correction_source_commit: 79e74f2b7c1801c5b9001633aebf82c03bd5d734
main_integration_commit: 958c09cd35ffe99eb32103fb72424a600d394439
disposition: PASS_AFFECTED_FINDINGS
```

## Identity and bounded scope

**Fact:** authoritative Main worktree `HEAD` was owner-record commit `8f14e714…` and
tracked clean. Corrected baseline `6df87e2a…` had exact tree `ae34aa974…`.
`6df87e2a…` is the parent of `8f14e714…`; their delta contains only
`CURRENT_STATE.md`, Campaign Status and the maintenance Contract. Workbench delta was
empty.

**Fact:** correction source `79e74f2b…` came from the separate implementation history,
so it is not a graph ancestor of Main integration `958c09cd…`. Their stable patch IDs
were identical: `c4ca3333c438abadf472226acafbb73435636b4a`. Both change exactly the
same two reports, `persistent-session-v36.ts` and the focused finite-budget test.

No original-audit area outside P1-001/P3-002 was reopened.

## P1-001 recheck — PASS

**Fact:** `reconcileFiniteBudgetTerminalSession()` now iterates every schema-4
`registered_tool_attempt_ids` member and requires both the persisted call and persisted
result to exist and have equal `toolName` values
(`workbench/src/session/persistent-session-v36.ts:583-586`). The existing rejected-domain
name/error binding remains separate at lines 588-591.

**Fact:** the targeted regression rewrites registered result `read-1` from
`workspace_read` to `workspace_list`, recomputes `session_entries_sha256_at_terminal`
over Session entries and recomputes `terminal_digest`, then proves fresh reopen rejects
with `registered Tool call/result name binding`
(`workbench/tests/v36-finite-budget-terminalization.test.ts:239-259`). This covers a
digest-recomputed semantic mismatch rather than only a stale-digest rejection.

**Main-executed evidence:** Main independently ran the exact targeted schema
compatibility/nominal command on the corrected Main tree; it exited `0`, with `9/9`
passing:

```text
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test \
  --test-concurrency=1 \
  tests/v36-finite-budget-terminalization.test.ts \
  tests/v36-budget-stop-terminalization.test.ts
```

It passed schema-1/schema-2 Provider terminals, ordinary schema-3 finite terminals,
nominal schema-4 unavailable/pre-hook accounting and the digest-recomputed P1 negative.
Main subsequently ran strict TypeScript and browser syntax checks; both exited `0`.
These dynamic results are Main-executed evidence and are not claimed as independent
Audit Session execution.

## P3-002 recheck — PASS

**Fact:** the two Closeout Draft trailing spaces identified by P3-002 are absent in the
corrected candidate.

**Fact:** whole corrected candidate whitespace verification exited `0`:

```text
git diff --check \
  856dfa066b34a477e7e7aea92b3c2ed8dfc4734c \
  6df87e2a4711fd6b3b0b61a6aa720f35815a70ff
```

## Access and final disposition

```yaml
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_tasks_run: 0
product_source_or_test_edits: 0
control_state_edits: 0
git_commits: 0
```

This recheck independently verified baseline/tree/clean identity, patch-id equivalence,
the corrected source/test semantics and whole-candidate `diff --check`. It performed no
real access and does not claim independent execution of Main's targeted, TypeScript or
browser-syntax commands. The only tracked write by this recheck is this report.

`PASS_AFFECTED_FINDINGS`

`MAIN_DISPOSITION_REQUIRED`

