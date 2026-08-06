# V2-A Focused Independent Audit Report

```yaml
status: completed_with_blocking_findings
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
gate: J
session_role: fresh_v2_a_focused_independent_audit_session
candidate_audit_baseline_commit: ece8856891f950a090f9adabf75ca8c8e707ce53
control_baseline_commit: 228973b7e7b826468c54b84f28faf8d9c0c33a6d
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
gate_j_recommendation: REVISE_V2_A_BOUNDED
highest_severity: P1
finding_count: 5
source_repair_performed: false
control_state_edit_performed: false
git_stage_or_commit_performed: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## 1. Outcome

**Recommendation.** Gate J should not pass on Candidate
`ece8856891f950a090f9adabf75ca8c8e707ce53`. Return one Contract-bounded
correction package containing the five P1 findings below to the original V2-A
Implementation Session. The appropriate disposition is:

> `REVISE_V2_A_BOUNDED`

**Fact.** The producer's normal deterministic paths behaved as designed in the
observed Runs: the Seed preceded both Candidates, both Candidates terminalized,
Selection followed both terminals, A used a public fork with parent history, B
used a public fresh Session, ordinary Workspace files were isolated, the
initial-pass path created no recovery objects, and the selector matrix retained
budget-stopped and invalid Candidates.

**Fact.** The blocking issue is the independent evidence boundary. Four
coherently modified audit-local Run copies were all incorrectly accepted by
`inspectRunV2A()` as `integrity_valid: true`, and the authoritative evidence is
not bound to the frozen Candidate source digest. In addition, no Candidate
initial-Workspace Artifact exists for the Inspector to recompute the claimed
same-Seed starting state.

No finding requires a Pi route change, new dependency, additional authority or
architecture decision. No P0, P2 or P3 finding was recorded.

## 2. Identity, authority and cleanliness

**Fact.** Gate A passed before audit work:

- project root was exactly
  `C:\Users\HUAWEI\.codex\worktrees\7675\project2`;
- `git rev-parse HEAD` was exactly
  `ece8856891f950a090f9adabf75ca8c8e707ce53`;
- tracked/staged state was clean; the only untracked path was the authorized
  `docs/reports/V2_A_FOCUSED_INDEPENDENT_AUDIT_SESSION_START_PROMPT.md`;
- Control Baseline `228973b7e7b826468c54b84f28faf8d9c0c33a6d` was an ancestor;
- `CURRENT_STATE.md` showed V2-A active, implementation complete and focused
  audit pending;
- read-only Pi HEAD was exactly
  `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
- credential/network/external Provider/real-model authority was zero.

**Fact.** The runtime emitted package resolved to
`D:/AI/AI_Projects/project2/.runs/v0-a/pi/packages/agent/dist/index.js` and
`dist/node.js`. That runtime checkout was independently verified at the same
pinned Pi SHA and clean.

## 3. Scope

Audited:

- Seed order, write-once references and post-freeze isolation;
- public emitted `JsonlSessionRepo` create/open/fork and A/B Session lineage;
- same-Seed Workspace equality, link/hardlink/reparse isolation and Candidate
  writable boundaries;
- mandatory two-path execution, fairness bindings and selection timing;
- selector Hard Gates, pass/fail matrix, none, invalid and budget retention;
- Inspector fail-closed/read-only behavior under coherent tamper;
- attempt/group budgets, raw Verifier/Session evidence, protected/secret scans
  and source/evidence identity;
- strict TypeScript, V2-A suite and the minimum Contract-listed V0/V1
  regressions.

Explicitly not audited:

- real Provider/model behavior, credentials, network or V2-B;
- SDK, Extension, RPC, third-party Pi packages or Git worktree providers;
- in-flight crash recovery, exactly-once Tool semantics or production
  durability;
- general platform/security review, V3 design, broad Pi builds/tests or full
  V0/V1 re-audit.

## 4. Commands and results

