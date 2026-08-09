# V3.5 Goal 3 Closeout — Local Inspectable Workbench

```yaml
status: closed_accepted
date: 2026-08-09
goal: V3_5_G3_ADAPTIVE_HARNESS_WEBUI_DEMO
disposition: PASS_V3_5_G3_LOCAL_INSPECTABLE_WORKBENCH
accepted_by_user: 2026-08-09
control_baseline_commit: 23592060f8fafd87d40180daef1a2350473978ae
implementation_commit: b5c34033a4ff64d2bacd01279823611193834920
implementation_session: 019fe550-10f3-7880-9502-4307722cd877
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patches: 0
credential_reads: 0
external_network_calls: 0
provider_model_calls: 0
real_model_calls: 0
state_mutation_http: false
```

## 1. Goal result

Goal 3 is complete and accepted. The frozen V3.5 evidence can now be inspected through a
thin local product surface:

```text
Browser
  -> fixed 127.0.0.1 API/static routes
  -> Workbench application and safe Read Model
  -> persistent Session service / typed evidence inspectors / State inspector
  -> existing Direct Pi AgentHarness and immutable evidence authorities
```

The browser is a presentation and bounded Session-operation client. It does not become an
authority over raw Session, Run, Verifier, comparison, promotion or Harness State data.

## 2. Accepted implementation

The accepted commit adds:

- a fail-closed Goal 2.5 Inspector that recomputes exact-key, digest, membership,
  fairness, counter, ordinary-file and lineage invariants;
- safe typed views for Session/Run, V2 recovery, Goal 2.5 comparison, V3 adaptation and
  State history;
- a Node built-in HTTP server bound only to `127.0.0.1` with fixed routes, bounded JSON
  bodies, opaque identifiers and conservative path handling;
- a dependency-free inspectability-first WebUI;
- bounded deterministic/Faux Session create and continuation through
  `PersistentSessionServiceV35`;
- a sanitized, derived and non-authoritative portable demo projection;
- a one-command local demo and concise usage guide.

Browser rollback mutation remains deliberately absent. Rollback history and active State
identity are inspectable, but there is no direct or indirect State-write HTTP route.

## 3. Exit Criteria

All nine Contract Exit Criteria are supported:

1. persistent Sessions can be listed, opened, reviewed and deterministically continued;
2. conversation, Tool and Session↔Run views omit unsafe raw material;
3. Run, Verifier, Outcome and bounded digest/source references are inspectable;
4. V2 and Goal 2.5 comparisons retain their accepted semantics and frozen digest;
5. adaptation, Prompt/Skill, State/version and selective-binding views are explainable;
6. rollback history is visible while State mutation is deferred and unavailable;
7. HTTP/static surfaces reject arbitrary paths and expose no Credential, shell or raw
   artifact route;
8. the portable demo runs with zero real access;
9. Direct Pi Runtime, accepted V2/V3 facts and pinned Pi source remain unchanged.

## 4. Verification

The Implementation Session and Main review both verified the accepted source tree.

Main independently obtained:

- strict TypeScript: pass;
- Goal 3 focused tests: 6/6 pass;
- Goal 1 affected read/safety tests: 5/5 pass;
- Goal 2.5 termination-safe tests: 13/13 pass;
- V3 State/decision regression: 6/6 pass;
- V3 selective-reuse regression: 7/7 pass;
- total focused/affected tests: 37 pass, 0 fail, 0 skip;
- accepted Goal 2.5 comparison file SHA-256:
  `26e398c922d1b78e3a5784b83875077156f63bd7eb42f6d46e5d7ccf0d636da9`;
- accepted embedded comparison digest:
  `243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f`;
- pinned Pi exact and clean at
  `027a5847901b5dde30270abaa1041046cd2b4b55`.

Main also started the frozen demo on loopback and exercised the actual UI in the in-app
browser. Session creation, deterministic/Faux continuation, Goal 2.5 comparison,
adaptation lineage and State history rendered correctly with no browser console errors.
The Implementation Session's earlier loopback-browser policy failure is therefore a
historical tool-environment observation, not a retained Goal 3 limitation.

## 5. Accurate Goal 2.5 representation

The product displays the accepted result without inventing a winner:

> Both arms passed; no task-success advantage was observed for the Skill; Candidate used
> more tokens.

The browser does not recompute or reinterpret this result. The host-side Inspector
validates the preserved evidence before producing the safe view.

## 6. Retained limitations

- Session continuation exposed by this Goal is deterministic/Faux, not a claim of
  cross-process real-model continuation.
- The UI is local and post-run oriented; it is not a production remote or multi-user
  service.
- Realtime token/Tool streaming and browser State mutation are not implemented.
- The portable projection is display data, not evidence authority.
- No claim is made about crash recovery, exactly-once Tool effects, general Skill benefit,
  arbitrary historical migration or production security.

## 7. Final state

- Goal 3 implementation is frozen at `b5c34033a4ff64d2bacd01279823611193834920`.
- The original Implementation Report and Closeout Draft remain historical Session
  deliverables; this document is the accepted Closeout.
- No further Goal 3 Credential, external network, Provider/model, real-model, dependency,
  Pi-change or State-mutation authority exists.
- V3.5 version disposition is recorded separately in `V3_5_CLOSEOUT.md`.
