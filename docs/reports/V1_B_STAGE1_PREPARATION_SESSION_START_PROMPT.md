# V1-B Stage 1 Preparation Session Start Prompt

```yaml
status: ready_for_dedicated_session
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
stage: stage_1_zero_call_execution_preparation
owner: dedicated_v1_b_preparation_session
control_baseline_commit: de75ca7a4d5376713f01ca475bc5ad7637c70443
control_baseline_tree: e930e1d0885b52bf911ed78912786723f321f06e
superseded_first_control_baseline: 84f548c93df40d8955a15572df30edac7b6df0fa
planning_baseline_commit: 51a0200450781faa7fb16c98b3547f294efcef7d
v1_a_implementation_baseline: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_install_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
git_commit_authorized: false
stage_2_authorized: false
```

浣犳槸 V1-B 鐨勪笓鐢?Stage 1 Preparation Session锛屼笉鏄富 Session锛屼篃涓嶆槸 Audit 鎴?Stage 2 Execution Session銆?
浣犵殑鍞竴浠诲姟鏄粠绮剧‘ Control Baseline锛?
```text
de75ca7a4d5376713f01ca475bc5ad7637c70443
```

瀹屾垚 `V1_B_GOAL_CONTRACT.md` 涓?Stage 1銆丟ates A鈥揓 鍜?Stage 1 DoD 鐨勯浂鐪熷疄璋冪敤
瀹炵幇锛屾彁浜よ瘉鎹笌鎶ュ憡鍚庡仠姝€備笉寰楁帴鍙楄嚜宸辩殑缁撴灉銆佸垱寤?Candidate Commit銆佸惎鍔?Audit 鎴栬繘鍏?Stage 2銆?
## 1. Gate A 鈥?蹇呴』鍏堝仛锛屽け璐ョ珛鍗冲仠姝?
鍦ㄤ换浣曟簮鐮佷慨鏀瑰墠锛?
1. 瀹屾暣璇诲彇褰撳墠 worktree 鐨?`AGENTS.md`锛?2. 纭锛?
```text
git rev-parse HEAD
git rev-parse HEAD^{tree}
git status --short
git diff --cached --name-only
```

蹇呴』鍒嗗埆绛変簬锛?
```text
HEAD = de75ca7a4d5376713f01ca475bc5ad7637c70443
tree = e930e1d0885b52bf911ed78912786723f321f06e
```

tracked/staged 蹇呴』 clean銆傝嫢 Codex 鍒涘缓 audit/implementation local branch锛屽彧瑕?HEAD/tree 绮剧‘涓€鑷村嵆鍙紱涓嶅緱 merge銆乺ebase銆乧herry-pick 鎴栨敼鍐?Baseline銆?
绗竴 Control Baseline `84f548c鈥 宸茬敱鍓嶄竴涓撶敤 Session鍦ㄥ疄鐜板墠鍙戠幇
`CURRENT_STATE.md` 鏈熬闄堟棫 inactive 鍙欒堪锛涜 Session浠?zero source/staged delta銆?zero credential/network/provider/model access 鍋滄銆傚綋鍓?`de75ca7鈥 鍙慨姝ｈ繖椤?鎺у埗鍙欒堪骞朵繚鐣欏叏閮ㄦ妧鏈?Scope/Gates/Budget銆備笉寰椾粠绗竴 Baseline 缁х画宸ヤ綔銆?
3. 鏍搁獙涓讳粨搴撳彧璇?Pi锛?
```text
D:/AI/AI_Projects/project2/.upstream/pi
HEAD = 027a5847901b5dde30270abaa1041046cd2b4b55
status = clean
```

