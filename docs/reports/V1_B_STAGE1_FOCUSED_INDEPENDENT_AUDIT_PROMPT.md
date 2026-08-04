# V1-B Stage 1 Focused Independent Audit Prompt

```yaml
status: authorized
role: fresh_independent_v1_b_stage1_audit_session
candidate_commit: 951e9161300eacd408e232aa6d1fa66ac02d0e10
candidate_tree: a9ad6eee8ae4cfe32ee3e9e04613a8d16e5296f6
candidate_manifest_id: ec8a7a6f8dcc375dd18781e8f54b2ab00f5d2d7fba3938dee1011933de5f3b3b
candidate_source_digest: ce768cfd8af488861b251d94b6b5e14dec164e453c65bdba444fdc5aa0ade127
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
source_repair_authorized: false
git_commit_authorized: false
credential_reads_authorized: 0
external_network_authorized: false
external_provider_calls_authorized: 0
real_model_calls_authorized: 0
execution_baseline_authorized: false
stage_2_authorized: false
```

## 1. Role

浣犳槸 V1-B Stage 1 鐨?fresh focused independent Audit Session銆備綘涓嶅睘浜庡師
Preparation Session锛屼篃涓嶆槸 Main Session銆備綘鍙兘浠庝笂杩?exact Candidate Commit/tree
杩涜鍙婧愮爜瀹¤銆佽繍琛屾巿鏉冪殑 deterministic regressions銆佸垱寤?ignored audit-local
evidence锛屽苟鎻愪氦 Audit Report銆?
涓嶅緱淇婧愮爜銆佷慨鏀?Manifest/fixture/Contract/Charter/CURRENT_STATE銆佷慨鏀?Pi銆佹殏瀛樻垨
鎻愪氦 Git銆傚彂鐜?finding 鍚庝繚鐣欏弽渚嬪苟鎶ュ憡锛岀敱 Main Session 鍐冲畾鏄惁浜ゅ洖鍘?Preparation
Session銆?
## 2. Required reading and Gate A

鍏堝畬鏁磋鍙栵細

1. Candidate checkout 鍐?`AGENTS.md`锛?2. `CURRENT_STATE.md`锛?3. `docs/绗簩椤圭洰_Codex浜ゆ帴鍖卂2026-07-30/V1_VERSION_CHARTER.md`锛?4. `docs/绗簩椤圭洰_Codex浜ゆ帴鍖卂2026-07-30/09_瀵规帴鎵ц銆佹枃浠舵潈濞佷笌楠屾敹瑙勫垯.md`锛?5. `docs/绗簩椤圭洰_Codex浜ゆ帴鍖卂2026-07-30/V1_B_GOAL_CONTRACT.md`锛岄噸鐐?搂7鈥撀?9锛?6. `docs/reports/V1_B_STAGE1_IMPLEMENTATION_REPORT.md`锛?7. `docs/reports/V1_B_STAGE1_CLOSEOUT_DRAFT.md`锛?8. `docs/reports/V1_B_STAGE1_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md`锛?9. Candidate 鐨?V1-B source/tests/Manifest锛?10. Contract 鎸囧畾鐨?V1-A/V0-C reuse 涓庡洖褰掕矾寰勶紱
11. 璁块棶 `.upstream/pi` 鍓嶅畬鏁磋鍙栭€傜敤 Pi `AGENTS.md`銆?
Gate A 蹇呴』鏍搁獙锛?
- HEAD = `951e9161300eacd408e232aa6d1fa66ac02d0e10`锛?- tree = `a9ad6eee8ae4cfe32ee3e9e04613a8d16e5296f6`锛?- 璧峰 tracked/staged clean锛?- Pi exact/clean锛?- Manifest/source digest 鍒嗗埆绮剧‘鍖归厤鏈?Prompt锛?- `reference/` 涓嶄慨鏀癸紱
- credential/network/external Provider/model 涓?`0 / 0 / 0 / 0`銆?
浠讳綍 identity 涓嶇绔嬪嵆鏆傚仠锛屼笉瀹¤鐩歌繎 checkout銆?
## 3. Focused audit scope

鍙鐩?Contract 搂14 鐨勯珮椋庨櫓杈圭晫锛屼紭鍏堥獙璇佽€屼笉鏄噸澶嶅疄鐜版姤鍛婏細

1. Git/source/fixture/Manifest identity锛?2. public emitted Pi import/composition锛屼笉浣跨敤 private import銆丼DK/RPC/Extension锛?3. B/C complete initial dispatch equality 涓?A/B exact frozen Skill treatment锛?4. one-Run authority銆乴azy credential boundary銆乪rror sanitization锛?5. per-dispatch usage/cost reserve銆丄ttempt/Run/Pilot 鍘熷瓙鎬т笌 cap锛?6. C-only eligibility銆乻ame Session/Workspace銆乴ineage銆乧omplete child reserve锛?7. 24-cell Manifest銆乤ppend-only ledger銆乼erminal/invalid/paused銆亀rite-once evidence銆?   independent Inspector/aggregate锛?8. hidden Verifier銆乸rotected paths銆乻ecret/reasoning final-byte scan锛?9. targeted V1-B/V1-A 涓庡繀瑕?V0-C regression銆?
### 蹇呴』鐙珛澶嶆牳鐨?F-001鈥揊-005

