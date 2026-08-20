# V3.7 Goal 3B Host Execution-Port Bridge Correction 1 Main Rereview Hard Stop

```yaml
status: DECISION_REQUIRED_CORRECTION_BUDGET_EXHAUSTED
reviewed_on: 2026-08-21
corrected_candidate_commit: e154d788ec2b3def81b50215fc732709132da517
corrected_candidate_tree: c6e9ea0bd9f04d8cf76c4031e61d544f0bc3aaff
corrected_candidate_parent: f3ac860069b1479d9be42db2e6bad2748ddd298a
closed_finding: G3B-HOST-BRIDGE-MAIN-P1-001
new_finding: G3B-HOST-BRIDGE-MAIN-P1-002
ordinary_correction_capacity: exhausted_1_of_1
audit_started: false
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Result

Correction 1 correctly closes `G3B-HOST-BRIDGE-MAIN-P1-001`: the Candidate output-byte
and frozen producer validation now precede bridge completion, and the new valid-JSON/
invalid-schema regression passes.

Main reproduced bridge **8/8 PASS**, affected authority **6/6 PASS**, strict TypeScript
PASS and the three-path integrity checks. No broad suite or real access was used.

## New blocking finding

`G3B-HOST-BRIDGE-MAIN-P1-002`: the production Candidate prompt instructs the model to use
the frozen generic prompt-addendum template, but supplies only the frozen producer input
(opportunity and expected Base-State digest). It does not supply the Manifest's exact
template ID or content.

The later Host check in `candidate-v37g3a.ts::producePromptCandidateV37G3A` accepts only
the exact registered template. The focused fake independently hard-codes that exact
template in `proposalFromPrompt`, so the positive test does not prove that the production
prompt gives the real model enough frozen information to produce an admissible Candidate.

This blocks the sole frozen Goal 3B path and would make the production-path claim false;
it is not an optional prompt improvement. Audit cannot begin while the Candidate retains
this finding.

## Recommended bounded decision

Authorize one exceptional micro-correction, still limited to the same three paths:

1. obtain the single exact registered template from the already Host-loaded Manifest;
2. validate/pin its ID, content and digest and include that exact non-secret frozen value
   in the Candidate model prompt;
3. add a test that inspects the actual model request and proves the exact registered
   template is present, instead of letting the fake succeed from an independent constant;
4. preserve every other bridge/configuration/budget behavior and rerun only bridge,
   authority and strict TypeScript focused checks.

Recommended user decision:

`AUTHORIZE_V3_7_G3B_HOST_BRIDGE_EXCEPTIONAL_TEMPLATE_PROMPT_CORRECTION`

Without that decision, preserve the corrected Candidate, keep audit and real execution
locked, and stop.
