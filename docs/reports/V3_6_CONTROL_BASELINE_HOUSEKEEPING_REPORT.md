# V3.6 Control Baseline Housekeeping Report

```yaml
status: closed_accepted
date: 2026-08-10
kind: pre_v3_6_control_baseline_housekeeping
baseline_parent: 4cddf4e804aeb02629fd6cefe456a28a06492da8
control_baseline_commit: 00d0524a80b9c30f5ec141b733fb757e7a5f59d4
control_baseline_tree: be0ee4864250f7b29c803a9ba5c69f80be20668c
active_goal: null
execution_backend_selected: false
execution_backend_selection_authorized: false
v3_6_charter_created: false
v3_6_implementation_started: false
credential_reads: 0
external_network_calls: 0
provider_model_calls: 0
real_model_calls: 0
pi_core_changes: 0
```

## 1. Disposition

The pre-existing uncommitted files were divided by authority and purpose rather than
silently bundled into V3.6 implementation:

| Group | Disposition | Reason |
| --- | --- | --- |
| English/Simplified-Chinese WebUI delta | accepted as additive post-V3.5 presentation maintenance | It changes static labels, locale persistence and safe derived display text only; it adds no API authority, Runtime path, State mutation, evidence mutation or real access. |
| `OPEN_AGENT_UI_PRODUCTIZATION_DESIGN_RECOMMENDATION.md` | tracked as design provenance only | It records the design reasoning requested before V3.6. It is not a Charter, Goal Contract or implementation authority. |
| revised V3.6 Planning | tracked as independently reviewed preimplementation control input | Its two-Goal structure is accepted, while backend selection, Charter and implementation remain separate future controls. |
| `.runs/v3-6-control-baseline-housekeeping/` | ignored and excluded | It contains only local deterministic demo data and logs used for browser verification. |
| Credential, `reference/`, Pi source and unrelated material | excluded and unchanged | None is part of this maintenance or baseline. |

## 2. Accepted bilingual maintenance

The accepted maintenance comprises:

- `workbench/src/webui/static/i18n.js`: complete `en` and `zh-CN` dictionaries,
  deterministic locale selection, safe fallback, local browser preference and stable
  enum/derived-narrative presentation;
- `workbench/src/webui/static/i18n.css`: a small responsive language selector;
- `workbench/src/webui/static/index.html` and `app.js`: translated static/dynamic UI and
  an explicit Chinese/English switch;
- `workbench/src/webui/server-v35g3.ts`: two fixed static routes for the new JS/CSS
  assets under the existing loopback/CSP boundary;
- focused test coverage in `v35g3-i18n.test.ts` and the existing application/API suite.

The UI continues to expose raw IDs, digests, source references, Prompt/Skill diffs and
message content without translation or reinterpretation. English retains the original
evidence-derived narratives. The three Chinese summary narratives are generated only
from recognized structured kinds/enums; unknown shapes fall back to the original text.
The browser remains a presentation client and receives no new write or State authority.

## 3. Verification

Main independently ran:

| Check | Result |
| --- | --- |
| `npm.cmd run v35g2:typecheck` | exit 0 |
| `npm.cmd run v35g3:test` | 11 passed, 0 failed, 0 skipped |
| `npm.cmd run postv35:enablement:test` | 11 passed, 0 failed, 0 skipped |
| `git diff --check` | exit 0 |
| deterministic/Faux loopback browser review | Chinese → English → Chinese passed; title, `html lang`, pressed state, mode and labels updated |
| Chinese comparison projection | retained accepted Goal 2.5 no-advantage and V2 incomplete-Negative meanings |
| browser console | 0 errors |
| final local listener | 0 |
| pinned Pi | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |

No Credential was read, no external network or Provider/model call occurred, and the
accepted Post-V3.5 real journey was not rerun.

## 4. Control meaning

This baseline records an unambiguous starting point for the separately authorized future
Execution Backend Selection Gate:

- V3, V3.5 and Post-V3.5 accepted facts are unchanged;
- the bilingual UI is now ordinary accepted maintenance, not an ambiguous working-tree
  delta and not V3.6 implementation;
- the Open Agent UI recommendation is non-authoritative design provenance;
- the revised V3.6 Planning is accepted planning, not a frozen Charter;
- `active_goal` remains null;
- no backend has been selected and no Selection Gate, Sandbox PoC, V3.6 Goal, real access
  or Pi modification has begun.

## 5. Final repository boundary

The accepted housekeeping Control Baseline is commit
`00d0524a80b9c30f5ec141b733fb757e7a5f59d4`, tree
`be0ee4864250f7b29c803a9ba5c69f80be20668c`. Main verified that exact revision with a
clean tracked worktree and zero non-ignored untracked files. Generated housekeeping
artifacts remain ignored under `.runs/`; no other tracked or untracked item is carried in
the active baseline checkout.