杩涘叆 Pi 鍓嶅畬鏁磋鍙栬浠撳簱閫傜敤鐨?`AGENTS.md`銆侾i 鍙銆?
4. 璁板綍褰撳墠 worktree path銆乥ranch/detached state銆丯ode/TypeScript runtime 鏉ユ簮锛?5. 鏄庣‘璁板綍锛歝redential read銆乶etwork銆乪xternal Provider銆乺eal model 鍧囦负 0锛?6. 涓嶈鍙?`.env`銆乣.env.*`銆乣DEEPSEEK_API_KEY` 鎴栦换浣曠湡瀹?credential锛?7. 鑻ョ己灏戜緷璧栵紝涓嶅緱 install/download銆傚彲浠ュ湪鍏堥獙璇佺粷瀵圭洰鏍囧悗锛屾寜鏃㈡湁瀹¤鎯緥
   鍒涘缓 ignored worktree-local directory junction 澶嶇敤涓讳粨搴撲緷璧栵紝骞惰褰曡矾寰勶細

```text
D:/AI/AI_Projects/project2/workbench/node_modules
D:/AI/AI_Projects/project2/.runs/v0-a/pi/node_modules   # 浠呭湪鏃㈡湁娴嬭瘯纭疄闇€瑕佹椂
```

涓嶅緱閫氳繃 junction 淇敼鐩爣锛屼笉寰楁妸 junction 绾冲叆 source delta 鎴?Git銆?
Gate A 浠讳竴涓嶆弧瓒筹紝鍐?`V1_B_STAGE1_PAUSE_REPORT.md` 骞跺仠姝€?
## 2. 蹇呰鏂囦欢

鎸夐『搴忓畬鏁磋鍙栵細

```text
AGENTS.md
CURRENT_STATE.md
docs/绗簩椤圭洰_Codex浜ゆ帴鍖卂2026-07-30/V1_VERSION_CHARTER.md
docs/绗簩椤圭洰_Codex浜ゆ帴鍖卂2026-07-30/09_瀵规帴鎵ц銆佹枃浠舵潈濞佷笌楠屾敹瑙勫垯.md
docs/绗簩椤圭洰_Codex浜ゆ帴鍖卂2026-07-30/V1_B_GOAL_CONTRACT.md
docs/reports/V1_B_INTEGRATED_DEVELOPMENT_PLAN.md
docs/reports/V1_B_PRECONTRACT_READINESS_PAUSE_REPORT.md
docs/reports/V1_A_CLOSEOUT.md
docs/reports/V1_A_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md
docs/decisions/ADR-0003-direct-agentharness-for-bounded-robustness.md
```

闅忓悗瀹屾暣妫€鏌?Contract 鎸囧畾鐨勫綋鍓?V1-A/V0-C source/test 鍜屽浐瀹?Pi public symbols銆?澶栭儴璧勬枡涓嶈兘瑕嗙洊鏈湴婧愮爜浜嬪疄銆傛湰 Stage 涓嶇爺绌?SkillOS銆丆laude Code mirror銆?SearchCLI銆乊outu-Agent銆丼DK/Extension 鎴?V2/V3銆?
## 3. 瀹炵幇鐩爣

鏈€灏忓疄鐜帮細

1. tracked public Pi + fixed DeepSeek `PiRunHandleV1`锛?2. versioned one-Run capability锛氫竴娆?capability 鍙兘鍒涘缓涓€涓?bounded Run锛屼絾璇?   Run 鍐呭厑璁搁绠楀唴澶氳疆 Provider request锛涗繚鐣?V1-A accepted one-request seam 鍜?   regressions锛屼笉闈欓粯鏀瑰啓鍘嗗彶璇箟锛?3. 鍗?cell runner锛?4. immutable Manifest 寮哄埗鐨?`run-next`锛?5. append-only/write-once Pilot ledger锛?6. terminal artifacts 鈫?`RunResultV1` 鐨勭嫭绔?Inspector锛?7. read-only aggregate锛?8. `preflight` / `run-next` / `inspect` / `aggregate` product surface锛?9. V1-B execution Manifest template锛屽寘鍚?Contract 鍐荤粨鐨?8 block/24 cell order锛?10. 24-cell Faux zero-call simulation 鍜屽繀瑕?regressions銆?
涓嶅緱杩愯鐪熷疄 Pilot銆係tage 1 瀵圭湡瀹?Provider 鍙厑璁?fake/non-secret construction 鍜?zero-dispatch proof銆?
## 4. 鍙啓鑼冨洿

