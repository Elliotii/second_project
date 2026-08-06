# V2-A Corrected Candidate Focused Re-audit Pause Report

```yaml
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
session_role: fresh_focused_independent_audit_session
disposition: PAUSE_V2_A_GATE_A_FAILED
audit_started: false
source_repairs: 0
credential_reads: 0
network_calls: 0
provider_or_model_calls: 0
git_stage_or_commit: 0
```

## Gate A result

- **Fact — workspace:** `C:\Users\HUAWEI\.codex\worktrees\7675\project2` matched the authorized workspace.
- **Fact — root instructions:** the root `AGENTS.md` and `docs/reports/V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_SESSION_START_PROMPT.md` were read completely before the Gate A checks.
- **Fact — corrected Candidate commit:** `git rev-parse HEAD` returned exactly `d6d7a82081658d1782897319dd1e615578ad77c7`.
- **Fact — corrected Candidate tree:** `git show -s --format=%T HEAD` returned exactly `4802567158a66eba6748866442c3a3e6ae8010d8`.
- **Fact — root status:** `git status --porcelain=v1 --untracked-files=all` reported only the explicitly permitted untracked start prompt: `docs/reports/V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_SESSION_START_PROMPT.md`. No tracked or staged delta was reported.
- **Fact — Pi verification failed:** both `git -C '.upstream/pi' rev-parse HEAD` and `git -C '.upstream/pi' status --porcelain=v1 --untracked-files=all` failed with `fatal: cannot change to '.upstream/pi': No such file or directory`.
- **Unconfirmed — Pi identity and cleanliness:** because `.upstream/pi` is absent from this worktree, this Session could not establish that Pi is at `027a5847901b5dde30270abaa1041046cd2b4b55` and clean.
- **Not reached:** the remaining Gate A active-goal/authorization check was not performed after the first hard Gate failure.

## Exact command

Executed from `C:\Users\HUAWEI\.codex\worktrees\7675\project2`:

```powershell
Get-Location
git rev-parse HEAD
git show -s --format=%T HEAD
git status --porcelain=v1 --untracked-files=all
git -C '.upstream/pi' rev-parse HEAD
git -C '.upstream/pi' status --porcelain=v1 --untracked-files=all
```

The enclosing PowerShell invocation displayed exit code `0` because later output commands followed the failing native commands; the two Pi commands themselves emitted the fatal missing-directory errors quoted above. Their required assertions were not established.

## Stop and claims boundary

**Disposition: `PAUSE_V2_A_GATE_A_FAILED`.** The start prompt requires immediate stop when any Gate A condition is unmet. This Session therefore did not inspect P1-001..P1-005, did not inspect authoritative corrected Runs, did not run tests, and makes no conclusion about corrected-Candidate closure or V2-A acceptance. Main must restore or expose the pinned clean Pi checkout in the exact authorized worktree, or explicitly revise the Gate, before commissioning a fresh re-audit.
