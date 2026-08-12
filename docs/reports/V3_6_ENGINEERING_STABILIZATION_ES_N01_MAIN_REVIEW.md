# V3.6 Engineering Stabilization ES-N01 Main Review

```yaml
status: accepted_normal_completion
campaign_id: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
case_id: ES_N01
disposition: ACCEPT_ES_N01_NORMAL_COMPLETION_NO_FINDING
test_session_id: 019ff181-51a8-7381-aae9-b8223e6a8bd3
session_id: v36-session-a002e73d-7894-4ec5-bff9-8a13e4f03f05
run_id: v36-run-a5e9c112-8cc4-4956-88d7-2000c2786f69
external_handoff_sha256: 6cddf552d21ac604ee4513c5f6544e737584c6b94ee122d0771c443f6fe3f7b0
finding: none
maintenance: none
retest: none
```

## Main disposition

Main independently inspected the handoff, authoritative Run and command artifacts,
Runtime Manifest, ChangeSet, Session pin, initial inventory, managed Workspace diff,
registered Source inventory, process/port state and Docker leftovers.

**Fact:** One clean Product Session and one Run naturally reached `settled: true`.
The Run remained `unverified` with formal Outcome `null`, as required by accepted daily
product semantics. The Agent used 10 Provider requests, 18 Tool calls, 49,841 combined
tokens and USD `0.001902936`, with substantial headroom and zero Tool errors.

**Fact:** The exact registered Docker command ran once and passed 16/16 tests, Exit Code
0, with a valid profile, one mount, no timeout/truncation/OOM and complete cleanup. The
completion claim is consistent with command, Workspace, ChangeSet and Source evidence.

**Fact:** The immutable proposed ChangeSet contains only `src/inventory.ts` and
`tests/inventory.test.ts`. Main read the exact proposed implementation/tests and found no
contradiction with the frozen task. Registered Source retained its original 14-file linear
inventory digest `fe94e4e28ea907df3feb1609a4a4a309b82dd099c8fa8cde40ddfe6a44705f8a`.
There was no Apply, Discard, Retry, Fallback, Replacement, continuation or second Turn.

**Fact:** Product port `43137` no longer listens and Docker leftovers are zero.

**Classification:** No F1–F11 Finding. Reading 11 distinct files was broader than the
minimal two-file implementation surface, but there were no repeated same-file reads,
failed Tools, post-pass exploration or budget pressure. Main accepts it as a minor
non-blocking observation rather than F4.

The handoff's Manifest and ChangeSet physical files exist at their stated relative paths,
and their SHA-256 values match `5a3156fd…` and `36d0c696…`. Main's first PowerShell read
mis-handled long literal paths, but a Node read confirmed both files. This was a Main
command issue, not a handoff defect or product Finding.

## Evidence identities

```yaml
authority_file_sha256: 579f95ed1ec270c674ef90480626276b18dd0e1fc3a36e5895d18c0bfc81d878
result_file_sha256: f2d1b3080acce36f08bc4539a2b29fb9f2f5f2f552c5d385bd0c876506881360
docker_terminal_file_sha256: 704ec14b8cc94125e88314216f84836f7789e4256913d7343a2c5fdeb9c5377a
runtime_manifest_file_sha256: 5a3156fd55da145e61c47b0ffa0a6885e984e198aac130f22a675a7db56ef460
change_set_file_sha256: 36d0c696623356881458deedbec7005f798f2644226d7f7b500c1f197503339c
session_file_sha256: 6f307d3ad66b2dcd96164e3aae23a5003ad5292802db7717c351e56cd70ae13d
initial_inventory_file_sha256: 789b4a7049e21c0c19769e0c7cd3b03cb522675dec0e921e080f80d4c169956c
result_evidence_digest: 7bf5b0bed79ac982cceafe5914a419cdf8543db7511087cdf93552996351fb9f
runtime_manifest_digest: ed61e73517b7a7956aa50d2a1b7e9ffe72556cbc3af9f1384d3d1e795867fe80
docker_terminal_digest: baba1e9005717138330f4d726d48bc135486d974a9033a03fe604dfd5e06a013
change_set_digest: 5da41824cc446deab4bb703ae53e652bd1386d41f003c94101102024c940ba60
```

ES-N01 needs no maintenance, Retest or audit. Its raw `.runs/` evidence and external
handoff remain immutable. Campaign Stop Conditions are not yet met after one new normal
Case, so Main may authorize the next differentiated Natural Case.
