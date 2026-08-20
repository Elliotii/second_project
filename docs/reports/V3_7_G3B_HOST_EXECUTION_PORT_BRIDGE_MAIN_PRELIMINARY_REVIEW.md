# V3.7 Goal 3B Host Execution-Port Bridge Main Preliminary Review

```yaml
status: FAIL_V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_MAIN_PRELIMINARY_REVIEW
reviewed_on: 2026-08-21
candidate_commit: 73b8b9787dea1ec2cb4d43be547aef711f74fbb3
candidate_tree: c44862389bccd54c9911deb7127fcc72660dbc60
candidate_parent: a20a3115596ad41ec77de0607357deb492c57f08
finding: G3B-HOST-BRIDGE-MAIN-P1-001
audit_started: false
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Disposition

The Candidate is preserved unchanged but fails Main preliminary review with one bounded
P1 finding. The three-path allowlist, corrected daily-24 binding, lazy construction,
four-port composition and existing focused checks otherwise match the Amendment.

## Finding

`G3B-HOST-BRIDGE-MAIN-P1-001`: the Candidate-proposal port parses the model text and
records the `candidate_proposal` unit as `complete` before the existing bounded producer
checks output bytes and calls `validateProposalAndBuildCandidateV3`.

Therefore a syntactically valid JSON value that is not accepted by the frozen Candidate
contract can leave a persisted successful bridge unit even though the product action then
rejects it. This is an erroneous success-state/lifecycle inconsistency and violates the
Amendment requirement that Candidate output be exact JSON accepted by the existing
bounded producer. The existing malformed-text test does not cover valid JSON with an
invalid schema.

Local source proof is the call ordering between
`real-execution-ports-v37g3b.ts::candidatePort` and
`producer-v3.ts::createBoundedModelBackedProducerV3`. No external operation is required
to reproduce it.

## Correction 1

Use the Amendment's single ordinary correction capacity. Change only the existing three
Candidate paths:

1. before `Coordinator.complete`, enforce the existing producer output-byte maximum and
   call the existing `validateProposalAndBuildCandidateV3` with the frozen input;
2. return the original parsed proposal so the existing producer remains authoritative
   and revalidates it normally;
3. add a focused valid-JSON/invalid-Candidate-schema case proving rejection leaves no
   completed Candidate unit, no receipt and a faulted bridge;
4. preserve all other bridge behavior and configuration identities.

Run only the bridge focused test, directly affected authority test, strict TypeScript and
integrity checks. No broad suite is required. Create a new Candidate commit; do not amend
the failed Candidate. Audit remains locked until corrected Main re-review passes.
