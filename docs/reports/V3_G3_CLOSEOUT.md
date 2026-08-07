# V3 Goal 3 Closeout — Selective Reuse and Bounded Real Closure

```yaml
status: closed_accepted
date: 2026-08-08
goal_id: V3_G3_SELECTIVE_REUSE_AND_PORTFOLIO_CLOSURE
disposition: PASS_V3_G3_SELECTIVE_REUSE_AND_BOUNDED_REAL_CLOSURE
accepted_by_user: 2026-08-08
zero_call_implementation_session: 019fdd6c-7f5d-79c0-98d6-6fb261d689a3
real_execution_session: 019fddc4-dcfd-7a53-88e0-e5433838a4d8
implementation_baseline_commit: 74e7e73a07321f191d1b266ab8dd3cb94f66cade
implementation_baseline_tree: 15645b4d572bcc5f5fb8310bbf8bda8a78b1c17e
real_run_id: v3-g3-real-prompt-addendum-parse-duration-run-01
real_run_manifest_digest: 347a44bfe905baa15fa2542196a2763f263833523a65cb4e0cd3672119891975
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patches: 0
active_goal_after_closeout: null
V4_authorized: false
```

## 1. Accepted outcome

Goal 3 is accepted. It proves that a promoted Harness State can persist across
independent Runs, be selected by deterministic applicability, freeze exact
State/admission/decision/version lineage at Run start, bind through public Direct
Pi and produce independently inspectable outcome evidence.

The accepted zero-call substrate contains:

- immutable Candidate admission into the current accepted State lineage;
- independent write-once Case Authority;
- project-persistent active State and historical binding;
- relevant binding and explicit irrelevant non-binding;
- public Direct Pi `prompt_addendum` and `adaptive_skill` paths;
- Manifest/runtime/Verifier/Inspector cross-checks;
- four behavioral/regression Cases covering all three Trigger families,
  prior-pass regression, Reject, rollback and irrelevant task behavior.

Main verified strict TypeScript, Goal 3 8/8, Goal 1 regression 13/13 and Goal 2
regression 6/6 before freezing the Implementation Baseline.

## 2. Accepted real behavioral evidence

The one authorized real `prompt_addendum` Case used the frozen broken
`parse-duration` Workspace:

```text
same frozen external Verifier: failed
  -> exact promoted prompt State selected
  -> prompt addendum frozen into Direct Pi AgentHarness Run
  -> only src/parse-duration.ts changed
  -> same external Verifier: passed
  -> Inspector: integrity_valid, no errors
```

```yaml
agent_runs: 1
credential_reads: 1
provider_requests: 6
network_calls: 6
external_provider_calls: 6
real_model_calls: 6
input_tokens: 10787
output_tokens: 1504
total_tokens: 12291
tool_calls: 7
cost_usd: 0.0007371112
retry: 0
fallback: 0
replacement: 0
extra_cases: 0
pre_run_verifier: failed_valid
post_run_verifier: passed_valid
inspector: integrity_valid
pointer_drift: false
```

Shared State inventory remained
`938a45f932f5276c1a21c94c2c004832e418db653abdc426d44dafecfddb3611`.
Tracked source and both pinned Pi checkouts remained unchanged. Main independently
reran the State Gate and final Inspector, matched all ten key Artifact hashes and
passed a 14-file secret scan with zero matches.

## 3. Execution-location deviation

The execution authority belonged to the required fresh top-level no-source-edit
Session, but that Session wrote the reports and ignored execution root under the
Main worktree rather than using its automatically allocated separate worktree.

This is accepted as a non-blocking location deviation because the actual root was
the exact frozen commit/tree, tracked source was clean, the Agent operated only
inside an isolated ignored Workspace, State and Pi were unchanged and no
concurrent writer existed. The project must not claim that this real Run had
separate-worktree evidence isolation.

## 4. Claim boundary

This Goal supports the claim that selective promoted-State binding was consumed
by one real Direct Pi coding Run and produced a valid passing result.

It does not prove:

- that the prompt addendum caused the repair;
- superiority over an unbound real comparator;
- real-model adaptive-Skill effectiveness;
- statistical or cross-task improvement;
- production durability or multi-writer State semantics.

The `adaptive_skill` path retains deterministic public-Direct-Pi mechanism
evidence. Its second external-real-model closure was a Charter soft target and is
deferred rather than required for this accepted bounded closeout.

## 5. Deferred usability and reliability work

The following are deliberately preserved for future planning and do not reopen
Goal 3 automatically:

1. persist the complete Pi Session/message/Tool-event trace for a real V3 Run,
   rather than only Session ID, counters, digests, Workspace and outcome evidence;
2. let one Inspector command independently derive trusted failure lineage from
   the saved pre-run Verifier Artifact;
3. strengthen privacy-preserving proof that the frozen composed prompt reached
   the real Provider payload without persisting sensitive payload content;
4. replace the current ignored single-writer ordinary-file State prototype only
   if a future product requirement needs crash durability, locking or multi-process
   writers;
5. optionally exercise the `adaptive_skill` path on another real coding task in
   a future authorized version, without rewriting this V3 result.

## 6. Preserved evidence

- `docs/reports/V3_G3_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_G3_REAL_EXECUTION_REPORT.md`;
- `docs/reports/V3_G3_REAL_EXECUTION_MAIN_REVIEW_AND_V3_DISPOSITION_RECOMMENDATION.md`;
- ignored `.runs/v3-g3/shared-authority/` State/admission evidence;
- ignored `.runs/v3-g3-real-execution/` real Run evidence.

No further V3 execution, Credential/network/model access, source correction, Pi
modification or V4 work is authorized after this closeout.
