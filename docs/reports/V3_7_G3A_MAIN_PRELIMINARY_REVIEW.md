# V3.7 Goal 3A Main Preliminary Review

```yaml
status: FAIL_MAIN_PRELIMINARY_REVIEW
goal: V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY
candidate_commit: 71dd205e5fea6610d855ababb16dd17d265d83e7
candidate_tree: e1a71cc0858b9f1b23fb54b49e0467e6702f94ed
candidate_parent: 5db8fcc2e1f15f35caed1e2a22ab9d222a4708f5
focused_audit_started: false
goal_3a_accepted: false
goal_3b_locked: true
ordinary_correction_round: 1_of_2
```

## Result

Main verified the exact Candidate identity and the implementation Session's bounded
test evidence, then independently exercised the frozen product, authority, persistence
and historical-reopen boundaries. The deterministic happy paths are present, but the
Candidate does not yet satisfy eight accepted Goal 3A conditions. These findings are
bounded by the Charter triage rule: each either blocks a frozen demonstration/acceptance
path, permits a false authoritative result, invalidates a core reusable-product claim,
or is an explicitly required regression. No optional platform expansion is authorized.

## Findings

### V37-G3A-MAIN-P1-001 — The reusable product path is still Case-hardcoded

`ProductServiceV37G3A` lists and creates only two source constants, while the registered
follow-up path constructs its deterministic faux runtime internally. A later reviewed
third Case therefore cannot enter the same product service and Host-owned execution path
through configuration alone. The Read Model also selects `no_recovery_needed` versus
`ready_for_recovery` from the Case id instead of the validated formal Primary terminal
outcome. This fails the Amendment and Prompt requirement that Goal 3A leave one stable,
Host-bound path for a later Goal 3B configuration append without implementation-source
changes. Correction must add Host-construction execution ports and registry-driven Case
discovery; browser/caller input remains non-authoritative and no real provider is added.

### V37-G3A-MAIN-P1-002 — A later workflow invalidates an earlier accepted workflow

Main completed two recovery workflows sequentially through all ten actions. Both reached
`complete`, but reopening the first then failed with `formal artifact reference drift:
state`. Its Regression receipt referenced the mutable shared `active.json` State pointer;
the second promotion legitimately advanced that pointer. A workflow journal must instead
reference the immutable accepted State version and promotion Decision identity. This is
an exact multiple-workflow isolation/restart Exit Criterion failure.

### V37-G3A-MAIN-P1-003 — Frozen Primary content drift is accepted

Main changed one byte-equivalent-behavior source fixture comment, ran the registered
Primary-pass workflow, and observed `no_recovery_needed`. The loader validates Manifest
metadata but the Primary execution does not revalidate the registered Task, instruction,
source tree and Verifier content it actually dispatches. The temporary change was restored.
Exact registered content must be checked before binding/execution, with deterministic Task,
Source and Verifier drift rejection tests.

### V37-G3A-MAIN-P1-004 — Default workflow identities collide after restart

The default workflow id serial resets to one in each service process. Creating a workflow,
reconstructing the service, and creating another produced an `EEXIST` registration error.
The production default must mint collision-resistant Host identities while deterministic
tests may inject a stable test mint.

### V37-G3A-MAIN-P1-005 — Descendant journal indirection is not rejected

Main replaced an existing workflow's `journal` directory with a Windows junction to a
copied directory. Reopen succeeded at `ready_for_primary`. Root containment alone does not
prove ordinary descendant paths; journal and receipt ancestors must reject symlink,
junction or reparse indirection. Formal artifacts also need the accepted ordinary-file,
single-link invariant so a hardlink cannot become accepted authority.

### V37-G3A-MAIN-P1-006 — The new authority fingerprint is incomplete and JSON bytes are not canonical

The new loader fingerprint hashes its direct loader source but omits the frozen v1
validator that supplies its Manifest/envelope admission semantics. Those semantics can
therefore change without changing the new trust-root identity. In addition, registered
JSON is parsed semantically but canonical serialized bytes are not enforced, although the
Prompt freezes canonical bytes. Bind all transitive authority-validator source identities
and reject non-canonical JSON bytes.

### V37-G3A-MAIN-P1-007 — Disabled historical preservation is not actually demonstrated

The named product test disables a registration immediately after workflow creation, when
the artifact inventory is empty. It does not reopen a completed accepted workflow and
prove its formal artifacts, admissions and Assessment remain byte/identity stable while
new actions are blocked. The report consequently overstates this acceptance evidence.

### V37-G3A-MAIN-P2-008 — The WebUI stylesheet contains a syntax regression

The Candidate changed the `.stage:after` `content` declaration so its closing quote is
missing. Existing text-presence assertions did not parse or otherwise catch the malformed
CSS. This can invalidate the new controls and later rules and is a frozen V3.6/WebUI
regression. Repair the declaration and add a deterministic syntax guard.

## Independent checks

| Check | Result |
|---|---|
| exact commit/tree/parent and Candidate allowlist | PASS |
| implementation focused/regression/strict TypeScript evidence | PASS as reported and spot-checked |
| two complete workflows, then reopen both | FAIL; first workflow rejected after second promotion |
| frozen Primary source drift | FAIL; drift incorrectly reached `no_recovery_needed` |
| service restart then create another workflow | FAIL; default id collision |
| descendant journal junction reopen | FAIL; junction incorrectly accepted |
| third configuration through same product path | FAIL by source and registered-path inspection |
| formal Primary-outcome routing | FAIL by source inspection; routing depends on Case id |
| completed disabled historical workflow preservation | NOT PROVEN; test disables empty workflow |
| stylesheet syntax | FAIL; malformed `content` declaration |

No Credential, environment-secret, network, external Provider/model, Docker product,
dependency installation or Pi access occurred. Main used only local deterministic fixtures
and exact ignored roots below `.runs/v37/`; the tracked drift probe was restored in a
`finally` path.

## Disposition

Candidate `71dd205e...` / `e1a71cc...` is preserved unchanged and is not an audit
candidate. Correction round 1 is required in the original dedicated Goal 3A
Implementation Session. Goal 3A remains unaccepted, focused audit has not started, and
Goal 3B remains locked.
