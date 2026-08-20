# V3.7 Goal 3B Host Execution-Port Bridge Implementation Prompt

You are the dedicated zero-real-access Implementation Session named in the accepted
`V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_AMENDMENT.md`.

## Authority and baseline

Read, in order:

1. `V3_7_CHARTER.md`;
2. `V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_AMENDMENT.md`;
3. `docs/reports/V3_7_G3B_EXECUTION_PROMPT_PREPARATION_HARD_STOP.md`;
4. `docs/reports/V3_7_G3B_CONFIGURATION_FREEZE_FOCUSED_AUDIT.md`;
5. `CURRENT_STATE.md`;
6. the exact existing source symbols cited by the Amendment.

Control baseline is the commit containing this Prompt. The immutable configuration
Candidate remains `f30914378dc90390afce7240b9755d7d24da0850` / tree
`667504572064c00fa170ac5952d8ef0af4a595ad`.

## Task

Implement only the Amendment's Host execution-port bridge. The sole production delta is
one new module, `workbench/src/v37/real-execution-ports-v37g3b.ts`. It must compose the
accepted public APIs into the exact four-port Product service construction without
changing any existing module or product contract.

Use one new focused test file and one implementation report. Tests must remain local and
deterministic. They may exercise an implementation-private injected runtime only through
test-local mechanisms that are not exported as a production alternative. Production
construction must pin the existing DeepSeek factory and must not resolve the opaque
Credential before an authorized dispatch.

## Prohibitions

- no Credential reads, environment-secret reads, external network, Provider/model calls,
  Docker product execution or Pi execution;
- no dependency installation;
- no edit outside the exact three-path allowlist;
- no configuration, fixture, loader, control-state or Execution Prompt edit;
- no retry, fallback, replacement, task swap, Candidate reproposal, arm rerun or result
  hunting;
- no raw Provider payload, header, Credential, environment dump or complete model text in
  source evidence or reports;
- no commit until all required focused checks pass; no audit, Goal acceptance or real
  authorization decision.

## Verification and report

Run the narrowest new focused test command, affected seven-test command only if the new
module or test directly depends on those behaviors, strict TypeScript, `git diff --check`,
exact allowlist and immutable configuration/source checks. Do not run broad suites.

The report must state exact changed files, commands/results, sanitized operation counters,
unverified real behavior and Candidate commit/tree/parent. Create one immutable Candidate
commit and return it to Main for preliminary review.

If any Amendment stop condition is reached, revert experimental tracked changes, write a
Hard Stop report only if it fits the report allowlist, and return without Candidate.
