# V3.6 Architecture, Demo and Interview Guide

## One-sentence description

> I built a reliability-first Coding Agent Workbench on public Pi that turns a free-text
> task into Host-authorized, persistent execution in a managed workspace, runs only
> registered commands in a bounded Docker backend, records immutable evidence, and lets
> the user review an authenticated ChangeSet before the Host applies it.

## Architecture

```text
Browser (narrow task + opaque IDs)
  -> loopback-only Local API / WebUI
  -> Host Project Registry + immutable Authority
  -> pinned persistent Session
  -> public Direct Pi AgentHarness
  -> bounded file tools on managed_session_copy
  -> registered command ID
  -> fixed network-none Docker profile
  -> immutable terminal / Trace / Verifier evidence
  -> content-addressed ChangeSet
  -> user review
  -> Host Apply All / Discard / Export
```

### Responsibility boundaries

| Layer | Owns | Must not own |
|---|---|---|
| Browser | task text, requested mode, optional opaque Session ID, review action | paths, Credential, argv, image, mounts, Verifier or Source-write authority |
| Host Workbench | registry, Authority, budgets, Session pins, backend profile, Verifier, ChangeSet and Apply | model-defined success |
| Pi | public Agent loop, model/tool protocol and Session runtime | Workbench Outcome, backend policy or Source mutation authority |
| Agent tools | bounded reads/writes inside managed copy and registered command request | direct registered Source access or arbitrary shell |
| Docker backend | one disposable registered-command container | network, Source mount, Host fallback, Docker socket or alternate image |
| Evidence / Read Model | immutable raw artifacts and safe derived projections | execution or mutation authority |

## What V3.6 added

Goal 1 added the product control plane: registered projects, narrow open-task request,
Host-minted write-once Run Authority, persistent Session pinning, safe projections and
truthful `unverified` defaults.

Goal 2 added one execution backend and Change Handoff: fixed Docker argv/profile,
terminal evidence, managed-copy mutation, authenticated inventories/blobs, immutable
ChangeSet, safe Diff/Files/Changes views, and Host-only Apply/Discard/Export.

It reused V3/V3.5 Session, Run, Trace, Verifier, Harness State, Read Model and WebUI
mechanisms. It did not create a second Agent runtime or a general sandbox platform.

## Demo path

From `workbench/`:

```powershell
npm.cmd run v36g1:demo
```

Open `http://127.0.0.1:43136` and show:

1. a registered project and the narrow inspect-only/open-task form;
2. a new Session and a continued Session retaining pinned identities;
3. truthful `unverified` outcome semantics for ordinary free tasks;
4. safe Workspace/Files/Changes/Diff/backend projections;
5. the explicit Host handoff actions and why browser input cannot supply paths or Docker
   configuration;
6. the V3.6 real acceptance report as evidence for the separately governed bounded-edit
   Journey.

The tracked demo is zero-real-call. The real `v36g2:product` entry is a frozen acceptance
tool, not a general-purpose command to rerun casually.

## Real acceptance story

The frozen duration-parser Journey ran two prompts in the same persistent Session. Turn 2
contained 13 prior messages and the provider-observed context digest matched the
authenticated digest. The Agent used only managed-copy tools and registered Docker tests.
The fixed Verifier passed 3/3; the Host then applied the one-file ChangeSet.

```yaml
provider_requests: 11
tool_calls: 10
tokens: 53597
cost_usd: 0.0025941608
retry_fallback_replacement: 0_0_0
docker_leftovers: 0
```

Two pre-dispatch Windows mechanics failed before any Credential or runtime identity was
created (`npm.ps1` policy and a non-file-URL preload path). They were corrected without
changing frozen task inputs and are preserved in the report. This is a useful example of
distinguishing launch mechanics from post-dispatch experimental retries.

## Why the authority split matters

An LLM can propose edits and request a registered command, but it cannot decide which
Source directory is authoritative, change the Docker image/network/mount policy, declare
its own success, or apply bytes to Source. Those decisions remain outside the model in
Host-owned, digest-bound contracts. The UI also receives only safe projections, so a
browser request cannot manufacture execution authority.

## Relationship to earlier versions

| Version | Capability retained in V3.6 |
|---|---|
| V0 | Workspace, Run, Tool, Trace, external Verifier and Outcome foundation |
| V1 | Baseline/Skill/Runtime-Control comparison discipline and truthful negative results |
| V2 | isolated recovery candidates and environment-grounded selection substrate |
| V3 | typed Prompt/Skill Harness State, validation, promotion, rollback and binding |
| V3.5 | settled Session reopen/continue, safe Read Model and bilingual inspectable WebUI |
| V3.6 | open-task Host authority, bounded Docker execution and immutable Change Handoff |

## Claims and limitations

The strongest accurate claim is a real, bounded product loop with persistent context,
containerized registered-command execution, immutable evidence and user-reviewed Source
handoff.

Do not call it a production sandbox. It does not prove protection from Docker/Host/kernel
compromise, arbitrary-project compatibility, crash-safe or transactional multi-file
Apply, exactly-once Tool effects, statistical coding improvement, or autonomous continual
self-evolution.

## Short interview answer

> Pi owns the public Agent loop. My Workbench owns everything the model must not be able
> to redefine: project identity, Session pins, budgets, execution backend, verifier,
> evidence and Source apply. The Agent works only in a managed copy and can ask for a
> registered command; the Host runs it in one digest-pinned network-none Docker profile.
> After the Session settles, the Host derives an immutable ChangeSet, the user reviews it,
> and only a Host-controlled action can apply it. I validated the loop with deterministic
> regressions, a focused audit and one real two-Turn Journey, while keeping the claims
> bounded to that evidence.

## Key files

- `workbench/src/v36/authority-v36.ts` — Host-minted open-task authority.
- `workbench/src/session/persistent-session-v36.ts` — persistent Session control plane.
- `workbench/src/execution/docker-v36.ts` — fixed Docker registered-command boundary.
- `workbench/src/workspace/change-set-v36.ts` — authenticated ChangeSet creation.
- `workbench/src/webui/application-v36g2.ts` — safe review and Host handoff surface.
- `workbench/src/v36/product-entry-v36g2.ts` — frozen acceptance composition.
- `docs/reports/V3_6_G2_REAL_PRODUCT_ACCEPTANCE_REPORT.md` — real Journey evidence.
- `docs/reports/V3_6_CLOSEOUT.md` — authoritative version result and limits.
