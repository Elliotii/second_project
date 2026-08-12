import { createI18n, goal25Narrative, selectiveBindingNarrative, stableLabel, v2Narrative } from "/i18n.js";

const $ = (selector) => document.querySelector(selector);
const i18n = createI18n({ storage: window.localStorage, browserLanguage: navigator.language });
const text = (tag, value, className = "") => {
  const node = document.createElement(tag);
  node.textContent = value == null ? i18n.t("common.notRecorded") : String(value);
  if (className) node.className = className;
  return node;
};

class ApiError extends Error {
  constructor(detail = "") { super(detail); this.name = "ApiError"; }
}

const api = async (path, options) => {
  const response = await fetch(path, options);
  const value = await response.json();
  if (!response.ok) throw new ApiError(typeof value.message === "string" ? value.message : "");
  return value;
};
const short = (value) => typeof value === "string" && value.length > 20 ? `${value.slice(0, 12)}…${value.slice(-8)}` : value;
const displayValue = (value) => {
  if (typeof value === "boolean") return i18n.t(`value.${value}`);
  if (typeof value === "string") {
    const key = `value.${value}`;
    const translated = i18n.t(key);
    if (translated !== key) return translated;
  }
  return value;
};
let activeSession = null;
let activeV36Session = null;
let v36Projects = [];

