# V3.7 Goal 3B Host Bridge Exceptional Template-Prompt Correction Main Rereview

```yaml
status: PASS_V3_7_G3B_HOST_BRIDGE_EXCEPTIONAL_TEMPLATE_PROMPT_CORRECTION_MAIN_REREVIEW
reviewed_on: 2026-08-21
candidate_commit: c85011fd9ea8a64d6b7964dd853750b13f2b2fa4
candidate_tree: 2bb2fb399cd4f08a89da9c02edb3abf15e740938
candidate_parent: 3071a0fcd91d6b95ade47c50114518973b6a7c53
closed_finding: G3B-HOST-BRIDGE-MAIN-P1-002
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Disposition

PASS with no residual finding in the exceptional correction scope. The immutable
Candidate changes exactly the bridge source, focused test and implementation report.

The bridge obtains the sole generic prompt-addendum template from the Host-loaded real
Manifest, requires its exact frozen ID/content/SHA-256 before construction, and supplies
the exact ID/content beside the frozen producer input in the model request. The positive
fake parses the template from the actual captured request and builds its proposal from
those values; it no longer bypasses production prompt sufficiency with an independent
proposal-template constant.

Ordinary Correction 1's output-byte and existing producer validation still run before
Candidate unit completion. Daily-24, construction identity, one-use/order/budget,
closure and zero-access behavior are unchanged.

## Verification

- Exact three-path allowlist and `git diff --check`: PASS.
- Bridge focused test: **8 passed, 0 failed**.
- Affected authority test: **6 passed, 0 failed**.
- Strict TypeScript: PASS, zero diagnostics.
- Actual Credential/network/Provider/model operations: `0/0/0/0`.
- Broad suites were not run because no focused evidence required expansion.

## Next action

Freeze Candidate `c85011fd9ea8a64d6b7964dd853750b13f2b2fa4` / tree
`2bb2fb399cd4f08a89da9c02edb3abf15e740938` for one fresh independent read-only focused
audit of the full bridge boundary and both closed findings. Audit PASS is required before
acceptance or Goal 3B Execution-Prompt preparation. Real access remains unauthorized.
