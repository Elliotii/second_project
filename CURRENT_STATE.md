# Current State

> Updated: 2026-07-29

```yaml
project:
  name: Agent Harness Reliability Workbench
  phase: g002_ready
  status: ready_for_new_goal_session

active_goal: null

last_completed_goal:
  id: G001_PI_SOURCE_AUDIT
  status: complete
  contract: docs/goals/G001_PI_SOURCE_AUDIT.md
  architecture_review: accepted

next_goal:
  id: G002_PI_DIRECT_HARNESS_GO_GATE
  status: ready_to_start
  contract: docs/goals/G002_PI_DIRECT_HARNESS_GO_GATE.md

completed_work:
  - original_research_context_reviewed
  - deep_research_report_reviewed
  - current_plan_written
  - root_git_initialized
  - project_control_files_created
  - pi_downloaded_and_pinned
  - upstream_snapshot_created
  - G001_contract_created
  - G001_static_source_audit_completed
  - G001_evidence_package_created
  - G001_architecture_review_accepted
  - ADR_0001_direct_agentharness_for_G002_accepted
  - G002_draft_contract_created
  - G002_contract_activated
  - initial_project_commit_authorized
  - initial_project_commit_created

workspace:
  git_initialized: true
  initial_commit_created: true
  upstream_directory: .upstream/pi
  runs_directory: .runs
  formal_workbench_created: false

pi:
  downloaded: true
  remote: https://github.com/earendil-works/pi.git
  commit: 027a5847901b5dde30270abaa1041046cd2b4b55
  branch: main
  nearest_tag: v0.82.1
  commits_after_nearest_tag: 40
  exact_head_tag: null
  package_version: 0.82.1
  working_tree_clean: true
  source_audited: true
  source_audit_disposition: ACCEPT_FOR_DYNAMIC_VERIFICATION
  architecture_review: accepted_for_bounded_dynamic_verification
  basis_decision: provisional_accept_for_G002_only
  high_priority_signal: post_release_agent_harness_confirmed_public_but_semantically_in_progress

architecture:
  candidate: Direct pi-agent-core AgentHarness
  status: accepted_as_G002_primary_not_frozen_for_V0
  supersedes: Pi SDK Runner + Inline Extension as V0 experimental runtime basis
  retained_comparator: Pi Coding Agent SDK Runner + Inline Extension
  fallback: Pi RPC/process adapter only on observed isolation need

first_policy:
  candidate: Completion Verification
  status: not_frozen

implementation:
  dependencies_installed: false
  deterministic_spike_created: false
  real_model_run_completed: false

g002:
  contract_created: true
  contract_status: ready_to_start
  project_commit_policy: record_clean_root_HEAD_at_goal_start
  execution_environment: Windows_native_PowerShell
  wsl_authorized: false
  isolated_dependency_root: .runs/g002/pi
  scope: minimal_dynamic_go_gate

next_checkpoint:
  - execute_G002_in_new_goal_session
  - review_G002_dynamic_evidence_in_architecture_control_session

open_user_decisions: []
```

## Current Constraints

- Keep `.upstream/pi` immutable as the reference checkout.
- At G002 start, verify and record the clean root `HEAD` as `project_commit`.
- Install future G002 dependencies only in the isolated `.runs/g002/pi` clone.
- Do not create the formal Workbench or call a real model.
- Do not use WSL, SDK/RPC fallback, or a Pi core patch without new evidence and
  architecture review.
- Do not commit Git changes unless explicitly requested.

## Expected Next Handoff

Start a new Goal Session from the repository root using the prompt in
`docs/goals/G002_PI_DIRECT_HARNESS_GO_GATE.md`. It must record the clean root
`HEAD` dynamically in manifests and reports. After G002 closes, return to the
architecture/control session for evidence review. Final Pi Go, real-model
execution, the V0 Version Charter and architecture freeze remain unauthorized.
