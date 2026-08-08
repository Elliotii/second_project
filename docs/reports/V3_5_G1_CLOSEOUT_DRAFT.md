# V3.5 Goal 1 Closeout Draft

> Superseded by the Main-accepted `docs/reports/V3_5_G1_CLOSEOUT.md`. Retained as
> the original Implementation Session handoff draft.

## Draft disposition

`READY_FOR_MAIN_REVIEW`

This is an Implementation Session draft. It does not accept Goal 1, close V3.5, activate Goal 2, authorize real access, or authorize Goal 3/WebUI work.

- Goal: `V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION`
- Parent Control Baseline: `745847d3f9e9579ea98a2d64c657b4c9d3ee91d1`
- Implementation commit: `4122b3cb88c2e35b946e4129d5977c0fdb2c7309`
- Bounded correction parent: `4122b3cb88c2e35b946e4129d5977c0fdb2c7309`
- Bounded correction commit: `0b62fb7447c76373fab1a4e26df15f29dd72dfa5`
- Pi: public emitted entrypoints from clean `027a5847901b5dde30270abaa1041046cd2b4b55`
- Access consumed: zero Credential, network, external Provider, real-model, and real calls

## Goal question result

`Fact`: the bounded implementation evidence answers the Goal 1 question affirmatively for a **settled deterministic/Faux path**. A public Pi JSONL Session survived a process exit, was listed and reopened by a distinct OS process, reconstructed the four-message prior context, continued through direct public `AgentHarness`, and preserved inspectable links to two immutable Workbench Run manifests.

`Fact`: the mechanism preserves `Session != Run`. Public Pi JSONL is conversation/context authority; each Run manifest is execution/evaluation authority; the catalog supplies navigation references only. Inspection cross-checks catalog identity, Run identity, and each Run's exact historical Session prefix rather than trusting the catalog as truth.

`Fact`: the safe projection renders allowlisted user, assistant, Tool, and Run history while excluding private reasoning/signatures, credential-like material, unknown provider payloads, and arbitrary absolute paths.

`Fact`: Main review found one bounded Read Model filesystem-boundary defect in the original implementation: an intermediate Windows directory junction could lead a source reference outside canonical `sourceRoot`. The correction walks every existing segment, rejects symlink/junction/reparse paths, canonicalizes the final ordinary file, and requires it to remain within canonical `sourceRoot`. A non-skipped junction regression reproduces and rejects both intermediate and final reparse paths. It does not change catalog or V2/V3 adapter semantics.

## Definition of Done evidence

- Distinct settled Process A/Process B proof: **PASS**.
- Process B prior-context reconstruction, proven by equal pre-turn and provider-observed digests: **PASS**.
- Session/Run/catalog linkage with separated authority: **PASS**.
- Safe inspection projection and canonical filesystem boundary: **PASS after bounded correction**.
- Missing, corrupt, cross-project, workspace-mismatch, parent, link, and path-escape failures: **PASS**.
- Catalog cannot override Pi Session/Run truth; absent historical fields remain explicit: **PASS**.
- Strict TypeScript: **PASS**.
- Goal-focused tests: **6 passed, 0 failed, 0 skipped**.
- Affected regressions: **43 passed, 0 failed**.
- Credential/network/external Provider/real-model counters: **all 0**.
- Pi patch/private import: **0**; hydrated Pi tracked status clean.
- Required source, tests, CLI, implementation report, and this closeout draft: **present in the bounded delta**.

The exact commands, artifact hashes, identities, relative references, and test inventory are recorded in `docs/reports/V3_5_G1_IMPLEMENTATION_REPORT.md`.

## Preserved limitations

- The result proves settled restart only, not in-flight crash recovery or exactly-once Tool effects.
- The proof is deterministic/Faux and contains no external Provider/model evidence.
- Catalog persistence is bounded single-writer JSON, not a database or distributed/multi-writer transaction system.
- Historical Read Model support is a bounded adapter with explicit `not_recorded`/`unavailable`, not a full V0–V3 migration or backfill.
- Goal 2 Skill comparison remains explicitly unavailable. Goal 3 API/WebUI and Runtime route switching remain unimplemented and unauthorized.
- Zero network use was not independently packet-captured; it is evidenced by the bounded route, counters, selected commands, and absence of network/provider clients.

## Main review decision requested

`Recommendation`: Main should inspect the resulting commit and cited ignored proof, verify the protected-file and Pi-clean checks, and then either:

1. accept Goal 1 with the settled/Faux and productization limitations above; or
2. return one bounded correction package to this original Implementation Session.

Main should not infer Goal 2 or Goal 3 authority from this draft.

## CURRENT_STATE_UPDATE_PROPOSAL

For Main only; not applied by this Session.

```yaml
proposal_type: V3_5_G1_CLOSEOUT_REVIEW
goal_id: V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION
implementation_parent: 745847d3f9e9579ea98a2d64c657b4c9d3ee91d1
implementation_commit: 4122b3cb88c2e35b946e4129d5977c0fdb2c7309
correction_parent: 4122b3cb88c2e35b946e4129d5977c0fdb2c7309
correction_commit: 0b62fb7447c76373fab1a4e26df15f29dd72dfa5
implementation_evidence: PASS
recommended_goal_disposition: ACCEPT_GOAL_1_WITH_SETTLED_FAUX_PRODUCTIZATION_LIMITATIONS
acceptance_authority: MAIN_AND_USER
version_disposition: V3_5_REMAINS_OPEN
goal_2: UNAUTHORIZED
goal_3: UNAUTHORIZED
real_access_consumed: 0
next_action: Main review and explicit Goal 1 acceptance decision
```
