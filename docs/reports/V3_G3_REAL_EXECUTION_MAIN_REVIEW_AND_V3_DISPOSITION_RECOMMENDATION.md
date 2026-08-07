# V3 Goal 3 Real Execution Main Review and V3 Disposition Recommendation

```yaml
status: main_review_complete_pending_user_acceptance
date: 2026-08-08
goal_id: V3_G3_SELECTIVE_REUSE_AND_PORTFOLIO_CLOSURE
implementation_baseline_commit: 74e7e73a07321f191d1b266ab8dd3cb94f66cade
implementation_baseline_tree: 15645b4d572bcc5f5fb8310bbf8bda8a78b1c17e
real_execution_session: 019fddc4-dcfd-7a53-88e0-e5433838a4d8
real_execution_evidence_disposition: ACCEPT_V3_G3_ONE_BOUNDED_REAL_PROMPT_ADDENDUM_RUN_AS_POSITIVE_MECHANISM_EVIDENCE
recommended_goal_3_disposition: PASS_V3_G3_SELECTIVE_REUSE_AND_BOUNDED_REAL_CLOSURE
recommended_v3_disposition: PASS_V3_HARNESS_STATE_ADAPTATION_WITH_SINGLE_REAL_PROMPT_PATH_LIMITATION
final_goal_3_acceptance: pending_user
final_v3_acceptance: pending_user
v4_authorized: false
```

## 1. Main decision

**Fact:** Main independently accepts the sole real Run as valid positive bounded
mechanism evidence. The Run started from the frozen Goal 3 Implementation
Baseline, consumed the exact promoted `prompt_addendum` through deterministic
selective binding, used public Direct Pi `AgentHarness`, changed only the allowed
Workspace source file, moved the same external Verifier from valid failure to
valid pass, and passed the existing independent Goal 3 Inspector.

**Recommendation:** Accept Goal 3 and V3 with the exact limited dispositions in
the header. No further real call, adaptive-Skill real closure, comparator,
independent audit or implementation correction is required for the accepted V3
Charter. This report does not itself perform final acceptance or authorize V4.

## 2. Independently rechecked evidence

| Check | Main result |
|---|---|
| Root baseline | commit `74e7e73a07321f191d1b266ab8dd3cb94f66cade`, tree `15645b4d572bcc5f5fb8310bbf8bda8a78b1c17e` |
| Tracked source/stage | clean; only five known untracked V3 Prompt/report files after this review |
| Pi | both checkouts clean at `027a5847901b5dde30270abaa1041046cd2b4b55` |
| Shared State | Gate B rerun passed; inventory digest `938a45f932f5276c1a21c94c2c004832e418db653abdc426d44dafecfddb3611` |
| Admission | registry `df7169506aae343b3b44b0c035df70d8460841032b3324ab9a7118a5110bb18b`; admission `e84521e199b503ff18e240ff87c715aeab02f2089a0d62e83e04182ee0fc41ef` |
| Pre-run Verifier | valid `failed`; output SHA-256 `e76a4ff8c48e21a0f3fa6794d68640b37b581a020c2e2ac5f89cf90909a4f34c` |
| Binding | exactly one `prompt_addendum`, no adaptive Skill; digest `b14d44a0b770c37b6b3c4b145d76ba20585d4901f46311c597bbffd9831d58ed` |
| Real execution | one Agent Run; 1 Credential read; 6 Provider/model requests; 12,291 tokens; 7 Tool calls; USD `0.0007371112` |
| Post-run Verifier | valid `passed`; output SHA-256 `34cecd1be329d673034a066bd29dbf68115c6455cb552d0d8f808920beb2247e` |
| Inspector | independently rerun by Main: `integrity_valid: true`, `errors: []`, pointer drift false |
| Workspace delta | only `src/parse-duration.ts`; all four protected files byte-identical |
| Evidence hashes | all ten report-indexed key Artifact hashes independently matched |
| Secret scan | accepted scanner over 14 runtime/report artifacts: passed, 0 matches |
| Retry/fallback/replacement/extra Case | `0 / 0 / 0 / 0` |

Manifest digest:
`347a44bfe905baa15fa2542196a2763f263833523a65cb4e0cd3672119891975`.

Runtime digest:
`99bb824f0bc2db438856aededae8c0d54039a3597171eb44ed829ce3ee2b1685`.

## 3. Execution-location clarification

