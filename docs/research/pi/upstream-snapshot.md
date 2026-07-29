# Pi Upstream Snapshot

> Captured: 2026-07-29 (Asia/Hong_Kong)  
> Purpose: freeze the exact source basis for G001 Pi Source Audit.

## Identity

```yaml
repository: https://github.com/earendil-works/pi.git
checkout: .upstream/pi
branch: main
head: 027a5847901b5dde30270abaa1041046cd2b4b55
head_commit_date: 2026-07-28T18:51:44+02:00
head_subject: "feat(ai): add per-request fetch injection"
working_tree: clean
tracks: origin/main
clone_mode: partial_clone_filter_blob_none
```

## Release Relationship

```yaml
nearest_reachable_tag: v0.82.1
nearest_tag_commit: b4f293684bba718d59cc1157679bcf6157b3a7f5
commits_after_nearest_tag: 40
tag_exactly_on_head: false
published_package_version_in_relevant_manifests: 0.82.1
private_monorepo_root_version: 0.0.3
```

The checkout must therefore be described as the pinned post-`v0.82.1` `main`
snapshot above, not as the `v0.82.1` release itself.

Relevant package manifests at this commit:

| Package | Manifest version | Declared Node engine |
|---|---:|---:|
| `@earendil-works/pi-ai` | `0.82.1` | `>=22.19.0` |
| `@earendil-works/pi-agent-core` | `0.82.1` | `>=22.19.0` |
| `@earendil-works/pi-coding-agent` | `0.82.1` | `>=22.19.0` |
| `@earendil-works/pi-tui` | `0.82.1` | `>=22.19.0` |

## Local Runtime Compatibility

```yaml
node: 24.14.1
npm_cmd: 11.11.0
git: 2.53.0.windows.3
node_engine_check: compatible_by_declared_range
dependencies_installed: false
```

On this Windows host, automation should invoke `npm.cmd`, not the PowerShell
`npm.ps1` shim, because the current PowerShell execution policy blocks the
shim. This is a host invocation detail, not a Pi defect.

## License

- Repository license: MIT.
- Copyright notice: Mario Zechner, 2025.
- Any copied or substantially reused Pi code must retain the required license
  and copyright notice.

## Repository Rules in Force

The checkout contains one repository instruction file:
`.upstream/pi/AGENTS.md`. It was read before further source inspection.

Important constraints for later work include:

- read relevant files completely before making source claims;
- do not use `any` or weaken TypeScript types;
- use the repository-prescribed targeted test commands;
- never run the full test suite or build unless explicitly requested;
- install with ignored lifecycle scripts if hydration is later authorized;
- do not commit unless explicitly requested.

Project-level rules are stricter for the current phase: the pinned checkout is
read-only, dependencies are not installed during Bootstrap, and no formal
Workbench is created before the Pi basis decision.

## High-Priority Audit Signal

The 40 commits after `v0.82.1` include commits describing a durable
`AgentHarness`. The pinned tree contains, among other files:

- `packages/agent/docs/harness.md`;
- `packages/agent/src/harness/agent-harness.ts`;
- `packages/agent/src/harness/session/`;
- `packages/agent/src/harness/compaction/`;
- `packages/agent/src/harness/tools/`;
- `packages/agent/test/harness/`;
- `packages/agent/vitest.harness.config.ts`.

This is only a source-presence observation, not yet a capability conclusion.
G001 must determine whether the new direct `AgentHarness` API supersedes the
previous candidate architecture of Pi Coding Agent SDK Runner plus Inline
Extension.

## Reproduction Commands

The snapshot was verified with read-only commands equivalent to:

```powershell
git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C .upstream/pi rev-parse HEAD
git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C .upstream/pi status --short --branch
git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C .upstream/pi describe --tags --abbrev=0
git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C .upstream/pi rev-list --count v0.82.1..HEAD
```

The per-command `safe.directory` option is deliberate: it handles the Windows
sandbox identity mismatch without changing the user's global Git trust list.

