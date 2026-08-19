# V3.7 Goal 2 Implementation Report

```yaml
status: CANDIDATE_READY_FOR_MAIN_PRELIMINARY_REVIEW
goal: V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE
implementation_owner: fresh_dedicated_Goal_2_Implementation_Session
starting_commit: 55f8caf17a7b118e68f2f2a18961da351c8b6990
starting_tree: 167c855408e253a7941b6a9579201b753f75c562
candidate_commit: SELF
candidate_tree: SELF
candidate_commits_used: 1_of_1
goal_2_accepted: false
goal_3_started: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
observed_external_cost_usd: 0
docker_product_runs: 0
dependency_installations: 0
pi_or_reference_reads_or_changes: 0
hard_stops: []
scope_deviations: []
```

The containing candidate commit/tree is reported by the dedicated Session after the
single authorized commit is created; it cannot be embedded in a file that participates
in its own identity.

## Changed paths

Exactly the ten Prompt-allowlisted paths changed:

- `workbench/config/v37/follow-up-execution-profiles/v37-g1-det-recovery.g2.v1.json`
- `workbench/src/contracts/v37-types.ts`
- `workbench/src/v37/follow-up-execution-profile-v37.ts`
- `workbench/src/v37/registered-follow-up-v37.ts`
- `workbench/src/session/persistent-session-v36.ts`
- `workbench/src/state/state-feedback-g2.ts`
- `workbench/src/inspect-v37g2.ts`
- `workbench/tests/v37g2-runtime-effective-followup.test.ts`
- `docs/reports/V3_7_G2_IMPLEMENTATION_REPORT.md`
- `docs/reports/V3_7_G2_CLOSEOUT_DRAFT.md`

`CURRENT_STATE.md`, the Charter, Amendment, Prompt, Goal 1 configuration/loader,
State Store/CAS, old G1 admission, regression gate, Pi, references and rejected Schema 2
paths were not changed.

## Implemented bridge

- The fixed Host loader validates the exact registered follow-up profile, all five
  parent workflow digests, exact profile bodies, exact keys, component digests, profile
  digest, loader-owned location and loader fingerprint. It derives a workflow-specific
  follow-up execution authority that cannot be selected by a caller.
- The registered service reloads the accepted Goal 1 workflow and Recovery admission,
  validates the exact workflow Candidate, inspects the shared State scope, requires the
  promoted Candidate/Decision/State lineage and selects only applicable prompt addenda.
  It persists the immutable binding and plan before dispatch.
- The production V3.6 `executeBoundedTurn` seam adds a schema-3 registered-observation
  variant. The same method that constructs `AgentHarness` rechecks the pointer and writes
  the exact prompt/binding/authority/Run/Session/Workspace observation before the first
  Provider request. Existing schema-2 V3.6 behavior remains unchanged.
- The deterministic faux route edits only `src/policy.mjs`. After a settled terminal,
  the Host executes the exact frozen current-Node Verifier once, without a shell, under
  the frozen timeout/output limits. Verifier output, formal Verifier, Outcome, Evidence,
  second confirmation/request and admission are write-once and independently reopened.
- Admission reloads workflow/profile authority, Recovery admission, Candidate,
  accepted State version and promotion Decision, recomposes the prompt, rechecks the
  runtime Manifest/observation, Workspace identity, Verifier output, Outcome and every
  evidence/request digest. Disabled registration blocks new action while pinned profile
  identity remains available only through historical read-only loading.
- `CanonicalBoundStateAssessmentInputG2` now has two independent normalizers: the old
  `v3g3_bound_state_followup` path and the new registered V3.7 path. Persisted assessment
  schema and decision results remain unchanged; the focused positive reaches `retain`,
  and the accepted regression suite preserves negative reassessment, strict rollback,
  CAS and no-direct-supersede behavior.

## Frozen identities

```yaml
configuration_location: workbench/config/v37/follow-up-execution-profiles/v37-g1-det-recovery.g2.v1.json
configuration_file_sha256: 6820b9f8e31ee3f7a10e82a5ca7cf6d9ebae66b5a5325e7b7000cdcfbb9debb9
follow_up_execution_profile_digest: 10ab0ebbdcbf1861bfed078400bcd75df900e28e82f4a3c6dfece4b18718dff5
provider_profile_digest: 3957e200d84b1c8aab51a07b8b7226b1ff339730b393046576924f837bfdd1c1
tool_profile_digest: 343ff726f5f6b04c4b073b39001fa1e85b8b958dcc341b9d6e6d3128b8ddb296
command_profile_digest: a0a138fed7b766a2eb3097bc54158fcdff26fde22973406a33f01d194bda6f4d
budget_profile_digest: fd55b70ed4ae784721556a974fcf7cbf1a304a68860ecde5fb5eb3e5d353519d
stop_condition_profile_digest: 97a372d6d09541bc842bafe8fa0114fd5ac8764bc8de47d9f6d3154df561a692
```

Goal 1 configuration files remain byte-identical to the starting commit:

```yaml
registry_file_sha256: cdf3b081444f3288b38b1bdb92525b5613ab068effda3c9af7848fa31d31727b
manifest_file_sha256: 39292054a68592b5c1951e0193d428070eebc7f3700ccd6ab1f3797e2aa161c2
envelope_file_sha256: 621efc8de7747d2d7ce8c2f780b45c271bb0b0b4dc3bbb449cf80447d1a340a3
```

## Verification

| Command | Result |
|---|---|
| exact Goal 2 focused command | PASS, 8/8 |
| exact Goal 1 focused command | PASS, 14/14 |
| exact V2-A three-file command | environment-qualified 10/11; only spawned CLI child lacked inherited public loader |
| same V2-A command with the identical absolute public loader inherited by child Node processes | PASS, 11/11 |
| exact V3 G1/G2 command | PASS, 19/19 |
| exact Final Capstone G2 command | environment-qualified 8/10; only two spawned-child loader-resolution checks failed before product inspection |
| same Final Capstone G2 command with the identical absolute public loader inherited by child Node processes | PASS, 10/10 |
| exact repository `tsc -p tsconfig.json --noEmit` | environment stop `TS2688`; isolated worktree lacks ignored Node declarations |
| strict seven-entry environment-equivalent TypeScript command | PASS, 0 diagnostics |
| aggregate deterministic assertions using the environment-equivalent loader where required | PASS, 62/62 |
| `git diff --check`, ten-path allowlist, Goal 1 config diff and Schema 2 absence | PASS |

No product assertion failed when the already-authorized public loader was visible to
spawned child processes. No dependency was installed to alter the isolated environment.

## Remaining unverified

- No real Provider/model, Credential, network, cost or Docker behavior was exercised;
  the Goal 2 contract explicitly requires deterministic zero-access implementation.
- The literal repository-wide TypeScript command remains blocked by absent ignored Node
  declarations; the strict changed-surface/transitive-dependency check passed.
- Main preliminary review, immutable audit-candidate freeze, fresh independent focused
  audit and Main Goal acceptance remain pending and are not claimed.