| Command / check | Exit | Result |
|---|---:|---|
| Candidate/Pi/status/ancestry Gate A checks | 0 | exact Candidate and Pi SHAs; tracked/staged clean; Control ancestor; only authorized prompt untracked |
| public emitted import probe | 0 | root/`./node` resolved to emitted `dist`; `AgentHarness`, `JsonlSessionRepo`, `NodeExecutionEnv` were functions |
| `npm run typecheck` | 0 | strict TypeScript passed |
| `npm run v2a:test` | 0 | 6 passed, 0 failed, 0 skipped |
| `node --test tests/workspace.test.ts tests/v0b-verifier.test.ts` | 0 | 11 passed, 0 failed, 0 skipped |
| `npm run v1a:test` | 0 | 18 passed, 0 failed, 0 skipped |
| `npm run v1a:deterministic` | 0 | all deterministic gates passed; credential/network/external/real counters zero |
| `npm run v1b:test` | 0 | 31 passed, 0 failed, 0 skipped |
| `node --test tests/v1c-budget-stop.test.ts` | 0 | 13 passed, 0 failed, 0 skipped |
| read-only inspection/fingerprint loop over six base Runs plus final-source Run | 0 | 7/7 reported valid and unchanged by inspection |
| targeted invalid-A/pass-B audit-local scenario | 0 | invalid A retained/rejected; B selected; Inspector reported valid |
| `.runs/v2-a/audit/check-authoritative-evidence.mjs` | 0 | observed normal order/isolation/Session facts; found no Candidate initial snapshot refs and all Seed source digests stale vs Candidate |
| `.runs/v2-a/audit/reproduce-inspector-gaps.mjs` | 0 | all four forged copies incorrectly returned `integrity_valid: true` |

The passing regression count is 79 Node tests plus the V1-A deterministic
script. Passing normal-path tests do not close the coherent-tamper findings.

## 5. Source, Pi and evidence checks

### Public Pi Session route

**Fact.** Candidate source imports only public package roots:
`workbench/src/run-v2.ts:4-17` imports `AgentHarness`/`JsonlSessionRepo` from
`@earendil-works/pi-agent-core`, `NodeExecutionEnv` from the public `./node`
subpath and Faux types from public `pi-ai`.

**Fact.** Pinned Pi declares only the public root and `./node` exports in
`D:/AI/AI_Projects/project2/.upstream/pi/packages/agent/package.json:8-16`;
the root re-exports the JSONL repo in
`packages/agent/src/index.ts:32`. `JsonlSessionRepo.create()` and `fork()` are
at `packages/agent/src/harness/session/jsonl-repo.ts:75` and `:134`; `fork()`
uses `getEntriesToFork()` and defaults `parentSessionPath` to the source path
at lines 139 and 153. Pinned tests verify fork parent lineage and copied entries
in `packages/agent/test/harness/repo.test.ts:47-63`.

### Normal authoritative evidence

**Fact.** For each of the six recovery Runs inspected, the current evidence
showed one `seed_frozen` before two `candidate_started` events, two matching
`candidate_terminal` events, and Selection after both terminals. Actual Seed,
A and B files were ordinary files with `nlink == 1` and no shared `dev:ino`.
A's observed pre-run Session ID differed from both parent and B; its observed
parent path and entry bytes matched the Seed parent Session. B had no parent
path and zero pre-run entries. These observations show the current producer
normal path, but do not repair the Inspector fail-open cases below.

**Fact.** The initial-pass authoritative Run contained no recovery objects.
The targeted audit-local invalid scenario retained invalid A in evaluated and
rejected membership and selected passing B.

### Authoritative source identity

**Fact.** Candidate `workbench/src` recomputed to
`87285af79c5c194624a774b4814a5d69870af9dab9bab925b7a251c276cee38e`.
All five base recovery Seeds instead record
`94736b1975be9a13112e28f2134d09fe79c0a87a57212ef5eb71b9d3ea270ef0`;
the claimed final-source supplement records
`1257910d78817a3b43caf674fa8eb4368f00a17522fa63772e4b570c88765e89`.
None matches the frozen Candidate. Nevertheless, all seven Runs were accepted
by the current Inspector.

## 6. Findings

### P1 — raw Verifier evidence can be contradicted while selecting a failed Candidate

```yaml
id: V2A-AUDIT-P1-001
severity: P1
contract_invariant: "Only a Candidate whose common external Verifier passed may be eligible; Inspector must independently validate Verifier/Artifact/Selection lineage and raw evidence."
source_path_and_symbol: "workbench/src/inspect-v2.ts:136 validateCandidate(), especially lines 152-190; inspectRunV2A() selection replay at lines 276-280"
reproduction_or_reasoning: ".runs/v2-a/audit/reproduce-inspector-gaps.mjs case forged-verifier-selection copied the authoritative fail/fail Run, left candidates/a/verifier-result.json status=failed, changed raw verifier output without refreshing its nested ArtifactRef, changed Candidate A's declared status/Hard Gate to passed, and refreshed only higher-level Candidate/Selection refs. Inspector returned integrity_valid=true and selected A."
observed_impact: "A Verifier-failed Candidate and tampered raw Verifier output can be accepted as integrity-valid and selected, directly violating Hard-Gate-first Selection."
bounded_correction: "Have Inspector read and validate every referenced VerifierResult and its nested full_output/source ArtifactRefs, derive status/attempt/verifier/source/exit/timeout validity from those bytes, derive verifier_passed instead of trusting Candidate JSON, then reproduce Selection from independently derived gates."
required_regression: "A coherent-rehash test must keep raw VerifierResult failed (and separately tamper its raw output), forge Candidate/Selection summaries, and require Inspector rejection with no eligible forged Candidate."
```

