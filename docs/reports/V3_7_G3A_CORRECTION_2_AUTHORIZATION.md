# V3.7 Goal 3A Correction 2 Authorization

```yaml
status: AUTHORIZED_FINAL_ORDINARY_CORRECTION
goal: V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY
finding_set: V37-G3A-MAIN-P1-001_residual_formal_terminal_and_later_real_same_path
preserved_correction_1_candidate_commit: 1843a683b958c06147bb17d95f4ed1cc1156ffaf
preserved_correction_1_candidate_tree: 74c92581bc281a19134c606fd108f78f16d9dc29
implementation_owner: /root/v37_g3a_implementation
ordinary_correction_budget: 2_of_2_consumed
candidate_commits_authorized: 1
audit_authority: false
goal_3b_authority: false
real_access_authorized: false
mock_nonzero_counter_simulation_authorized: true
```

## Exact correction scope

Correct only the residual `P1-001` boundary and necessary deterministic tests/reports.
Preserve both earlier Candidate commits without amendment. Only these paths may change:

```text
workbench/src/contracts/v37g3a-types.ts
workbench/src/v37/host-registry-v37g3a.ts
workbench/src/v37/follow-up-execution-profile-v37g3a.ts
workbench/src/v37/registered-follow-up-v37g3a.ts
workbench/src/v37/product-service-v37g3a.ts
workbench/src/read-model/workflow-v37g3a.ts
workbench/src/inspect-v37g3a.ts
workbench/tests/v37g3a-authority.test.ts
workbench/tests/v37g3a-product.test.ts
docs/reports/V3_7_G3A_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G3A_CLOSEOUT_DRAFT.md
docs/reports/V3_7_G3A_CORRECTION_2_REPORT.md
```

No tracked configuration/fixture, accepted v1 byte, V2/V3/G2/V3.6 semantic module,
WebUI, package/config, Charter, Amendment, Prompt, control state, Pi or Goal 3B file may
change. No new stage, Evidence family, Candidate/State/Assessment decision, Runtime
schema, retry/fallback/replacement, real adapter or general plug-in platform is allowed.

## Required outcomes

1. Validate the exact formal Primary terminal before a transition receipt is appended and
   again during reopen. For a V2 terminal, use the independent V2 Inspector over the fixed
   Run root and require exact returned/stored identity, registered Run/Task binding,
   internally valid lineage and the expected execution mode. For the versioned Primary-
   pass terminal, require an exact-key/schema/kind/Run/Task/Source/Verifier/counter shape,
   canonical ordinary stored bytes and recomputed digest. Missing, malformed,
   contradictory, substituted or coherently rehashed-invalid terminals fail closed.
2. Keep both frozen Goal 3A Cases bound to zero-access defaults. A construction-time port
   must not override their frozen Manifest/profile access policy or make an invalid fact
   authoritative.
3. Make the versioned G3A profile type/validator capable of representing a later exact
   source-controlled external Provider profile without changing accepted v1 types/files.
   Derive expected follow-up Runtime counters from that Host-loaded profile; do not
   hardcode zero in execution or historical recomputation.
4. A Manifest/profile declaring real access remains unavailable for execution unless the
   Host constructs the Case service with both its exact execution ports and a separate
   explicit real-access authorization flag. Configuration append, browser request, Case
   id, runtime result or self-declared terminal cannot grant this flag. Frozen G3A Cases
   must reject any such flag because their profiles declare zero access.
5. Primary V2 inspection must require zero counters/unauthorized-real mode for current
   G3A Manifests and the Manifest-declared real mode plus construction authorization for a
   later Case. Follow-up execution/reopen must compare exact nonnegative counters with the
   Host-loaded profile and preserve their formal identities; it may not infer authority
   merely from observed nonzero counters.
6. Add deterministic local mocks only: prove the malformed terminal reproduced by Main is
   rejected with no successful receipt; prove config alone cannot execute a real-profile
   third Case; prove a fully validated temporary third config plus Host ports plus explicit
   construction authorization can traverse the same product application/action handlers
   with simulated nonzero formal counters. The mock must make no Credential, network,
   external Provider or real-model call and must be labeled simulation evidence, not a
   real execution.
7. Preserve all Correction 1 closure tests, especially third append, terminal-derived
   routing, two-workflow reopen, frozen content drift, journal linkage, disabled history,
   CSS and thirteen v1 hashes.

## Verification and stop point

Rerun the exact Goal 3A focused suites, Goal 1/2, V2, V3, V3.6, demo smoke, frozen hash
inventory, allowlist and the authorized strict TypeScript-equivalent check. Record exact
commands and distinguish simulated nonzero counters from actual access counters. Create
exactly one Correction 2 Candidate commit and stop for Main rereview. Do not audit,
accept Goal 3A, update control state, start/freeze Goal 3B or access any external system.