function applyStaticTranslations() {
  document.documentElement.lang = i18n.locale;
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = i18n.t(node.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => { node.setAttribute("aria-label", i18n.t(node.dataset.i18nAriaLabel)); });
  document.querySelectorAll("[data-locale]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.locale === i18n.locale)));
}

function failure(error) {
  const node = $("#error-template").content.firstElementChild.cloneNode(true);
  const prefix = i18n.t(error instanceof ApiError ? "error.requestRejected" : "error.requestFailed");
  const detail = error instanceof Error && error.message ? `: ${error.message}` : "";
  node.textContent = `${prefix}${detail}`;
  $("main").prepend(node);
  setTimeout(() => node.remove(), 6000);
}
function metric(label, value) {
  const row = text("div", "", "metric");
  row.append(text("span", label), text("span", value, typeof value === "string" && value.length > 20 ? "digest" : ""));
  return row;
}
function card(title, body, className = "card") {
  const node = text("article", "", className);
  node.append(text("h3", title));
  if (body) node.append(body);
  return node;
}

async function loadSessions(selectId) {
  const view = await api("/api/v1/sessions");
  const list = $("#sessions");
  list.replaceChildren();
  if (!view.sessions.length) list.append(text("p", i18n.t("sessions.none"), "muted"));
  for (const session of view.sessions) {
    const button = text("button", session.title);
    button.append(text("small", `${session.session_id} · ${i18n.t("sessions.runCount", { count: session.run_ids.length })}`));
    button.addEventListener("click", () => showSession(session.session_id).catch(failure));
    list.append(button);
  }
  if (selectId) await showSession(selectId);
}

async function showSession(id) {
  const session = await api(`/api/v1/sessions/${id}`);
  activeSession = id;
  $("#continue-session").hidden = false;
  const root = $("#session-detail");
  root.replaceChildren();
  const summary = text("div", "", "card");
  summary.append(
    text("h3", session.title),
    metric(i18n.t("metric.session"), session.session_id),
    metric(i18n.t("metric.project"), session.project_id),
    metric(i18n.t("metric.workspaceId"), session.workspace_id),
    metric(i18n.t("metric.parent"), session.parent_session_id),
    metric(i18n.t("metric.source"), displayValue(session.source_status))
  );
  root.append(summary);
  const messages = text("div", "", "messages");
  for (const message of session.messages) {
    const item = text("article", "", `message ${message.role}`);
    item.append(
      text("div", displayValue(message.role), "role"),
      text("div", message.text ?? `${message.tool_name ?? i18n.t("common.tool")} · ${message.tool_call_id ?? i18n.t("common.noCallId")}`)
    );
    if (message.tool_arguments_sha256) item.append(text("div", i18n.t("metric.argumentsDigest", { digest: message.tool_arguments_sha256 }), "digest"));
    messages.append(item);
  }
  root.append(card(i18n.t("card.safeConversation"), messages));
  const runs = text("div", "", "grid");
  for (const run of session.runs) {
    const item = text("div", "", "run");
    item.append(
      text("h3", run.run_id),
      metric(i18n.t("metric.mode"), displayValue(run.mode)),
      metric(i18n.t("metric.priorRun"), run.prior_run_id),
      metric(i18n.t("metric.settled"), displayValue(run.settled)),
      metric(i18n.t("metric.providerRequests"), run.provider_requests),
      metric(i18n.t("metric.tokens"), i18n.t("metric.tokenCounts", { input: run.input_tokens, output: run.output_tokens })),
      metric(i18n.t("metric.costUsd"), run.cost_usd),
      metric(i18n.t("metric.toolCalls"), run.tool_call_count),
      metric(i18n.t("metric.contextReconstructed"), displayValue(run.context_reconstructed)),
      metric(i18n.t("metric.verifier"), `${displayValue(run.verifier_status)} · ${run.verifier_id}`),
      metric(i18n.t("metric.outcome"), displayValue(run.outcome)),
      metric(i18n.t("metric.binding"), displayValue(run.binding_status)),
      metric(i18n.t("metric.sourceRef"), run.source_ref)
    );
    runs.append(item);
  }
  root.append(card(i18n.t("card.runs"), runs));
}

async function loadOverview() {
  const value = await api("/api/v1/overview");
  $("#product-mode").textContent = value.mode === "real_product_smoke" ? i18n.t("mode.real") : i18n.t("mode.faux");
  $("#turn-label").textContent = value.mode === "real_product_smoke" ? i18n.t("form.realPrompt") : i18n.t("form.fauxPrompt");
  $("#turn-submit").textContent = value.mode === "real_product_smoke" ? i18n.t("action.realTurn") : i18n.t("action.fauxTurn");
}

function handoffResultCard(result) {
  const labels = {
    source_updated: "Applied: registered Source updated / 已应用：源目录已更新",
    changes_discarded: "Discarded: registered Source unchanged / 已丢弃：源目录未改变",
    source_conflict: "Conflict or stale Source: nothing applied / 冲突或源目录过期：未应用",
    partial_apply: "Partial Apply Error: review the per-file journal / 部分应用失败：请检查逐文件记录",
    handoff_failed: "Apply failed; Source state is unknown / 应用失败：源目录状态未知",
  };
  const body = text("div");
  body.append(metric("Result / 结果", labels[result.message_code] ?? result.status), metric("Source state / 源状态", result.source_state), metric("Receipt", result.receipt_digest ?? "none"), metric("Retry safe / 可安全重试", result.retry_safe));
  if (result.journal?.length) {
    const journal = text("div", "", "grid");
    for (const entry of result.journal) journal.append(metric(`${entry.operation.toUpperCase()} · ${entry.path}`, `${entry.state}; recovery saved=${entry.recovery_material_saved}`));
    body.append(card("Per-file Apply journal / 逐文件应用记录", journal));
  }
  return card("Change handoff result / 变更交接结果", body);
}

function renderV36Session(session) {
  activeV36Session = session.session_id;
  const terminalRun = session.runs.at(-1);
  const form = $("#v36-task-form");
  form.elements.session_id.value = session.session_id;
  form.elements.project_id.value = session.project_id;
  form.elements.requested_mode.value = session.requested_mode;
  const root = $("#v36-session-detail");
  root.replaceChildren();
  const authority = card("Host-minted pinned Session", null);
  authority.append(
    metric("Session", session.session_id), metric("Project", session.project_id), metric("Managed Workspace", session.workspace_id), metric("Mode", session.requested_mode),
    metric("Session pin", session.pins.session_pin_digest), metric("Code identity", session.pins.code_identity), metric("Harness State", session.pins.harness_state_digest),
    metric("Backend profile", session.pins.execution_backend_profile_digest), metric("Provider policy", session.pins.provider_model_policy_digest)
  );
  root.append(authority);
  const safety = card("Truthful interactive semantics", null);
  safety.append(
    metric("Verification", session.verification.mode), metric("Formal Outcome", session.verification.formal_outcome), metric("Comparison eligible", session.verification.comparison_eligible),
    metric("Adaptation eligible", session.verification.adaptation_eligible), metric("Promotion eligible", session.verification.promotion_eligible),
    metric("Project commands", session.capabilities.project_commands), metric("Source apply", session.capabilities.source_apply)
  );
  root.append(safety);
  const resources = text("div", "", "grid");
  resources.append(card("Configured / declared Pi Skills (read-only) / 已配置或声明的 Pi Skills（只读）", text("pre", JSON.stringify(session.pi_native_skills, null, 2))), card("Configured Harness Adaptations / bindings (read-only) / 已配置的 Harness 适配与绑定（只读）", text("pre", JSON.stringify(session.harness_adaptations, null, 2))));
  root.append(resources);
  const runs = text("div", "", "grid");
  for (const run of session.runs) {
    const item = card(run.run_id, null);
    item.append(metric("Authority", run.authority_digest), metric("Settled", run.settled), metric("Verification", run.verification_mode), metric("Command execution", run.command_execution));
    if (run.terminal) {
      const dimensions = run.terminal.stop_dimensions.map((entry) => `${entry.dimension}: ${entry.observed} / ${entry.allowed} (${entry.capture_phase})`).join("; ");
      const command = run.terminal.last_registered_command;
      const accounting = run.terminal.tool_accounting;
      const rejected = accounting ? [...accounting.unavailable_requests.map((entry) => `unavailable ${entry.tool_name} (${entry.tool_call_id})`), ...accounting.active_tool_pre_hook_rejections.map((entry) => `active-tool pre-hook rejection ${entry.tool_name} (${entry.tool_call_id})`)].join("; ") : "";
      item.append(
        metric("Stop reason / 停止原因", run.terminal.terminal_reason),
        metric("Crossed finite budget / 超出的有界预算", dimensions),
        metric("Request use / 请求用量", `${run.terminal.request_usage.used} / ${run.terminal.request_usage.max} dispatched; attempt ${run.terminal.request_usage.attempts}`),
        metric("Tool use / 工具用量", `${run.terminal.tool_usage.completed} completed / ${run.terminal.tool_usage.attempts} attempted`),
        metric("Tool accounting / 工具核算", accounting ? `${accounting.persisted_calls} persisted / ${accounting.registered_attempts} registered attempts / ${accounting.registered_executions} executions / ${accounting.registered_blocked} blocked; ${rejected || "no pre-hook rejections"}; budget-blocked ${accounting.budget_blocked_registered_tool_call_id ?? "none"}` : "not recorded"),
        metric("Known usage / 已知用量", `${run.terminal.usage.combined_tokens} combined tokens, $${run.terminal.usage.cost_usd}, ${run.terminal.usage.wall_time_ms} ms`),
        metric("Last registered command / 最后登记命令", command ? `${command.command_id}; ${command.observation}; exit ${command.exit_code ?? "not recorded"}` : "No registered command executed / 未执行登记命令"),
        metric("Managed changes / 托管变更", "Unverified: inspect, export, or discard only; Apply All denied / 未验证：仅可检查、导出或丢弃；禁止全部应用")
      );
    }
    runs.append(item);
  }
  root.append(card("Interactive evidence", runs));
  if (session.goal2) {
    const backend = card("Bounded backend / 有界执行后端", null);
    backend.append(metric("Backend / 后端", session.goal2.backend), metric("Continuation / 继续规则", session.goal2.continuation));
    if (session.goal2.changes) {
      const changeSet = session.goal2.changes;
      backend.append(metric("Image / 镜像", changeSet.backend.image_digest), metric("Network / 网络", changeSet.backend.network), metric("Profile digest / 配置摘要", changeSet.backend.profile_digest));
      root.append(backend);
      const changesCard = card("Changes and Diff / 变更与差异", null);
      changesCard.append(metric("ChangeSet", changeSet.change_set_digest), metric("Status / 状态", changeSet.status));
      if (terminalRun?.terminal) changesCard.append(metric("Safety / 安全", "Incomplete unverified finite-budget changes: Apply All is denied; Export and Discard remain available. / 未完成且未验证的有界预算变更：禁止全部应用；仍可导出或丢弃。"));
      if (changeSet.handoff_result) changesCard.append(handoffResultCard(changeSet.handoff_result));
      for (const change of changeSet.changes) changesCard.append(card(`${change.operation.toUpperCase()} · ${change.path}`, text("pre", change.diff)));
      const actions = text("div", "", "handoff-actions");
      for (const action of changeSet.handoff_actions) {
        const labels = { apply_all: "Apply All / 全部应用", discard: "Discard / 丢弃", export: "Export / 导出" };
        const button = text("button", labels[action] ?? action);
        button.type = "button";
        button.disabled = changeSet.status !== "proposed" || (action === "apply_all" && changeSet.changes.length === 0);
        button.addEventListener("click", async () => {
          try {
            const result = await api("/api/v1/v36/handoff", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ session_id: session.session_id, change_set_digest: changeSet.change_set_digest, action }) });
            if (action === "export") {
              const blob = new Blob([`${JSON.stringify(result, null, 2)}\n`], { type: "application/json" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `changeset-${changeSet.change_set_digest}.json`;
              link.click();
              URL.revokeObjectURL(link.href);
            } else {
              const refreshed = await api(`/api/v1/v36/sessions/${session.session_id}`);
              if (result?.result_kind === "v36_safe_handoff_result" && refreshed.goal2?.changes && !refreshed.goal2.changes.handoff_result) {
                refreshed.goal2.changes.handoff_result = result;
                refreshed.goal2.changes.status = result.status;
              }
              renderV36Session(refreshed);
            }
          } catch (error) {
            changesCard.append(handoffResultCard({ message_code: "handoff_failed", status: "failed", source_state: "unknown", receipt_digest: null, retry_safe: false, journal: [] }));
            failure(error);
          }
        });
        actions.append(button);
      }
      changesCard.append(actions);
      if (session.goal2.continuation === "new_session_required_after_apply" || session.goal2.continuation === "new_session_required_after_budget_terminal") {
        const next = text("button", session.goal2.continuation === "new_session_required_after_budget_terminal" ? "Start Clean New Session from Registered Source / 从已登记源目录新建干净会话" : "Start New Session from Updated Source / 从更新后的源目录新建会话");
        next.type = "button";
        next.addEventListener("click", async () => {
          try {
            const created = await api("/api/v1/v36/sessions/from-updated-source", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ previous_session_id: session.session_id }) });
            renderV36Session(created);
            await loadV36Sessions();
          } catch (error) { failure(error); }
        });
        changesCard.append(next);
      }
      root.append(changesCard);
    } else root.append(backend, card("Changes / 变更", text("p", "Inspect-only Session: no ChangeSet is created. / 仅检查会话不创建 ChangeSet。")));
  }
  loadV36Workspace(session.session_id).catch(failure);
}