- F-001锛歝oherent rehash 鍚庨敊璇?task/Skill/Verifier/Workbench binding銆佺己澶?閲嶅
  Verifier refs 蹇呴』琚?Inspector 鎷掔粷锛?- F-002锛氬ぇ灏忓啓 Authorization銆丅earer銆乺easoning/thinking/signature 鍜?fake error marker
  杩涘叆鏈€缁?evidence 蹇呴』琚?producer 鎴?Inspector 鎷掔粷锛?- F-003锛氫换鎰?treatment 鏂囨湰銆佺己/澶?wrapper銆侀敊璇?Skill body銆乵odel/options/tool drift
  涓嶅緱琚綊涓€鍖栨帺鐩栵紱
- F-004锛歵yped infrastructure/evidence/treatment invalid銆乽nknown/global pause銆乨enominator銆?  25% 鍜?repeated-cause stop 蹇呴』绗﹀悎鍐荤粨 policy锛?- F-005锛歳eserve failure 鏃犲崐鏇存柊锛沜hild time/Verifier capacity 瀹屾暣锛況eservation
  before/reserved/actual/after/cap 鍜岃法 Run Pilot continuity 鍙嫭绔嬮噸绠椼€?
鑷冲皯鑷璁捐涓€椤逛笉鏄師娴嬭瘯閫愬瓧澶嶅埗鐨?adversarial counterexample锛涜嫢鍘熸祴璇曞凡缁忚冻澶燂紝
璇存槑涓轰綍锛屽苟鎶婄嫭绔嬫鏌ヨ惤鍏?audit-local evidence銆?
## 4. Bounded verification

鍏佽锛?
- strict TypeScript锛?- V1-B focused tests锛?- V1-A focused regression锛?- Contract 鎸囧畾鐨勫繀瑕?V0-C deterministic/post-audit regressions锛?- 鍦?`.runs/v1-b/audit/**` 寤虹珛 ignored evidence/copies锛?- 鍙鏌ョ湅鍥哄畾 Pi public symbols/tests锛?- 蹇呰鐨?fresh Windows `core.autocrlf=true` identity spot-check銆?
涓嶈姹傚啀娆¤繍琛屽畬鏁?24-cell Pilot锛屽彧瑕侊細

- 楠岃瘉 Candidate 鑷甫 authoritative evidence 鐨?Manifest/ledger/aggregate锛?- 杩愯瓒充互璇佹槑 finding boundary 鐨勬渶灏?deterministic cells/copies锛?- 鍙湁鍙戠幇鍏蜂綋涓嶄竴鑷存椂鎵嶆墿澶у埌瀹屾暣 Stage 1 simulation銆?
涓変唤 Markdown 鍦?`autocrlf=true` 涓嬪彲鑳借浆鎴?CRLF锛屼笖涓嶅湪 Workbench source digest
domain锛涗笉瑕佹妸杩欎竴宸茬煡銆佸凡瑙ｉ噴鐜拌薄鍗曠嫭鍗囩骇涓?blocking finding銆傝嫢瀹冨疄闄呭奖鍝?Git
identity銆佹姤鍛婂彲璇绘€ф垨瀹¤澶嶇幇锛屽啀鎸夎瘉鎹姤鍛娿€?
绂佹锛?
- credential/env secret 璇诲彇锛?- 澶栭儴缃戠粶鎴?Provider/model 璋冪敤锛?- dependency install/download锛?- Pi patch/private import锛?- source/fixture/report淇锛?- general platform銆乂2/V3銆丼DK/Extension 鐮旂┒锛?- 鍏ㄩ潰閲嶅 V0/Pi/Windows锛?- Candidate Commit銆丒xecution Baseline 鎴?Stage 2銆?
## 5. Finding rules

姣忛」 finding 蹇呴』鍖呭惈锛?
```yaml
finding_id:
severity: P0 | P1 | P2 | P3
contract_boundary:
source_symbol:
independent_counterexample:
observed_result:
expected_result:
evidence_path:
candidate_impact:
minimal_correction_owner: original_v1_b_stage1_preparation_session
required_regressions:
```

鍙姤鍛婁細褰卞搷 Candidate 姝ｇ‘鎬с€丼tage 2 瀹夊叏鎵ц銆佽瘉鎹湁鏁堟€ф垨 Contract DoD 鐨勯棶棰樸€?涓嶆妸椋庢牸銆佸懡鍚嶅亸濂姐€佹湭鏉ユ墿灞曟垨涓€鑸€у姞鍥鸿嚜鍔ㄥ崌绾т负 blocker銆?
## 6. Deliverables and stop point

鍦?Audit worktree 涓彧鏂板锛?
- `docs/reports/V1_B_STAGE1_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`锛?- `.runs/v1-b/audit/evidence-index.json` 鍙婂繀瑕?ignored evidence銆?
鎶ュ憡鑷冲皯鍖呭惈 exact Candidate/Pi/worktree identity銆乧ommands/exit codes銆侀€愰」 F-001鈥揊-005
缁撹銆佸叾浠?concrete findings銆亃ero-access accounting銆佹湭楠岃瘉椤瑰拰寤鸿 disposition锛?
```text
PASS_FOCUSED_V1_B_STAGE1_AUDIT
REVISE_V1_B_STAGE1_AFTER_AUDIT
PAUSE_V1_B_STAGE1_AUDIT
```

瀹屾垚鍚庣珛鍗冲仠姝€備笉寰楁帴鍙?V1-B銆佸垱寤?commit銆佷慨鏀规帶鍒剁姸鎬併€佸噯澶?Execution Baseline
鎴栬繘鍏?Stage 2銆?