### P1 — A's parent Session lineage is accepted by count/presence rather than identity and entry bytes

```yaml
id: V2A-AUDIT-P1-002
severity: P1
contract_invariant: "Candidate A must be a distinct public fork whose parent path and pre-run entries exactly derive from the frozen parent Session; B must be a distinct fresh Session with no parent entries."
source_path_and_symbol: "workbench/src/inspect-v2.ts:136 validateCandidate(), lines 175-183; producer reference workbench/src/run-v2.ts:369-379 executeCandidate()"
reproduction_or_reasoning: ".runs/v2-a/audit/reproduce-inspector-gaps.mjs case forged-session-lineage replaced A's parentSession with C:\\forged\\unrelated-parent.jsonl and replaced a parent entry while preserving the entry count, then refreshed the snapshot/Candidate refs. Inspector returned integrity_valid=true with no errors."
observed_impact: "The primary experimental delta—retained parent history versus fresh history—can be substituted without detection, so Session lineage and fairness are not independently auditable."
bounded_correction: "Inspector must compare A's canonical parentSession to seed.parent_session_ref, compare all A pre-run entry IDs/bytes to the frozen parent Session entries, require distinct parent/A/B Session IDs, require B zero entries/no parent, and verify each final Session is the correct extension of its validated pre-run snapshot."
required_regression: "Coherently rehash an A snapshot with a foreign parent path, changed same-count entries, aliased Session ID, and divergent final Session; each variant must fail closed."
```

### P1 — Candidate initial Workspace equality has no independently inspectable Artifact

```yaml
id: V2A-AUDIT-P1-003
severity: P1
contract_invariant: "A and B must begin from bytes equal to the immutable Seed, and Inspector must independently recompute Workspace lineage rather than trust a producer field."
source_path_and_symbol: "workbench/src/contracts/v2-types.ts:57 CandidatePathV2A; workbench/src/run-v2.ts:365-404 executeCandidate(); workbench/src/inspect-v2.ts:149 and 158-174 validateCandidate()"
reproduction_or_reasoning: "Producer computes initialWorkspaceDigest at line 365 but persists only workspace-final.json after Agent execution at line 404. CandidatePath has no initial Workspace ArtifactRef. Inspector line 149 merely compares the declared string to the Seed and later scans only final bytes. The audit checker confirmed candidate_initial_snapshot_refs_present=false in every authoritative recovery Run."
observed_impact: "After Candidate mutation, Inspector has no immutable pre-run Candidate bytes/inventory from which to prove A/B/Seed equality or detect a producer that started one path from different bytes. Gate D/G and DoD 7/17/18 are therefore not independently supported."
bounded_correction: "Persist a write-once initial Workspace inventory/snapshot ArtifactRef for each Candidate after clone/isolation validation and before candidate_started/Agent execution; bind it to Seed and Candidate, and independently validate its digest, entries, path/link policy and A/B equality."
required_regression: "Require both initial snapshot refs on end-to-end Runs and reject missing, tampered, cross-Candidate, post-run/final-substituted and coherently rehashed initial snapshots."
```

### P1 — frozen attempt/group budgets can be replaced and under-reported

```yaml
id: V2A-AUDIT-P1-004
severity: P1
contract_invariant: "Per Attempt 8/16/1 and per Group 24/48/3 are frozen; Inspector must independently recompute usage, budget stop and eligibility."
source_path_and_symbol: "workbench/src/inspect-v2.ts:184-188 validateCandidate() and lines 263-272 inspectRunV2A(); workbench/src/contracts/v2-types.ts:111-130 RunManifestV2A"
reproduction_or_reasoning: ".runs/v2-a/audit/reproduce-inspector-gaps.mjs case forged-budget-caps changed A to 9 dispatches, replaced its cap 8 with 99, kept budget_valid=true, and left Recovery Group usage under-reported at 5. Inspector returned integrity_valid=true."
observed_impact: "An over-contract Candidate can remain eligible and selected, while Group usage need not equal primary plus both Candidate usage. Budget-stop retention and hard-gate eligibility can be falsified."
bounded_correction: "Validate literal/frozen Manifest caps against the accepted contract; require Candidate caps to equal Manifest caps; derive Candidate usage from raw Session/Journal/Verifier evidence; recompute Group usage from primary plus both Candidates; derive budget terminal/ineligibility rather than trusting supplied caps or summaries."
required_regression: "Coherently raise Candidate or Manifest caps, exceed 8/16/1, under-report Group totals, or flip budget terminal/gate fields; Inspector must reject every variant."
```