async function loadV36Workspace(sessionId) {
  const tree = await api(`/api/v1/v36/sessions/${sessionId}/workspace`);
  const files = text("div", "", "card");
  files.append(text("h3", "Managed Workspace tree (read-only)"));
  for (const entry of tree.entries) {
    const row = text("div", "", "metric");
    row.append(text("span", entry.path), text("span", entry.kind === "file" ? `${entry.bytes} bytes` : "directory"));
    if (entry.kind === "file" && /^[A-Za-z0-9._/-]+$/.test(entry.path)) row.addEventListener("click", async () => {
      try {
        const preview = await api(`/api/v1/v36/sessions/${sessionId}/workspace/files/${entry.path}`);
        files.append(card(`Preview: ${preview.path}`, text("pre", preview.text)));
      } catch (error) { failure(error); }
    });
    files.append(row);
  }
  $("#v36-session-detail").append(files);
}

async function loadV36() {
  try {
    const value = await api("/api/v1/v36/projects");
    const form = $("#v36-task-form");
    form.elements.project_id.replaceChildren();
    v36Projects = value.projects;
    const syncModes = () => {
      const selected = v36Projects.find((project) => project.project_id === form.elements.project_id.value);
      for (const option of form.elements.requested_mode.options) option.disabled = !selected?.supported_modes.includes(option.value);
      if (selected && !selected.supported_modes.includes(form.elements.requested_mode.value)) form.elements.requested_mode.value = selected.supported_modes[0];
    };
    for (const project of v36Projects) {
      const option = document.createElement("option");
      option.value = project.project_id;
      option.textContent = `${project.display_name} · ${project.supported_modes.join(" / ")}`;
      form.elements.project_id.append(option);
    }
    form.elements.project_id.addEventListener("change", syncModes);
    syncModes();
    if (v36Projects.some((project) => project.capability_summary.bounded_edit === "docker_bounded_edit_change_handoff")) {
      $("#product-mode").textContent = "Local · real model only on submitted bounded task / 本地 · 仅提交有界任务时调用真实模型";
      document.querySelectorAll("nav button,.view").forEach((node) => node.classList.remove("active"));
      $(".v36-nav").classList.add("active");
      $("#open-control").classList.add("active");
    }
    $("#v36-open-task").hidden = false;
    $(".v36-nav").hidden = false;
    await loadV36Sessions();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }
}

