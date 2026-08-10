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

applyStaticTranslations();
Promise.all([loadOverview(), loadSessions()]).catch(failure);
