export const STORAGE_KEY = "adaptive-harness-workbench.locale";
export const SUPPORTED_LOCALES = Object.freeze(["en", "zh-CN"]);

export const messages = Object.freeze({
  en: Object.freeze({
    "page.title": "Adaptive Harness Workbench",
    "product.title": "Adaptive Harness Workbench",
    "product.version": "V3.6 · Open task control plane",
    "product.loading": "Local · loading mode",
    "language.selector": "Interface language",
    "sidebar.sessions": "Sessions",
    "form.newSessionId": "New Session ID",
    "form.title": "Title",
    "form.runId": "Run ID",
    "form.prompt": "Prompt",
    "action.create": "Create",
    "action.continue": "Continue",
    "nav.label": "Workbench views",
    "nav.session": "Session",
    "nav.comparisons": "Comparisons",
    "nav.adaptation": "Adaptation",
    "nav.stateHistory": "State history",
    "eyebrow.sessionRun": "Session ≠ Run",
    "eyebrow.frozenEvidence": "Frozen evidence",
    "eyebrow.inspectableLineage": "Inspectable lineage",
    "eyebrow.readOnlyAuthority": "Read-only authority projection",
    "heading.conversation": "Conversation and Tool trace",
    "heading.comparisons": "Base / Candidate comparisons",
    "heading.adaptation": "How evidence becomes selective binding",
    "heading.state": "State, decisions, versions and rollback",
    "notice.stateReadOnly": "Browser rollback mutation is deferred. This view never writes State.",
    "empty.chooseSession": "Choose or create a Session.",
    "sessions.none": "No Sessions yet.",
    "sessions.runCount": "{count} Runs",
    "common.notRecorded": "not recorded",
    "common.unavailable": "unavailable",
    "common.sourceUnavailable": "source unavailable",
    "common.noCallId": "no call ID",
    "common.tool": "tool",
    "error.requestFailed": "Request failed",
    "error.requestRejected": "Request rejected",
    "card.safeConversation": "Safe conversation / Tool projection",
    "card.runs": "Runs",
    "card.goal25": "Goal 2.5 · Base versus Candidate",
    "card.v2Recovery": "V2 recovery comparison",
    "card.selectiveBinding": "Selective binding",
    "card.promptDiff": "Prompt diff",
    "card.skillDiff": "Skill diff",
    "card.currentActive": "Current active identity",
    "card.versionHistory": "Version history",
    "card.decisionHistory": "Decision / rollback history",
    "card.stateVersion": "State v{version}",
    "metric.session": "Session",
    "metric.project": "Project",
    "metric.workspaceId": "Workspace ID",
    "metric.parent": "Parent",
    "metric.source": "Source",
    "metric.mode": "Mode",
    "metric.priorRun": "Prior Run",
    "metric.settled": "Settled",
    "metric.providerRequests": "Provider requests",
    "metric.tokens": "Tokens",
    "metric.tokenCounts": "{input} in / {output} out",
    "metric.costUsd": "Cost USD",
    "metric.toolCalls": "Tool calls",
    "metric.contextReconstructed": "Context reconstructed",
    "metric.verifier": "Verifier",
    "metric.outcome": "Outcome",
    "metric.binding": "Binding",
    "metric.sourceRef": "Source ref",
    "metric.comparisonDigest": "Comparison digest",
    "metric.payloadFairness": "Payload fairness",
    "metric.trajectory": "Trajectory",
    "metric.dispatches": "Dispatches",
    "metric.manifest": "Manifest",
    "metric.evidenceStatus": "Evidence status",
    "metric.candidates": "Candidates",
    "metric.selected": "Selected",
    "metric.bindingRevision": "Binding revision",
    "metric.stateVersion": "State version",
    "metric.stateDigest": "State digest",
    "metric.decision": "Decision",
    "metric.digest": "Digest",
    "metric.parentState": "Parent State",
    "metric.entries": "Entries",
    "metric.prior": "Prior",
    "metric.next": "Next",
    "metric.rollbackTarget": "Rollback target",
    "metric.decisionDigest": "Decision digest",
    "metric.argumentsDigest": "arguments digest {digest}",
    "mode.real": "Local · Host-authorized real smoke",
    "mode.faux": "Local · Deterministic/Faux",
    "form.realPrompt": "Frozen real-smoke prompt",
    "form.fauxPrompt": "Deterministic prompt",
    "action.realTurn": "Run host-authorized turn",
    "action.fauxTurn": "Continue with Faux runtime",
    "value.baseOnly": "base only",
    "value.true": "yes",
    "value.false": "no",
    "value.available": "available",
    "value.unavailable": "unavailable",
    "value.not_recorded": "not recorded",
    "value.passed": "passed",
    "value.failed": "failed",
    "value.settled": "settled",
    "value.not_applicable": "not applicable",
    "value.deterministic_faux": "deterministic/Faux",
    "value.real_product_smoke": "real product smoke",
    "value.base": "Base",
    "value.candidate": "Candidate",
    "value.user": "user",
    "value.assistant": "assistant",
    "value.tool": "tool",
    "value.prompt_addendum": "prompt addendum",
    "value.adaptive_skill": "adaptive Skill",
    "stage.evidence": "Frozen evidence",
    "stage.diagnosis": "Diagnosis",
    "stage.lesson": "Lesson",
    "stage.prompt_or_skill": "Prompt addendum / adaptive Skill",
    "stage.validation": "Symmetric validation",
    "stage.decision": "Promote, reject or rollback",
    "stage.active_state": "Active State",
    "stage.selective_binding": "Selective task binding",
    "decision.kind.initialize": "Initialize",
    "decision.kind.promotion": "Promotion",
    "decision.kind.rejection": "Rejection",
    "decision.kind.rollback": "Rollback",
    "decision.result.initialized": "initialized",
    "decision.result.promoted": "promoted",
    "decision.result.rejected": "rejected",
    "decision.result.rolled_back": "rolled back",
    "decision.reason.initial_state": "initial state",
    "decision.reason.base_failed_candidate_passed": "Base failed; Candidate passed",
    "decision.reason.both_passed_material_improvement": "both passed with material improvement",
    "decision.reason.both_failed": "both failed",
    "decision.reason.operator_rollback": "operator rollback",
    "narrative.goal25NoSkillAdvantage": "Both arms passed; no task-success advantage was observed for the Skill; Candidate used more tokens.",
    "narrative.v2NegativeIncomplete": "Both recovery Candidates passed and the frozen Selector selected A. The real initial-pass Negative lacked a Verifier result, so V2 is not a full PASS.",
    "narrative.selectiveBinding": "Evidence supports a candidate; validation and a recorded decision determine accepted State; a later Run binds only accepted entries whose task and failure-lineage predicates match. The browser is a projection, not an authority."
  }),
  "zh-CN": Object.freeze({
    "page.title": "自适应 Harness 工作台",
    "product.title": "自适应 Harness 工作台",
    "product.version": "V3.6 · 开放任务控制平面",
    "product.loading": "本地 · 正在加载模式",
    "language.selector": "界面语言",
    "sidebar.sessions": "会话（Sessions）",
    "form.newSessionId": "新会话 ID",
    "form.title": "标题",
    "form.runId": "运行 ID",
    "form.prompt": "提示词（Prompt）",
    "action.create": "创建",
    "action.continue": "继续",
    "nav.label": "工作台视图",
    "nav.session": "会话",
    "nav.comparisons": "对比",
    "nav.adaptation": "适应过程",
    "nav.stateHistory": "状态历史",
    "eyebrow.sessionRun": "会话（Session）≠ 运行（Run）",
    "eyebrow.frozenEvidence": "冻结证据",
    "eyebrow.inspectableLineage": "可检查的演化链路",
    "eyebrow.readOnlyAuthority": "只读权威投影",
    "heading.conversation": "对话与工具轨迹",
    "heading.comparisons": "基线 / 候选方案对比",
    "heading.adaptation": "证据如何形成选择性绑定",
    "heading.state": "状态、决策、版本与回滚",
    "notice.stateReadOnly": "浏览器端回滚操作尚未开放；此视图不会写入 Harness State。",
    "empty.chooseSession": "请选择或创建一个会话。",
    "sessions.none": "还没有会话。",
    "sessions.runCount": "{count} 次运行",
    "common.notRecorded": "未记录",
    "common.unavailable": "不可用",
    "common.sourceUnavailable": "来源不可用",
    "common.noCallId": "无调用 ID",
    "common.tool": "工具",
    "error.requestFailed": "请求失败",
    "error.requestRejected": "请求被拒绝",
    "card.safeConversation": "安全对话 / 工具投影",
    "card.runs": "运行记录",
    "card.goal25": "目标 2.5 · 基线与候选方案",
    "card.v2Recovery": "V2 恢复路径对比",
    "card.selectiveBinding": "选择性绑定",
    "card.promptDiff": "提示词差异",
    "card.skillDiff": "Skill 差异",
    "card.currentActive": "当前激活身份",
    "card.versionHistory": "版本历史",
    "card.decisionHistory": "决策 / 回滚历史",
    "card.stateVersion": "状态 v{version}",
    "metric.session": "会话",
    "metric.project": "项目",
    "metric.workspaceId": "工作区 ID",
    "metric.parent": "父会话",
    "metric.source": "来源",
    "metric.mode": "模式",
    "metric.priorRun": "前一次运行",
    "metric.settled": "已稳定结束",
    "metric.providerRequests": "Provider 请求",
    "metric.tokens": "Token",
    "metric.tokenCounts": "输入 {input} / 输出 {output}",
    "metric.costUsd": "成本（USD）",
    "metric.toolCalls": "工具调用",
    "metric.contextReconstructed": "上下文已重建",
    "metric.verifier": "外部验证器（Verifier）",
    "metric.outcome": "结果（Outcome）",
    "metric.binding": "状态绑定",
    "metric.sourceRef": "来源引用",
    "metric.comparisonDigest": "对比摘要",
    "metric.payloadFairness": "输入公平性",
    "metric.trajectory": "运行轨迹",
    "metric.dispatches": "模型派发",
    "metric.manifest": "运行清单（Manifest）",
    "metric.evidenceStatus": "证据状态",
    "metric.candidates": "候选路径",
    "metric.selected": "选中路径",
    "metric.bindingRevision": "绑定修订号",
    "metric.stateVersion": "状态版本",
    "metric.stateDigest": "状态摘要",
    "metric.decision": "决策",
    "metric.digest": "摘要",
    "metric.parentState": "父 State",
    "metric.entries": "状态条目",
    "metric.prior": "之前状态",
    "metric.next": "下一状态",
    "metric.rollbackTarget": "回滚目标",
    "metric.decisionDigest": "决策摘要",
    "metric.argumentsDigest": "参数摘要 {digest}",
    "mode.real": "本地 · 主机授权的真实 Smoke",
    "mode.faux": "本地 · 确定性 / Faux",
    "form.realPrompt": "冻结的真实 Smoke 提示词",
    "form.fauxPrompt": "确定性提示词",
    "action.realTurn": "执行主机授权回合",
    "action.fauxTurn": "使用 Faux Runtime 继续",
    "value.baseOnly": "仅基础状态",
    "value.true": "是",
    "value.false": "否",
    "value.available": "可用",
    "value.unavailable": "不可用",
    "value.not_recorded": "未记录",
    "value.passed": "通过",
    "value.failed": "失败",
    "value.settled": "已稳定结束",
    "value.not_applicable": "不适用",
    "value.deterministic_faux": "确定性 / Faux",
    "value.real_product_smoke": "真实产品 Smoke",
    "value.base": "基线",
    "value.candidate": "候选方案",
    "value.user": "用户",
    "value.assistant": "助手",
    "value.tool": "工具",
    "value.prompt_addendum": "提示词附加项",
    "value.adaptive_skill": "自适应 Skill",
    "stage.evidence": "冻结证据",
    "stage.diagnosis": "诊断（Diagnosis）",
    "stage.lesson": "经验结论（Lesson）",
    "stage.prompt_or_skill": "提示词附加项 / 自适应 Skill",
    "stage.validation": "对称验证",
    "stage.decision": "提升、拒绝或回滚",
    "stage.active_state": "当前激活 State",
    "stage.selective_binding": "选择性任务绑定",
    "decision.kind.initialize": "初始化",
    "decision.kind.promotion": "提升",
    "decision.kind.rejection": "拒绝",
    "decision.kind.rollback": "回滚",
    "decision.result.initialized": "已初始化",
    "decision.result.promoted": "已提升",
    "decision.result.rejected": "已拒绝",
    "decision.result.rolled_back": "已回滚",
    "decision.reason.initial_state": "初始状态",
    "decision.reason.base_failed_candidate_passed": "基线失败、候选方案通过",
    "decision.reason.both_passed_material_improvement": "两者均通过，且候选方案有实质改进",
    "decision.reason.both_failed": "两者均失败",
    "decision.reason.operator_rollback": "操作员执行回滚",
    "narrative.goal25NoSkillAdvantage": "基线与候选方案均通过；该 Skill 未表现出任务成功率优势，且候选方案使用了更多 Token。",
    "narrative.v2NegativeIncomplete": "两条恢复候选路径均通过，冻结的选择器选中了 A；但真实初始通过的负例没有产生 Verifier 结果，因此 V2 不能视为完整通过。",
    "narrative.selectiveBinding": "证据先支持形成候选项；验证和已记录的决策决定可接受的 State；后续运行只会绑定任务条件与失败链路条件均匹配的已接受条目。浏览器仅展示投影，不是权威状态源。"
  })
});