async function loadV36Sessions(selectId) {
  const value = await api("/api/v1/v36/sessions");
  const list = $("#v36-sessions");
  list.replaceChildren();
  if (!value.sessions.length) list.append(text("p", "No V3.6 Sessions yet. / 尚无 V3.6 会话。", "muted"));
  for (const session of value.sessions) {
    const button = text("button", session.title);
    button.append(text("small", `${session.session_id} · ${session.runs.length} Run(s)`));
    button.addEventListener("click", async () => {
      try { renderV36Session(await api(`/api/v1/v36/sessions/${session.session_id}`)); } catch (error) { failure(error); }
    });
    list.append(button);
  }
  if (selectId) renderV36Session(await api(`/api/v1/v36/sessions/${selectId}`));
}

async function loadComparisons() {
  const [goal25, v2] = await Promise.all([api("/api/v1/comparisons/goal25"), api("/api/v1/comparisons/v2")]);
  const root = $("#goal25");
  root.replaceChildren();
  const headline = card(i18n.t("card.goal25"), text("p", goal25Narrative(i18n.locale, goal25)));
  headline.append(metric(i18n.t("metric.comparisonDigest"), goal25.comparison_digest), metric(i18n.t("metric.payloadFairness"), goal25.payload_fairness_digest));
  root.append(headline);
  const arms = text("div", "", "grid");
  for (const arm of [goal25.base, goal25.candidate]) {
    if (!arm) continue;
    const item = text("article", "", "card");
    item.append(
      text("span", displayValue(arm.arm), "eyebrow"),
      text("h3", arm.run_id),
      metric(i18n.t("metric.trajectory"), displayValue(arm.trajectory_outcome)),
      metric(i18n.t("metric.outcome"), displayValue(arm.task_outcome)),
      metric(i18n.t("metric.verifier"), `${displayValue(arm.verifier_status)} · ${arm.verifier_id}`),
      metric(i18n.t("metric.dispatches"), arm.provider_dispatches),
      metric(i18n.t("metric.tokens"), i18n.t("metric.tokenCounts", { input: arm.input_tokens, output: arm.output_tokens })),
      metric(i18n.t("metric.toolCalls"), arm.tool_calls),
      metric(i18n.t("metric.manifest"), arm.manifest_digest),
      metric(i18n.t("metric.binding"), arm.binding_digest),
      metric(i18n.t("metric.source"), arm.source_ref)
    );
    arms.append(item);
  }
  root.append(arms);
  const v2Root = $("#v2");
  v2Root.replaceChildren();
  const v2Card = card(i18n.t("card.v2Recovery"), text("p", v2Narrative(i18n.locale, v2)));
  v2Card.append(
    metric(i18n.t("metric.evidenceStatus"), displayValue(v2.source_status)),
    metric(i18n.t("metric.outcome"), displayValue(v2.outcome)),
    metric(i18n.t("metric.candidates"), v2.candidate_ids.join(", ") || i18n.t("common.unavailable")),
    metric(i18n.t("metric.selected"), v2.selected_candidate_id)
  );
  v2Root.append(v2Card);
}