### P1 — Manifest/Seed identity is self-declared and authoritative evidence is stale relative to the Candidate

```yaml
id: V2A-AUDIT-P1-005
severity: P1
contract_invariant: "Manifest, Pi, Workbench source and immutable evidence identity must bind every Run to the frozen Candidate; Inspector must independently validate those anchors."
source_path_and_symbol: "workbench/src/run-v2.ts:42-45 WORKBENCH_REVISION and lines 598-622 Seed construction; workbench/src/inspect-v2.ts:199-202 Manifest self-hash and lines 229-255 Seed validation"
reproduction_or_reasoning: ".runs/v2-a/audit/reproduce-inspector-gaps.mjs case forged-source-manifest-identity changed Manifest/Seed Pi SHA to all zeros, Workbench digest to all zeros and workbench_revision to a forged label, recomputed only the Manifest self-hash and Seed ref, and was accepted as integrity_valid=true. Independently, current Candidate source digest is 87285a..., while base Seeds are 94736b... and the final-source Seed is 125791...; all are still accepted."
observed_impact: "Evidence from different source/Pi identities can be presented as this Candidate's authoritative proof. The current authoritative Runs, including the final-source supplement, do not bind to Candidate ece8856."
bounded_correction: "Replace the generic control+delta revision with independently checkable source identity: exact pinned Pi, complete frozen Manifest constants and a deterministic Candidate workbench source inventory/digest. Inspector must recompute/compare these against an external expected Candidate anchor, not only a self-hash. Preserve old evidence and generate a new write-once corrected-source evidence set/supplement whose digest matches the frozen Candidate source."
required_regression: "Reject forged/rehashed Pi SHA, workbench revision/digest, Manifest constants and stale-source evidence; assert the authoritative evidence source digest equals the corrected frozen Candidate source digest."
```

## 7. Gate J recommendation

```yaml
recommendation: REVISE_V2_A_BOUNDED
blocking_findings:
  - V2A-AUDIT-P1-001
  - V2A-AUDIT-P1-002
  - V2A-AUDIT-P1-003
  - V2A-AUDIT-P1-004
  - V2A-AUDIT-P1-005
architecture_pause_required: false
route_rejection_required: false
```

**Inference.** The normal producer route appears bounded and correct in the
observed fixtures, and the defects are localized to evidence contracts,
Inspector derivation and authoritative source binding. They are material
Contract failures but appear correctable within the existing V2-A allowlist.

## 8. Zero-access and unchanged proof

**Fact.** No credential file/value was read; no network, external Provider or
real-model route was invoked; no dependency was installed; no Pi build/full
test was run. V2-A source contains only public Pi root/`./node` imports and the
local Faux route. Session-observed counts remained credential/network/external
Provider/real model `0/0/0/0`.

**Fact.** Before the report was created, tracked/staged status remained empty.
`AGENTS.md`, `CURRENT_STATE.md`, the V2-A Contract and V2 Charter worktree blob
hashes exactly equaled their Candidate HEAD blob hashes. Both the read-only Pi
checkout and the runtime emitted-package checkout remained pinned and clean.

**Fact.** Authoritative evidence was only read. The summary hashes remained:

- `SUMMARY.json`:
  `eae4655284b447492156411a7beff8c6636e22c82334c001ddd8b4ba2b6ea7b6`;
- `FINAL_SOURCE_VALIDATION.json`:
  `330c660d4a70bff1973f51050ae874f04cb613f2bcf38d59f0f4ac74068e376f`.

All mutable audit reproductions were created only under ignored
`.runs/v2-a/audit/**`. No source, test, fixture, Contract, Charter, control
state, Pi, reference or authoritative `.runs/v2-a/evidence/**` path was edited.

## 9. Claims boundary

This audit does not claim that the public Pi fork primitive failed, that the
observed normal producer Runs used the wrong Workspace or Session history, or
that V2-A requires a new architecture. It establishes that the frozen
Candidate's Inspector/evidence boundary cannot independently prove those facts
under coherent tamper and that its saved evidence does not match the frozen
Candidate source digest.

This report does not accept V2-A, authorize V2-B, measure real recovery
effectiveness, compare strategy quality, claim production durability or make
any V3/V4 statement.

## 10. Minimum next step for Main

Main should perform a limited review of these five findings and, if accepted,
send one bundled bounded-correction prompt to the original V2-A Implementation
Session. That Session should correct only the affected evidence contracts,
Inspector derivations/tests and source-bound authoritative evidence. Main
should then freeze a corrected Candidate and request a fresh focused re-review
limited to P1-001 through P1-005 plus strict TypeScript, V2-A tests and only the
necessary Workspace/Verifier/budget regressions. No V2-B or real access should
begin before that re-review and Main/user acceptance.