export function normalizeLocale(value) {
  return typeof value === "string" && /^zh(?:-|$)/i.test(value) ? "zh-CN" : "en";
}

export function resolveInitialLocale(storedLocale, browserLanguage) {
  return SUPPORTED_LOCALES.includes(storedLocale) ? storedLocale : normalizeLocale(browserLanguage);
}

export function translate(locale, key, variables = {}) {
  const template = messages[locale]?.[key] ?? messages.en[key] ?? key;
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (match, name) => Object.hasOwn(variables, name) ? String(variables[name]) : match);
}

export function stableLabel(locale, namespace, value, fallback = value) {
  if (typeof value !== "string") return fallback;
  const key = `${namespace}.${value}`;
  const translated = translate(locale, key);
  return translated === key ? fallback : translated;
}

export function goal25Narrative(locale, value) {
  const fallback = value?.result_statement;
  if (locale !== "zh-CN") return fallback;
  const baseTokens = Number(value?.base?.input_tokens) + Number(value?.base?.output_tokens);
  const candidateTokens = Number(value?.candidate?.input_tokens) + Number(value?.candidate?.output_tokens);
  if (value?.kind === "goal25_skill_comparison" && value?.base?.task_outcome === "passed" && value?.candidate?.task_outcome === "passed" && Number.isFinite(baseTokens) && Number.isFinite(candidateTokens) && candidateTokens > baseTokens) return translate(locale, "narrative.goal25NoSkillAdvantage");
  return fallback;
}

