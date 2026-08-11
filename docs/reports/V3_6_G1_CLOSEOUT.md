# V3.6 Goal 1 Closeout

```yaml
status: closed_accepted
goal_id: V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE
control_baseline_commit: 9a7c61f0c8d7b4febd0aacbf4b5a74c4d6a164ef
control_baseline_tree: 716fa06558f273b557fb58f930dd00b557a7769c
implementation_commit: 81bc7c8b5667efaa0c10df507a7a0d2a59827e1e
implementation_tree: 4630f6c5b42ed46ad2ed0f3ec644197c16519a8a
disposition: PASS_V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE
acceptance_owner: Main_Session
accepted_on: 2026-08-11
acceptance_control_commit: resulting_HEAD_of_this_revision
goal_2_started_by_this_closeout: false
```

## 1. Accepted result

The dedicated Implementation Session completed the zero-access V3.6 Goal 1 control plane. A browser can submit only an opaque registered project ID, `inspect_only` or planned `bounded_edit`, free task text, an optional title and an optional existing Session ID. The Host generates identities, snapshots current registered Source into a managed copy, pins Session authority, persists immutable Run Authority before dispatch, continues a public Pi JSONL Session across fresh processes and exposes safe read-only projections.

Main accepts `PASS_V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE` after the bounded correction and integrated verification described below.

## Main bounded correction

Main returned two concrete findings before acceptance. The amended Candidate now pins `file_write: false` and an explicit mode-dependent `planned_file_write` in the canonical capability identity, matching the safe Session view. It also exposes only the fixed `request rejected` message for unexpected HTTP failures while retaining vetted `HttpError` messages. Focused regressions independently recompute both mode digests and force a filesystem error containing an absolute Host path plus authority/secret-bearing material to prove it is absent from the response.

## 2. Exit Criteria mapping

| Exit Criterion | Accepted evidence |
|---|---|
| Host-only Authority and client-input separation | exact request schema plus ten injection-field HTTP/application cases |
| capability identity truthfulness | independently recomputed stored pin for both modes matches actual `file_write: false` and explicit planned-write semantics |
| write-before-dispatch | dispatch seam observes and validates write-once `authority.json` before AgentHarness invocation |
| two-Turn pinning and reopen | same pin digests across two Turns; separate Process A/Process B test; prior context reconstructed |
| truthful interactive semantics | `unverified`, null formal Outcome, all three eligibility flags false in Authority, Evidence and safe view |
| inspect-only safety | exact active tools `workspace_read`, `workspace_list`; write/edit/search/command absent; zero command executions |
| safe Workspace projection | bounded tree/text preview with traversal/reparse/link/hardlink/binary/oversize controls |
| Skill/Adaptation distinction | separate Pi-native and Harness-Adaptation arrays, both read-only |
| loopback/static/API compatibility | `127.0.0.1`; malformed path/body/method/content-type checks; V3.5 legacy routes retained |
| unexpected-error disclosure safety | forced filesystem/session failure returns only the generic response and omits absolute paths, authority/secret values and filesystem diagnostics |
| strict TypeScript/focused/affected regression | passed; 37 tests total, zero failures/skips |
| zero access and Pi immutability | Credential/network/Provider/real-model/project-command/Docker-command `0`; pinned Pi clean; zero patch |

## 3. Evidence

- Implementation Report: `docs/reports/V3_6_G1_IMPLEMENTATION_REPORT.md`
- ignored Gate A: `.runs/v3-6/g1/gate-a.json`
- ignored amended Evidence Index: `.runs/v3-6/g1/amended-evidence-index.json`
- amended Evidence Index SHA-256: `218973120b09c61e453bc71726064837128f8800dad45dca3907ffde4b97cf73`
- canonical amended evidence root: `.runs/v3-6/g1/final-evidence-amended-r2/`
- generated Evidence Index SHA-256: `9023580ce750851dc8c2286f2efc136de6cb19fe0640985302ad1f0828edfb62`
- verification summary SHA-256: `cc0bb0f00c0cc9fdd6c66ccbedc3914f581d293e6afd47ea83cfd29efecb3b8b`
- corrected capability digest: `aadcc809ad17ac8dc8c942de146abc78848160e37ce46a7009c633a2f11f1710`
- final commit identity: ignored `.runs/v3-6/g1/commit-identity.json` plus Session handoff

## 4. Claims boundary

Goal 1 may claim a Host-owned registered Project/Profile surface, server-minted immutable interactive Authority, pinned managed-copy Sessions, truthful unverified interactive Evidence, exact inspect-only tools, safe Workspace/Skill/Adaptation projections and deterministic/Faux two-Turn public-Pi continuation.

It may not claim Docker containment, project-command execution, actual bounded-edit enablement, ChangeSet or Source Apply/Discard, real open-agent behavior, Provider/model access, real-model continuation, statistical task improvement, crash recovery, exactly-once effects or production security.

## 5. Main acceptance and next boundary

Main reviewed the bounded Candidate, Source Delta, 22-file secret scan and raw Evidence Index, then reran strict TypeScript, Goal 1 9/9, V3.5 persistent 6/6, V3.5 Goal 3 11/11, Post-V3.5 11/11 and the loopback smoke from the integrated commit. No unresolved high-risk finding remains, so no independent audit is required.

Goal 1 is closed. The separate Docker Readiness Gate observed no Docker CLI on 2026-08-11 and therefore pauses for the user-owned Docker Desktop installation/license action. Goal 2 has not started, and this Closeout does not weaken that prerequisite.
