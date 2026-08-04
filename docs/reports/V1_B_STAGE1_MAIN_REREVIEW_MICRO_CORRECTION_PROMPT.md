# V1-B Stage 1 Main Re-review Micro-correction Prompt

```yaml
status: authorized_test_only_micro_correction
owner: original_v1_b_stage_1_preparation_session
base_head: 951e9161300eacd408e232aa6d1fa66ac02d0e10
finding: V1B-AUD-F-002_tracked_cli_missing_credential_regression_gap
credential_reads_authorized: 0
network_authorized: false
provider_calls_authorized: 0
real_model_calls_authorized: 0
git_commit_authorized: false
stage_2_authorized: false
```

Main Session's narrow re-review accepts the corrected production behavior for
both audit findings. One required regression from the bounded correction prompt
is not yet exercised through the exact tracked CLI process.

## Required micro-correction

Add one focused tracked-CLI regression, preferably in
`workbench/tests/v1b-cli.test.ts`, that invokes:

```text
v1b run-next
--manifest <valid audit-local stage2_real Manifest>
--pilot-root <new ignored test Pilot root>
--stage2-real-authority
```

The child-process environment must explicitly omit `DEEPSEEK_API_KEY`, even if
the parent environment contains it. Do not inspect, print or hash any parent
credential value.

The regression must prove:

1. the tracked CLI reaches the concrete Stage 2 composition rather than failing
   with `real execution dependencies are unavailable`;
2. the missing credential fails as sanitized
   `FixedProviderBoundaryErrorV1B`;
3. no network, external Provider or model dispatch occurs;
4. the Pilot ledger records the deterministic fail-closed state actually
   produced by the implementation and does not advance to another cell;
5. no fallback, retry or replacement occurs;
6. no credential-shaped value appears in stdout/stderr/evidence.

If the current production behavior cannot pass this exact regression, make only
the minimum Contract-allowlisted F-002 correction needed. Do not change the
fixed model/profile, Manifest protocol, budgets, task/Skill/Verifier fixtures or
Workspace correction.

Run:

- strict TypeScript;
- the V1-B focused Stage 1/CLI suite;
- only regressions directly affected if production source changes.

If this is test/report-only, do not regenerate the 24-cell authoritative
simulation or rerun broad V0 suites. Update the Implementation Report and
Closeout Draft test totals/command record accurately. Preserve all prior
evidence and the two-finding closure matrix.

Do not modify control state, Pi, reference, dependencies or Git history. Do not
read a credential, access the network, call a Provider/model, create a Candidate
commit or enter Stage 2. Return the exact source delta and command results, then
stop for Main Session review.
