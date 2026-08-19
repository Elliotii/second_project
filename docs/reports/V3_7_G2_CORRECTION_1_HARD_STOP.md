# V3.7 Goal 2 Correction 1 Hard Stop

```yaml
status: DECISION_REQUIRED
disposition: HARD_STOP_V3_7_G2_NO_HONEST_REGISTERED_NEGATIVE_FOLLOW_UP
correction_round: 1
starting_candidate_commit: 584d233e31485d1bd87a7392ddc361200477ecf6
starting_candidate_tree: 3177f7303e82c0f774e4078773ed1669d65853f6
correction_source_delta: 0
correction_commit_created: false
real_access: credentials_0_network_0_provider_0_model_0
```

## Conflict

Charter Section 6.9 requires V3.7 Verifier/Outcome positive and negative coverage plus
canonical reassessment and strict rollback. The sole registered Goal 2 profile freezes a
faux response that always performs the correct source edit; the exact frozen Verifier
therefore honestly produces only `passed`.

The V3.7 canonical adapter accepts only a fully recomputed admitted follow-up package.
Producing a `failed` V3.7 admission under the current freeze would require at least one
forbidden action: mutate frozen Source or response behavior after dispatch, add a
caller/test-only fault injection, manufacture Outcome artifacts, or register another
execution profile/Case outside the accepted Amendment and Prompt.

The original implementation Session stopped before editing and did not consume a
correction candidate commit.

## Recommendation

Do not weaken the Goal 2 acceptance requirements. Authorize one additional exact
Host-registered deterministic negative follow-up execution scenario:

- same accepted Manifest, workflow, Candidate, promoted State, task, source and Verifier;
- a distinct fixed profile/scenario identity in the Goal 2 Host profile inventory;
- faux Provider response performs no source edit and makes no command/side effect;
- the unchanged frozen Verifier executes once and honestly returns `failed`;
- formal Outcome derives from that Verifier and may be admitted only with its distinct
  profile/scenario identity;
- no browser/caller free-form selection, dynamic enrollment, fault injection, retry,
  fallback, replacement, network or real model access;
- the positive and negative scenarios both traverse the same production V3.6 seam,
  observation, Verifier, Evidence, G1 admission and canonical G2 code.

This is a bounded deterministic fixture expansion, not a real Case and not Goal 3. It
allows Correction 1 to prove V3.7 reassessment and strict rollback honestly rather than
claiming those semantics only through the legacy adapter.

## Decision required

Main needs explicit user approval to amend the one-profile freeze and extend Correction
1's allowlist to the registered profile configuration/loader. Without approval, Goal 2
must remain unaccepted and Goal 3 locked.
