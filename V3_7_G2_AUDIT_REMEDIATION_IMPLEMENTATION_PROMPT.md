# V3.7 Goal 2 Audit Remediation Implementation Prompt

~~~yaml
status: AUTHORIZED
amendment: V3_7_G2_AUDIT_REMEDIATION_AMENDMENT.md
goal: V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE
starting_commit: 3adb5654a24633375d3171f115e8b73d86c023ed
starting_tree: 333d265bab61ec81c0a84bbc2e24bca02253be89
remediation_budget: 1_of_1
implementation_owner: /root/v37_g2_implementation
candidate_commits_authorized: 1
audit_authority: false
goal_3_authority: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_tasks: 0
~~~

## Mission

Correct exactly V37-G2-AUDIT-P1-001: historical admission of an accepted follow-up is
incorrectly coupled to the current active State pointer and fails after a legitimate
production rollback.

Preserve every prior candidate commit/tree. Create one new candidate commit directly on
top of `3adb5654a24633375d3171f115e8b73d86c023ed` and stop for Main.

## Exact allowlist

Only these paths may change:

~~~text
workbench/src/v37/registered-follow-up-v37.ts
workbench/tests/v37g2-runtime-effective-followup.test.ts
docs/reports/V3_7_G2_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G2_CLOSEOUT_DRAFT.md
~~~

Do not edit State Store/CAS, State publication, rollback, registration/configuration or
any older-family source. If the repair cannot be completed within this allowlist, stop
and return the exact missing authority to Main.

## Required implementation outcomes

1. Preserve the current-active lineage validator for deriving a new binding and for all
   live prepare/dispatch/admission mutation boundaries.
2. Add or separate a historical-lineage validator that resolves the frozen binding's
   State version and promotion Decision by their recorded IDs and digests, validates the
   Decision `next_active` identity and the complete frozen validation/candidate/staged/base
   lineage, and does not require the current active pointer to equal that binding.
3. Keep the current State store structurally validated. A later valid pointer change may
   not rewrite the accepted binding or artifact identities.
4. Preserve fail-closed behavior for missing, changed, cross-workflow or inconsistent
   bound State, Decision, validation and lineage evidence.
5. Preserve disabled-registration behavior: already accepted history remains inspectable
   and normalizable read-only, while every new Host follow-up action remains blocked.

## Required deterministic tests

- complete the registered follow-up through accepted admission, record its canonical
  identity and accepted artifact identities, roll the active State back through the
  production API to its exact immediate parent, then prove historical admission
  inspection and normalization reopen with the same identities;
- disable the current registration after that rollback, repeat the stable read-only
  inspection/normalization, and prove new prepare, execute, submit and admit attempts are
  rejected without changing the accepted follow-up tree;
- prove tamper of the frozen bound State version, promotion Decision or validation
  lineage is still rejected after the current pointer has moved;
- run the full Goal 2 focused suite, Goal 1, V2-A inherited-loader, V3 State-lineage and
  Final Capstone G2 regressions, plus the strict environment-equivalent TypeScript check;
- run diff/allowlist and Pi-cleanliness checks without installing dependencies.

Record exact commands, counts, environment qualifications and anything unverified in
both implementation reports.

## Stop conditions

Stop without further editing if this requires allowlist expansion, another profile,
Manifest/Registry/Envelope changes, old-family semantic changes, Store/CAS or rollback
changes, Pi, Credential/network/Provider/model/Docker access or Goal 3 work. Do not audit,
accept Goal 2, update `CURRENT_STATE.md`, tag or push.