async function loadAdaptation() {
  const value = await api("/api/v1/adaptation");
  const root = $("#lineage");
  root.replaceChildren();
  const line = text("div", "", "timeline");
  for (const stage of value.stages) {
    const node = text("article", "", "stage");
    node.append(
      text("span", displayValue(stage.status), "eyebrow"),
      text("h3", stableLabel(i18n.locale, "stage", stage.stage, stage.label)),
      text("div", stage.digest ? short(stage.digest) : i18n.t("common.notRecorded"), "digest"),
      text("small", stage.source_ref ?? i18n.t("common.sourceUnavailable"), "muted")
    );
    line.append(node);
  }
  root.append(line, card(i18n.t("card.selectiveBinding"), text("p", selectiveBindingNarrative(i18n.locale, value))));
  const diffs = $("#diffs");
  diffs.replaceChildren();
  const grid = text("div", "", "grid");
  grid.append(card(i18n.t("card.promptDiff"), text("pre", value.prompt_diff)), card(i18n.t("card.skillDiff"), text("pre", value.skill_diff)));
  diffs.append(grid);
}

async function loadState() {
  const value = await api("/api/v1/state-history");
  const root = $("#state-content");
  root.replaceChildren();
  const active = card(i18n.t("card.currentActive"), null);
  if (value.active === "unavailable") active.append(text("p", i18n.t("common.unavailable")));
  else active.append(
    metric(i18n.t("metric.bindingRevision"), value.active.binding_revision),
    metric(i18n.t("metric.stateVersion"), value.active.state_version),
    metric(i18n.t("metric.stateDigest"), value.active.state_digest),
    metric(i18n.t("metric.decision"), value.active.decision_id)
  );
  root.append(active);
  const versions = text("div", "", "grid");
  for (const version of value.versions) {
    const node = card(i18n.t("card.stateVersion", { version: version.state_version }), null);
    const entries = version.entry_kinds.length ? version.entry_kinds.map(displayValue).join(", ") : i18n.t("value.baseOnly");
    node.append(metric(i18n.t("metric.digest"), version.state_digest), metric(i18n.t("metric.parentState"), version.parent_state_digest), metric(i18n.t("metric.entries"), entries));
    versions.append(node);
  }
  root.append(card(i18n.t("card.versionHistory"), versions));
  const decisions = text("div", "");
  for (const decision of value.decisions) {
    const node = text("article", "", "card");
    node.append(
      text("span", `#${decision.decision_sequence} · ${stableLabel(i18n.locale, "decision.kind", decision.kind, decision.kind)}`, "eyebrow"),
      text("h3", `${stableLabel(i18n.locale, "decision.result", decision.result, decision.result)}: ${stableLabel(i18n.locale, "decision.reason", decision.reason, decision.reason)}`),
      metric(i18n.t("metric.prior"), decision.prior_state_digest),
      metric(i18n.t("metric.next"), decision.next_state_digest),
      metric(i18n.t("metric.rollbackTarget"), decision.rollback_target_digest),
      metric(i18n.t("metric.decisionDigest"), decision.decision_digest)
    );
    decisions.append(node);
  }
  root.append(card(i18n.t("card.decisionHistory"), decisions));
}

