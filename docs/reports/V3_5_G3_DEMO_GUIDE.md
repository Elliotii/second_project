# V3.5 Goal 3 Demo Guide

## Start

From `workbench/`:

```powershell
npm run v35g3:demo
```

Open `http://127.0.0.1:43135` in a local browser. The process binds only to
`127.0.0.1`; it never binds to `0.0.0.0`.

The default mode is a portable deterministic/Faux demo. Its committed data is
derived and non-authoritative. Session create and continue write only to the
ignored local `.runs/v3-5-g3/demo-runtime/` area.

## Primary walkthrough

1. In **Session**, create an opaque Session ID and title.
2. Continue it with a unique Run ID. Observe the safe conversation/Tool
   rendering and settled Run metadata. Tool arguments are represented by a
   digest rather than raw arguments.
3. Open **Comparisons**. Review the limited V2 recovery disposition, then the
   Goal 2.5 Base/Candidate cards, Verifier outcomes and digest/source metadata.
4. Confirm the Goal 2.5 statement: both arms passed; no task-success advantage
   was observed for the Skill; Candidate used more tokens.
5. Open **Adaptation**. Follow Evidence → Diagnosis → Lesson → Prompt/Skill →
   Validation → Decision → active State → selective binding. Missing historical
   fields are labeled `not_recorded`/`unavailable` rather than inferred.
6. Inspect the Prompt and Skill diff summaries and selective-binding
   explanation.
7. Open **State history**. Review current active identity, versions, promotion,
   rejection and rollback history. Confirm the notice that browser rollback
   mutation is deferred.

## Host-configured read-only evidence

The host may configure allowlisted roots before startup:

```powershell
npm run v35g3:demo -- --pair-root <goal-2.5-pair-root> --v2-root <v2-terminal-root> --v3-root <v3-run-root> --state-root <state-root> --state-project-id <project-id>
```

Optional runtime locations and port may also be configured before startup:

```powershell
npm run v35g3:demo -- --port 43136 --data-root <local-session-data-root> --workspace-root <bounded-workspace-root>
```

These are host command-line options. Browser requests never contain filesystem
paths; they use fixed routes and opaque Session/Run IDs.

## Route inventory

| Method | Route | Purpose |
|---|---|---|
| GET | `/` | fixed HTML shell |
| GET | `/app.js` | fixed client logic |
| GET | `/styles.css` | fixed styles |
| GET | `/api/v1/overview` | bounded product/mode notice |
| GET | `/api/v1/sessions` | safe Session/Run aggregate |
| GET | `/api/v1/sessions/:id` | safe Session detail |
| POST | `/api/v1/sessions` | deterministic Session create |
| POST | `/api/v1/sessions/:id/turns` | deterministic/Faux continue |
| GET | `/api/v1/comparisons/v2` | limited V2 comparison |
| GET | `/api/v1/comparisons/goal25` | accepted Goal 2.5 comparison |
| GET | `/api/v1/adaptation` | V3 adaptation lineage |
| GET | `/api/v1/state-history` | read-only State history |

There is no route for artifact download, shell, arbitrary command/path,
Provider/model, environment, Credential, private reasoning or State mutation.

## Evidence identities

- Accepted Goal 2.5 comparison digest:
  `243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f`
- Portable projection SHA-256:
  `f7db468b44fac8520ea1c0e295d966e32f0a8ab47ff8f39563c5c501d5d1e33f`

The portable projection is a display aid. Raw Session, Run, Verifier,
comparison and State evidence remains authoritative.
