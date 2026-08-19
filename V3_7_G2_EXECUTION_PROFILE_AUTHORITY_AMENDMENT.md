# V3.7 Goal 2 Execution Profile Authority Amendment

```yaml
amendment_id: V3_7_G2_EXECUTION_PROFILE_AUTHORITY_AMENDMENT
status: ACCEPTED_BY_USER
accepted_on: 2026-08-20
applies_to: V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE
supersedes_only: V3_7_CHARTER_sections_6_3_and_6_5_direct_Manifest_execution_tuple_inheritance_for_Goal_2
goal_1_acceptance_changed: false
goal_1_manifest_changed: false
goal_1_candidate_changed: false
real_access_authorized: false
```

## 1. Reason and boundary

The accepted Goal 1 Manifest freezes execution profiles for the registered recovery
episode, but Charter Goal 2 requires a different complete runtime profile containing
Provider request, combined-token, cost, Tool-call, command, Verifier timeout/output and
wall-time limits. Mutating the accepted Manifest would change its digest, registry trust
root and existing workflow registration identity. Caller- or chat-supplied supplemental
limits would not be Runtime Authority.

This Amendment authorizes one bounded, immutable Host-registered follow-up execution
profile. It preserves the accepted Manifest and workflow registration and supplies the
previously deferred Goal 2 values through a new baseline-bound Host loader. It is not a
general registry, enrollment API, Authority Store or permission to change Goal 1.

## 2. New immutable profile

`RegisteredFollowUpExecutionProfileV37` schema version 1 has exactly:

| Group | Fields |
|---|---|
| identity | `schema_version: 1`, `kind: v37_registered_follow_up_execution_profile`, `profile_id`, `case_id`, `manifest_body_digest` |
| parent | `parent_provider_profile_digest`, `parent_tool_profile_digest`, `parent_command_profile_digest`, `parent_budget_profile_digest`, `parent_stop_condition_profile_digest` |
| effective Provider | `provider_profile` exact body plus `provider_profile_digest` |
| effective Tool | `tool_profile` exact body plus `tool_profile_digest` |
| effective command | `command_profile` exact body plus `command_profile_digest` |
| effective budget | `budget_profile` exact body plus `budget_profile_digest` |
| effective stop | `stop_condition_profile` exact body plus `stop_condition_profile_digest` |
| content identity | `follow_up_execution_profile_digest` |

The Goal 2 Implementation Prompt freezes the sole allowed configuration location,
loader entry point/fingerprint, complete exact bodies and digest algorithm. The loader
must reject unknown keys, directory scanning, caller location/digest/profile override,
unregistered Case/Manifest identity and any mismatch with the existing workflow's five
parent execution digests.

## 3. Workflow-specific authority derivation

The static profile is bound to a concrete existing workflow only by the Host service.
After reloading that workflow through the accepted Goal 1 loader, the Goal 2 loader
derives:

```text
follow_up_execution_authority_digest = sha256(canonical JSON of
  workflow_id
  + workflow_registration_digest
  + registry_trust_root_digest
  + manifest_body_digest
  + the five parent execution digests
  + fixed profile location
  + Goal 2 loader contract/fingerprint
  + follow_up_execution_profile_digest)
```

The derived authority is immutable and must be persisted before dispatch. It cannot be
supplied, selected or modified by a browser, caller, Agent, confirmation receipt or
Evidence package.

## 4. Amended binding and Evidence meaning

For Goal 2 only, the existing binding/Evidence fields
`provider_profile_digest`, `tool_profile_digest`, `command_profile_digest`,
`budget_profile_digest` and `stop_condition_profile_digest` identify the effective
follow-up profiles from this registered record. The binding and Evidence additionally
record:

- all five `parent_*_profile_digest` values inherited unchanged from the workflow;
- `follow_up_execution_profile_digest`;
- `follow_up_execution_authority_digest`.

Runtime observation and Inspector recomputation require equality across the registered
profile, pre-dispatch plan, actual V3.6 call, terminal evidence, Verifier/Outcome package,
follow-up Evidence and G1 admission. The original workflow tuple remains part of the
lineage and cannot directly operate the Goal 2 runtime.

This narrowly supersedes Charter Sections 6.3 and 6.5 where they required Goal 2's
effective execution tuple to be the Manifest tuple directly. Every other Charter field,
invariant, exit criterion and Hard Stop remains unchanged.

## 5. Prohibitions

The Amendment does not authorize:

- changing the accepted Manifest, Envelope, registry, loader or Goal 1 candidate;
- changing frozen Primary/follow-up Task, Source, Verifier, Candidate or State scope;
- caller-selectable profiles, arbitrary enrollment or runtime profile mutation;
- real Credentials, network, Provider/model calls, Docker product work or Pi changes;
- retries, fallback, replacement or result hunting;
- Goal 3 work or Goal 2 acceptance without candidate review and focused audit.

Any need to cross those boundaries is a new Hard Stop.
