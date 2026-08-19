# V3.7 Goal 1 Audit Remediation Main Review

~~~yaml
status: PASS_MAIN_PRELIMINARY_REVIEW
goal: V3_7_G1_REGISTERED_RECOVERY_EVIDENCE_BRIDGE
amendment: V3_7_G1_AUDIT_REMEDIATION_AMENDMENT.md
reaudit_candidate_commit: 7261226904a1c7c1414b0aed7927fc5ebd92c86a
reaudit_candidate_tree: bcb6dfc77bef4b9330b10a4ab6dc3b13de095180
candidate_parent: 0cf5b81976880d57a8b09bbd3f87be68853cbb3b
source_change_after_freeze: forbidden_without_new_user_control_decision
reaudit_authorized: true
goal_1_accepted: false
goal_2_started: false
~~~

## Main result

Main independently verified the exact candidate identity, parent, clean implementation
worktree, eleven-file Amendment allowlist, configuration-digest chain and source/test
delta. The implementation addresses the three failed-audit findings at their authority
boundaries:

- Primary Run by-ID/by-root indexes now live below one fixed loader/Manifest-derived Host
  authority root, independent of caller dataRoot. Binding identity includes the authority
  ID/location and workflow-local binding must equal both Host-global indexes.
- Candidate prompt content is no longer accepted through semantic token thresholds. The
  Manifest registers a finite exact generic prompt-addendum template inventory; the
  Candidate edit identity, bytes and digest must match a registered template. Frozen
  Task/Source/Verifier recomputation and static authority indicators remain additional
  checks.
- Formal recovery artifacts are resolved component-by-component from the trusted data
  root through workflow/recovery to the final file. Intermediate junction/symlink/reparse
  paths and nonordinary/hardlinked files are rejected on persist, admit, recompute and
  historical reopen.

No task/source/verifier bytes, State scope, provider/tool/command/budget/stop profile,
old V2/G1/V3/G2 module, Pi path, Schema 2 path or Goal 2 behavior changed.

## Independent Main verification

| Check | Result |
|---|---|
| Goal 1 focused including three audit repro classes | PASS, 14/14 |
| V2-A + V3 G1 + V3 G2 regressions | PASS, 24/24 |
| Final Capstone G1 with inherited fixed loader | PASS, 24/24 |
| Final Capstone G2 with inherited fixed loader | PASS, 10/10 |
| viable local-loader matrix | PASS, 72/72 |
| strict seven-entry TypeScript | PASS, 0 diagnostics |
| exact identity/parent, eleven-file allowlist and diff check | PASS |

The exact full-repository TypeScript command remains environment-stopped at TS2688
because this isolated worktree lacks ignored Node declarations. Parent-only Capstone
commands still have the known spawned-child loader limitation; identical inherited-loader
runs pass completely. No product assertion failed.

Credential, network, external Provider/model, Docker and dependency-install access were
zero. Main used only local deterministic tests and ignored temporary evidence.

## Disposition

Main preliminary review passes. Commit
7261226904a1c7c1414b0aed7927fc5ebd92c86a / tree
bcb6dfc77bef4b9330b10a4ab6dc3b13de095180 is frozen as the immutable Goal 1 re-audit
candidate. Goal 1 remains unaccepted and Goal 2 remains locked until a fresh independent
read-only re-audit passes.