async function loadActiveView() {
  const activeView = $("nav button.active")?.dataset.view;
  if (activeView === "comparison") await loadComparisons();
  if (activeView === "adaptation") await loadAdaptation();
  if (activeView === "state") await loadState();
}

async function refreshLocale() {
  applyStaticTranslations();
  await loadOverview();
  await loadSessions(activeSession);
  await loadActiveView();
}

document.querySelectorAll("[data-locale]").forEach((button) => button.addEventListener("click", () => {
  if (i18n.setLocale(button.dataset.locale)) refreshLocale().catch(failure);
}));
document.querySelectorAll("nav button").forEach((button) => button.addEventListener("click", async () => {
  document.querySelectorAll("nav button,.view").forEach((node) => node.classList.remove("active"));
  button.classList.add("active");
  $(`#${button.dataset.view}`).classList.add("active");
  try { await loadActiveView(); } catch (error) { failure(error); }
}));
$("#create-session").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  try {
    const value = await api("/api/v1/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ session_id: data.get("session_id"), title: data.get("title") }) });
    await loadSessions(value.session_id);
  } catch (error) { failure(error); }
});
$("#continue-session").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  try {
    await api(`/api/v1/sessions/${activeSession}/turns`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ run_id: data.get("run_id"), prompt: data.get("prompt") }) });
    await loadSessions(activeSession);
  } catch (error) { failure(error); }
});
$("#v36-task-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = $("#v36-task-submit");
  const status = $("#v36-task-status");
  submit.disabled = true;
  status.textContent = "Running Agent task… / Agent 正在运行任务…";
  const data = new FormData(event.currentTarget);
  const title = String(data.get("title") ?? "").trim();
  const sessionId = String(data.get("session_id") ?? "").trim();
  const request = { project_id: data.get("project_id"), requested_mode: data.get("requested_mode"), task_text: data.get("task_text"), ...(title ? { title } : {}), ...(sessionId ? { session_id: sessionId } : {}) };
  try {
    const session = await api("/api/v1/v36/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(request) });
    document.querySelectorAll("nav button,.view").forEach((node) => node.classList.remove("active"));
    $(".v36-nav").classList.add("active");
    $("#open-control").classList.add("active");
    renderV36Session(session);
    await loadV36Sessions();
    status.textContent = session.runs.at(-1)?.terminal ? "Stopped at a known finite budget: incomplete and unverified / 已在已知有界预算处停止：未完成且未验证" : "Settled / 已结束";
  } catch (error) {
    status.textContent = "Failed / 失败";
    failure(error);
  } finally { submit.disabled = false; }
});

applyStaticTranslations();
Promise.all([loadOverview(), loadSessions(), loadV36()]).catch(failure);
