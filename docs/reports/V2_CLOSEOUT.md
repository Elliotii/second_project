# V2 Version Closeout — Failure-aware Bounded Two-path Recovery

```yaml
status: closed_accepted_with_explicit_limitation
closeout_date: 2026-08-07
version: V2
v2_a: closed_accepted_PASS_V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
v2_b: closed_user_accepted_mechanism_proven_negative_incomplete
version_disposition: ACCEPT_V2_MECHANISM_EVIDENCE_WITH_NEGATIVE_INCOMPLETE_LIMITATION
active_goal_after_closeout: null
v3_status: candidate_not_authorized
```

## Version conclusion

V2 is closed by explicit user decision. It delivered the deterministic recovery
substrate in V2-A and then exercised its central two-path mechanism with a real model
in V2-B R2.

The strongest accepted statement is:

> From one immutable controlled verifier-failed Recovery Seed, the Workbench created
> two byte-isolated Candidate Workspaces, varied parent Session history as the main
> treatment delta, ran both with the real Provider route, independently verified
> both, and deterministically selected an eligible Candidate.

Candidate A retained the failed parent Session history; Candidate B began with a
fresh Session. Both passed, and the frozen Selector selected A. This demonstrates
the bounded recovery mechanism on one controlled Case; it does not establish general
path superiority.

V2's real Negative did not reach its Verifier, so the initial-pass/no-branch half of
the frozen Version Question remains unverified in real execution. The user accepts
that explicit limitation to close the Version without another R2 run.

## V2-A contribution

V2-A closed with `PASS_V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE` and established:

- immutable `RecoverySeed` and `RecoveryGroup` identities;
- two isolated Candidate paths from identical failed Workspace bytes;
- public Pi JSONL Session fork and fresh-session semantics;
- parent/session/workspace lineage and write-once evidence;
- independent Verifier results;
- hard-gate-first deterministic Selection or explicit none;
- budget, protected-path and Inspector boundaries;
- deterministic initial-pass/no-branch behavior;
- zero Pi Core patches and zero private imports.

Its final independently audited Candidate remains
`de6d30c896079c6ae1164646ae55ead8e6a33c09`.

## V2-B contribution

V2-B added the thin real Provider/Model/Tool/Session composition without replacing
the V2-A Controller. After R1 and the first R2 sequence exposed bounded evidence
defects, the audited baseline `571165a186444e16a0fafad2fcd886295d7efbab`
executed the authoritative context-corrected R2 sequence.

That sequence proved:

- controlled failed Seed creation through Direct public Pi lifecycle;
- identical Seed Workspace bytes for A/B;
- retained-history versus fresh-session treatment separation;
- real Provider/model execution on both paths;
- common Verifier pass for both Candidates;
- deterministic selection of A;
- exact identity, usage, cost and terminal reconciliation;
- fail-closed stopping when the mandatory Negative lacked valid evidence.

It did not prove the real Negative no-branch condition. V2-B therefore closes with
partial accepted mechanism evidence, not a Contract PASS.

## Version Question answer

| Question component | Answer |
|---|---|
| Freeze an immutable verifier-failed Seed | yes, controlled real-lifecycle Seed |
| Create exactly two isolated Candidates | yes |
| Keep failed Workspace bytes identical | yes |
| Make parent Session history the primary treatment delta | yes |
| Independently verify both Candidates | yes; both passed |
| Deterministically select eligible Candidate or none | yes; selected A |
| Create no Candidate when real initial result passes | unverified; Negative lacked Verifier result |

Overall answer: **mechanism demonstrated, real Negative incomplete**.

## Portfolio claims

The project may accurately claim that it implements a bounded, evidence-backed
two-path Coding Agent recovery mechanism that can fork a failed run into retained-
history and fresh-session candidates, verify them and select an eligible result.

It must disclose that the decisive real evidence used a controlled failure Seed and
that the real no-branch Negative did not complete. It must not claim benchmark-level
improvement, general A/B superiority, natural-failure recovery rate, production
durability or self-evolution.

## Architecture continuity

- Direct public emitted Pi `AgentHarness` remains the primary runtime route.
- Pi public JSONL Session primitives remain the Session basis.
- Workbench remains authoritative for Run/Attempt/RecoveryGroup identity, Workspace
  isolation, Failure Packet, Verifier, budgets, Selector and evidence.
- Pi Core patch and private import counts remain zero.
- SDK/Extension/RPC remain future compatibility candidates, not V2 dependencies.
- V0/V1/V2-A accepted modules should not be broadly rewritten for later versions.

## Evidence index

- `docs/reports/V2_A_CLOSEOUT.md`
- `docs/reports/V2_B_CLOSEOUT.md`
- `docs/reports/V2_B_R2_CONTEXT_CORRECTED_STAGE2_EXECUTION_REPORT.md`
- `docs/reports/V2_B_R2_CONTEXT_CORRECTED_STAGE2_PAUSE_REPORT.md`
- `docs/reports/V2_B_R2_CONTEXT_CORRECTED_MAIN_DISPOSITION_RECOMMENDATION.md`
- `docs/reports/V0_TO_V2_B_FACT_FIRST_STAGE_STATUS_FOR_V3_RESEARCH.md`

## Next-version boundary

V2 is closed and no Goal is active. V3 remains only a candidate direction:
`Trace -> Diagnosis -> Experience -> Candidate Intervention -> Regression ->
Promote/Reject/Rollback`.

This closeout does not authorize V3 research, a V3 Charter or Contract, source
implementation, real calls, downloads, Pi modification, SDK/Extension route
switching or Git commit. Those require a new Main/user planning decision.
