# V3.7 Goal 3B Host Execution-Port Bridge Implementation Report

```yaml
status: EXCEPTIONAL_TEMPLATE_PROMPT_CORRECTION_CANDIDATE_READY_FOR_MAIN_REREVIEW
prepared_on: 2026-08-21
control_baseline_commit: 3071a0fcd91d6b95ade47c50114518973b6a7c53
control_baseline_tree: cf479b07dc13af897399416c03bcc2b02afe29a5
configuration_candidate_commit: cd380652dc332b875c41055c95d53fb687368732
configuration_candidate_tree: 72318985ad0f016c5a1f227cbabc052eb0906256
candidate_commit: SELF_RESOLVED_BY_COMMIT_CONTAINING_THIS_REPORT
candidate_tree: SELF_RESOLVED_BY_COMMIT_CONTAINING_THIS_REPORT
parent_commit: 3071a0fcd91d6b95ade47c50114518973b6a7c53
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Result

The exceptional template-prompt micro-correction preserves failed initial Candidate
`73b8b9787dea1ec2cb4d43be547aef711f74fbb3` and ordinary Correction 1 Candidate
`e154d788ec2b3def81b50215fc732709132da517` without amend. It closes only
`G3B-HOST-BRIDGE-MAIN-P1-002`.

Bridge construction now reads the sole generic prompt-addendum template from the already
Host-loaded real Manifest and requires exact ID `v37-verify-before-finish`, exact frozen
content and SHA-256
`1341b7b213c788c3d17ced324ba46da316c091af8d43182d02f589add792cc8f`.
The Candidate model request includes that exact template ID/content beside the frozen
producer input. The positive fake parses the template from the actual captured request,
uses those parsed values for its proposal, and separately asserts their frozen identity;
it no longer succeeds from an independent proposal-template constant.

Correction 1 preserves failed Candidate
`73b8b9787dea1ec2cb4d43be547aef711f74fbb3` unchanged and closes only
`G3B-HOST-BRIDGE-MAIN-P1-001`. Before a Candidate-proposal unit can be persisted as
complete, the Bridge now applies the existing producer's default 32 KiB stable-JSON
output boundary and calls the existing `validateProposalAndBuildCandidateV3` with the
frozen opportunity/base-State input and `model_proposal` derivation. The original parsed
proposal is still returned for the Product producer's normal authoritative revalidation.

Syntactically valid JSON with an invalid Candidate schema now faults the Bridge without
persisting a completed Candidate unit and without creating a Product receipt.

The Host-owned bridge is implemented for the single registered Case
`v37-real-recovery-promote-retain`. It binds the corrected configuration Candidate and
the accepted daily Runtime tuple `v36_daily_bounded_edit_v2` / `16/24`, constructs the
exact Primary, Candidate-proposal, symmetric Regression and registered follow-up ports,
and supplies their exact construction authorization to `ProductServiceV37G3A`.

Construction, Case listing and pre-dispatch validation remain lazy: they do not resolve
the opaque Credential or construct the fixed DeepSeek Runtime. One shared Credential
lease and one fixed `deepseek-v4-flash` Runtime serve the ordered seven-unit envelope.
The production module exports no deterministic execution alternative.

The bridge persists only sanitized construction, per-unit usage/lifecycle, failure-hash
and close evidence. It enforces per-unit and global request, token, Tool, command,
wall-time and cost caps; exact Primary/Recovery and Regression arm order; once-only
Candidate/follow-up stages; no retry/fallback/replacement; known usage; exact Candidate
JSON; and post-close unavailability. Full model text, Provider payloads, Credential,
headers and environment contents are not persisted.

## Changed files

1. `workbench/src/v37/real-execution-ports-v37g3b.ts`
2. `workbench/tests/v37g3b-real-execution-ports.test.ts`
3. `docs/reports/V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_IMPLEMENTATION_REPORT.md`

No configuration, existing source/test, fixture, Pi, planning or control-state file was
changed. The user-owned untracked evidence-audit report was neither read nor modified.

## Deterministic verification

- New Bridge focused test: `8/8 PASS`, `0` failures. The corrected positive path derives
  its proposal template from the actual captured request; all prior negative checks,
  including Correction 1 valid-JSON/invalid-schema, remain passing.
- Directly affected G3A/G3B authority test: `6/6 PASS`, `0` failures.
- Strict TypeScript: `PASS`, zero diagnostics.
- The complete local fake route exercised all seven units, one shared test-local opaque
  Credential resolution, one model-factory construction, ordered Regression and the
  corrected daily-24 follow-up Runtime path. Its sanitized simulated Provider counters
  reconciled at `13/13/13`; these are local fake observations, not real calls.
- Actual Credential/network/Provider/model operations: `0/0/0/0`.
- No broad G3A, G1/G2, V2, V3, V3.6 or demo suite was run.

Commands:

```text
node --experimental-test-module-mocks --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g3b-real-execution-ports.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g3a-authority.test.ts
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit
```

## Unverified real behavior and handoff

No real Credential, external network, Provider/model, Docker command or Pi execution was
authorized or performed. Provider availability, actual model behavior, actual cost and
Docker Host readiness remain unverified and require a later separately authorized
Execution Prompt. This Candidate does not freeze audit authority, accept Goal 3B or
authorize real access. It returns to Main for preliminary review and, only after PASS,
one fresh focused independent read-only audit.