export function v2Narrative(locale, value) {
  const fallback = value?.note;
  if (locale === "zh-CN" && value?.kind === "v2_recovery" && value?.outcome === "mechanism_demonstrated_real_negative_incomplete" && Array.isArray(value?.candidate_ids) && value.candidate_ids.length === 2 && typeof value?.selected_candidate_id === "string") return translate(locale, "narrative.v2NegativeIncomplete");
  return fallback;
}

export function selectiveBindingNarrative(locale, value) {
  const fallback = value?.selective_binding_explanation;
  if (locale !== "zh-CN" || value?.kind !== "v3_adaptation_lineage" || !Array.isArray(value?.stages)) return fallback;
  const required = new Set(["validation", "decision", "active_state", "selective_binding"]);
  for (const stage of value.stages) if (stage?.status === "available") required.delete(stage.stage);
  return required.size === 0 ? translate(locale, "narrative.selectiveBinding") : fallback;
}

export function createI18n({ storage, browserLanguage } = {}) {
  let stored = null;
  try { stored = storage?.getItem(STORAGE_KEY) ?? null; } catch { stored = null; }
  let locale = resolveInitialLocale(stored, browserLanguage);
  return Object.freeze({
    get locale() { return locale; },
    t(key, variables) { return translate(locale, key, variables); },
    setLocale(next) {
      if (!SUPPORTED_LOCALES.includes(next)) return false;
      locale = next;
      try { storage?.setItem(STORAGE_KEY, locale); } catch { /* Language switching remains usable without storage. */ }
      return true;
    }
  });
}