鍙厑璁镐慨鏀?鍒涘缓锛?
```text
workbench/src/provider/fixed-provider-v1.ts
workbench/src/pi/pi-run-handle-v1.ts
workbench/src/run-v1.ts
workbench/src/pilot-v1.ts
workbench/src/inspect-v1.ts
workbench/src/product-surface-v1.ts
workbench/src/cli.ts
workbench/src/contracts/v1-types.ts
workbench/src/experiment/v1.ts
workbench/tests/v1b-stage1.test.ts
workbench/tests/v1b-cli.test.ts
workbench/package.json
workbench/README.md
fixtures/manifests/v1/v1b-*
docs/reports/V1_B_STAGE1_*
.runs/v1-b/stage1/**
```

`package.json` 鍙厑璁稿繀瑕?scripts/exports锛涗笉寰楁敼鍙?dependency/lockfile銆?
鐜版湁 accepted task銆丼kill銆乂erifier銆丼ystem Prompt銆乻trategy fixtures锛孷0 source锛?Pi銆乺eference銆丆harter銆丆ontract銆?9銆丄DR銆乣CURRENT_STATE.md` 鍧囧彧璇汇€?
鑻ュ繀椤讳慨鏀规湭鍒楄矾寰勶紝绔嬪嵆鏆傚仠骞舵彁浜?Source Expansion Proposal锛涗笉寰楀厛鏀瑰悗鎶ャ€?
## 5. 鎶€鏈笉鍙橀噺

### 5.1 Fairness

- A/B/C Task銆乄orkspace銆丮odel銆乀ools銆乂erifier銆丼ystem Prompt銆乮nitial Budget 鐩稿悓锛?- A鈫払 鍞竴 model-visible delta 鏄?explicit Skill wrapper + frozen Skill body锛?- B鈫扖 initial Verifier 鍓嶆棤 model-visible delta锛?- 姣旇緝鐪熷疄 dispatch 鍓嶅畬鏁?model descriptor銆乵essages銆乼ools銆乺equest options锛?- policy/experiment/recovery identity host-only銆?
### 5.2 Recovery

- A/B 姘告棤 child锛?- C pass 鏃?child锛?- Provider/infra/evidence invalid 鏃?child锛?- 鍙湁 valid failed Verifier + eligibility + Stop Policy + full reserve 鍒涘缓涓€涓?child锛?- child 涓?parent 鍚?Process/Session/Workspace锛?- C-initial/C-final 鏄?checkpoint锛屼笉鏄鍥?arm銆?
### 5.3 Budget

瀹炵幇骞舵祴璇?Contract 鐨勫叏閮ㄤ笁灞?caps锛?
```text
initial: 8 requests / 12 tools / 65536 tokens / 300s / USD0.10
C run: 16 requests / 24 tools / 131072 tokens / 2 verifiers / 1 child / 900s / USD0.20
Pilot: 24 initial / 32 attempts / 256 requests / 384 tools / USD2 / 7200000ms active execution
```

姣忎釜 request/tool/child 鍓嶅厛 reserve銆倁nknown usage/cost fail closed銆侼o fallback銆?same-Run retry 鎴?replacement銆?
### 5.4 Evidence and secrets

- immutable Manifest 涓?runtime Pilot ledger 鍒嗙锛?- evidence write-once锛?- Inspector/aggregator read-only锛?- fake credential marker 涓嶅彲缁?error/Journal/Session/evidence 閫稿嚭锛?- no credential value/hash/length/prefix/suffix锛?- no reasoning blocks锛?- hidden Verifier/protected paths 涓嶅彲鐢?Agent 璇诲彇鎴栦慨鏀广€?
## 6. Gates and tests

閫愰」鎵ц Contract Gates A鈥揓锛屽苟寤虹珛锛?
```text
Contract clause
鈫?source symbol
鈫?positive test
鈫?independent negative/counterexample test
鈫?evidence path
```

鏈€浣庢祴璇曪細

- strict TypeScript锛?- 24-cell zero-call end-to-end锛?- concrete factory zero-dispatch construction锛?- full B/C payload/model equality + negative drift锛?- A/B/C child matrix锛?- per-dispatch/child/Pilot Budget锛?- one-Run authority reuse rejection锛?- terminal/Inspector/ledger/Manifest counterexamples锛?- pause threshold锛?- fake credential/reasoning scan锛?- fresh Windows Git blob/worktree identities锛?- V1-A focused regression锛?- necessary V0-C regressions锛?- full Workbench regression only when concrete non-local evidence requires it銆?
涓嶅緱浠ュ綋鍓嶆祴璇曠豢鏇夸唬 Contract traceability銆?
## 7. Pause Conditions

鍛戒腑 Contract 搂19 浠讳竴鏉′欢绔嬪嵆鍋滄銆傚挨鍏讹細

- Pi patch/private import/SDK/RPC/Extension need锛?- install/download need锛?- B/C complete request drift锛?- pre-dispatch Budget 鏃犳硶鎵ц锛?- secret/reasoning/protected-path leak锛?- Manifest/ledger/terminal/Inspector 涓嶄竴鑷达紱
- Scope 闇€瑕佹湭鎺堟潈鏂囦欢锛?- real credential/network/Provider/model access锛?- general provider/eval/scheduler/database/dashboard/Worktree/V2/V3 expansion銆?
Pause 鎶ュ憡鍙啓瑙傚療銆佽瘉鎹€佸凡鏀?source delta銆乧ommands/exits 鍜屾墍闇€ Main/User
鍐冲畾锛屼笉鑷鏀瑰彉 Scope銆?
## 8. 鏈€缁堜氦浠?
蹇呴』鎻愪氦锛?
```text
docs/reports/V1_B_STAGE1_IMPLEMENTATION_REPORT.md
docs/reports/V1_B_STAGE1_CLOSEOUT_DRAFT.md
Source Delta
Commands and Exit Codes
Evidence Index
Contract Traceability Matrix
Execution Baseline / Manifest Binding Proposal
CURRENT_STATE_UPDATE_PROPOSAL
```

鎶ュ憡蹇呴』鏄庣‘锛?
- exact start HEAD/tree/Pi锛?- final tracked/staged/source delta锛?- all tests and exits锛?- real credential/network/provider/model counts = 0锛?- 鏈獙璇侀」锛?- Gate A鈥揓 鍜?DoD 閫愭潯 pass/fail锛?- 寤鸿 `PASS_V1_B_STAGE1_EXECUTION_READY`銆乣REVISE_V1_B_STAGE1` 鎴?  `PAUSE_V1_B_STAGE1`锛?- Stage 1 PASS 涓嶇瓑浜?V1-B/V1 accepted锛屼笉璇佹槑 Skill/Runtime effect銆?
涓嶅緱淇敼銆佹殏瀛樻垨鎻愪氦 `CURRENT_STATE.md`銆傚彧鍦ㄦ姤鍛婁腑鍐欑粨鏋勫寲
`CURRENT_STATE_UPDATE_PROPOSAL`銆?
瀹屾垚鍚庡仠姝紝绛夊緟 Main Session 鍜岀敤鎴烽獙鏀躲€備笉寰楀垱寤?Git Commit銆丄udit Prompt銆?Execution Baseline銆丼tage 2 Prompt銆乣.runs/v1-b` 鐪熷疄 Pilot 鎴栦换浣曠湡瀹炶皟鐢ㄣ€?