**Fact:** The authority owner was the required fresh top-level no-source-edit
Session, but it placed reports and ignored execution evidence under Main
worktree `C:/Users/HUAWEI/.codex/worktrees/f873/project2`, rather than using its
automatically allocated `3772` worktree as the execution project root. This
occurred because the authoritative start Prompt was supplied by absolute path.

**Main classification:** non-blocking execution-location deviation.

It does not invalidate the evidence because:

- the actual execution root was the exact frozen commit/tree;
- tracked source and index were clean before and after;
- the Agent modified only its isolated ignored Workspace;
- the fresh Session still held execution/result authority and Main did not run
  the Agent task;
- shared State/Admission roots were read-only and unchanged;
- both Pi checkouts stayed clean;
- no competing writer or additional Run existed.

The Session report's phrase that the “fresh worktree lacked” the loader should
therefore be read as a setup observation, not as proof that the real Run used
the `3772` worktree. Final closeout should use the exact execution root stated
here and should not claim separate-worktree evidence isolation.

## 4. Charter and Definition-of-Done assessment

The implementation remains aligned with the accepted three-Goal Charter:

1. Goal 1 established evidence projection, typed Candidate and both staged State
   adapters, including one bounded real model-backed proposal.
2. Goal 2 established symmetric validation, Promote/Reject, immutable versions,
   stale protection, active pointer and rollback.
3. Goal 3 established admission, persistent active State, deterministic
   applicability, frozen subsequent-Run binding, both Direct Pi State paths,
   irrelevant non-binding, rollback/regression evidence and one real
   prompt-addendum closure.

V3 DoD items 1-19 are supported. Item 20 — Main and user acceptance of final
Portfolio claims — remains pending the user's decision. The deterministic/Faux
Goal 3 Cases exercise both `prompt_addendum` and `adaptive_skill` through real
Workbench/Public-Pi paths; only the prompt-addendum path has external-real-model
behavioral evidence. This matches the Charter's explicit “minimum one real
closure; second path is a soft target” rule and must remain a disclosed
limitation.

## 5. Allowed and forbidden claims

After user acceptance, the project may claim that it:

- projects external Verifier/Trace evidence into typed improvement Candidates;
- keeps model proposal authority separate from Harness mutation authority;
- validates State symmetrically before deterministic Promote/Reject;
- persists, versions, reloads and rolls back active Harness State;
- selectively binds an applicable promoted State into a subsequent Direct Pi
  Run while preserving external Verifier and authority boundaries;
- completed one bounded real prompt-addendum-first repair with an Inspector-valid
  evidence chain.

It must continue to state that:

- the single real Run has no unbound real comparator and proves no causality;
- adaptive-Skill external-real-model behavior remains untested;
- no general superiority, statistical significance or universal self-evolution
  is established;
- no Router, Memory/Policy platform, production durability, multi-writer store,
  OS sandbox or autonomous continual publishing exists.

## 6. Why no further V3 execution or audit is recommended

The Version Question is answered at the Charter's intended mechanism level. A
second real path is explicitly soft, while retry, replacement and extra Cases
were forbidden for this closure. Adding an adaptive-Skill real Run or comparator
now would improve breadth but would not be necessary to establish the bounded V3
Portfolio claim; it would instead reopen scope after the frozen evidence was
observed.

Main's read-only re-inspection found no concrete authority, State-lifecycle,
budget, secret, Pi-boundary or evidence-integrity finding. Therefore the
risk-driven independent-audit trigger is not met.

## 7. Required user decision and next controlled action

```yaml
user_decision_required:
  decision: accept_or_revise_Goal_3_and_V3_final_disposition
  evidence:
    - V3_G3_REAL_EXECUTION_REPORT.md
    - V3_G3_REAL_EXECUTION_CLOSEOUT_DRAFT.md
    - this_Main_review
  options:
    - accept_recommended_limited_PASS
    - request_wording_revision_without_new_execution
    - reject_final_acceptance
  recommendation: accept_recommended_limited_PASS
  consequence_if_accepted:
    - Main_updates_CURRENT_STATE_and_V3_Charter
    - Main_formalizes_Goal_3_and_V3_Closeout
    - Main_creates_V3_Closeout_Commit_only_after_explicit_commit_authority
    - active_goal_becomes_null
    - V4_remains_not_authorized
```

No control state has been changed and no Git staging or commit was performed by
this review.
