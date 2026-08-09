const $ = (selector) => document.querySelector(selector);
const text = (tag, value, className = "") => { const node = document.createElement(tag); node.textContent = value == null ? "not_recorded" : String(value); if (className) node.className = className; return node; };
const api = async (path, options) => { const response = await fetch(path, options); const value = await response.json(); if (!response.ok) throw new Error(value.message || "Request rejected"); return value; };
const short = (value) => typeof value === "string" && value.length > 20 ? `${value.slice(0, 12)}…${value.slice(-8)}` : value;
let activeSession = null;

function failure(error) { const node = $("#error-template").content.firstElementChild.cloneNode(true); node.textContent = error instanceof Error ? error.message : "Request failed"; $("main").prepend(node); setTimeout(() => node.remove(), 6000); }
function metric(label, value) { const row = text("div", "", "metric"); row.append(text("span", label), text("span", value, typeof value === "string" && value.length > 20 ? "digest" : "")); return row; }
function card(title, body, className = "card") { const node = text("article", "", className); node.append(text("h3", title)); if (body) node.append(body); return node; }

async function loadSessions(selectId) {
  const view = await api("/api/v1/sessions"); const list = $("#sessions"); list.replaceChildren();
  if (!view.sessions.length) list.append(text("p", "No Sessions yet.", "muted"));
  for (const session of view.sessions) { const button = text("button", session.title); button.append(text("small", `${session.session_id} · ${session.run_ids.length} Runs`)); button.addEventListener("click", () => showSession(session.session_id)); list.append(button); }
  if (selectId) await showSession(selectId);
}

async function showSession(id) {
  const session = await api(`/api/v1/sessions/${id}`); activeSession = id; $("#continue-session").hidden = false; const root = $("#session-detail"); root.replaceChildren();
  const summary = text("div", "", "card"); summary.append(text("h3", session.title), metric("Session", session.session_id), metric("Project", session.project_id), metric("Workspace ID", session.workspace_id), metric("Parent", session.parent_session_id), metric("Source", session.source_status)); root.append(summary);
  const messages = text("div", "", "messages"); for (const message of session.messages) { const item = text("article", "", `message ${message.role}`); item.append(text("div", message.role, "role"), text("div", message.text ?? `${message.tool_name ?? "tool"} · ${message.tool_call_id ?? "no call ID"}`)); if (message.tool_arguments_sha256) item.append(text("div", `arguments digest ${message.tool_arguments_sha256}`, "digest")); messages.append(item); } root.append(card("Safe conversation / Tool projection", messages));
  const runs = text("div", "", "grid"); for (const run of session.runs) { const item = text("div", "", "run"); item.append(text("h3", run.run_id), metric("Mode", run.mode), metric("Prior Run", run.prior_run_id), metric("Settled", run.settled), metric("Provider requests", run.provider_requests), metric("Tokens", `${run.input_tokens} in / ${run.output_tokens} out`), metric("Cost USD", run.cost_usd), metric("Tool calls", run.tool_call_count), metric("Context reconstructed", run.context_reconstructed), metric("Verifier", `${run.verifier_status} · ${run.verifier_id}`), metric("Outcome", run.outcome), metric("Binding", run.binding_status), metric("Source ref", run.source_ref)); runs.append(item); } root.append(card("Runs", runs));
}

async function loadOverview() {
  const value = await api("/api/v1/overview"); $("#product-mode").textContent = value.mode === "real_product_smoke" ? "Local · Host-authorized real smoke" : "Local · Deterministic/Faux"; $("#turn-label").textContent = value.mode === "real_product_smoke" ? "Frozen real-smoke prompt" : "Deterministic prompt"; $("#turn-submit").textContent = value.mode === "real_product_smoke" ? "Run host-authorized turn" : "Continue with Faux runtime";
}

async function loadComparisons() {
  const [goal25, v2] = await Promise.all([api("/api/v1/comparisons/goal25"), api("/api/v1/comparisons/v2")]);
  const root = $("#goal25"); root.replaceChildren(); const headline = card("Goal 2.5 · Base versus Candidate", text("p", goal25.result_statement)); headline.append(metric("Comparison digest", goal25.comparison_digest), metric("Payload fairness", goal25.payload_fairness_digest)); root.append(headline);
  const arms = text("div", "", "grid"); for (const arm of [goal25.base, goal25.candidate]) { if (!arm) continue; const item = text("article", "", "card"); item.append(text("span", arm.arm, "eyebrow"), text("h3", arm.run_id), metric("Trajectory", arm.trajectory_outcome), metric("Outcome", arm.task_outcome), metric("Verifier", `${arm.verifier_status} · ${arm.verifier_id}`), metric("Dispatches", arm.provider_dispatches), metric("Tokens", `${arm.input_tokens} in / ${arm.output_tokens} out`), metric("Tool calls", arm.tool_calls), metric("Manifest", arm.manifest_digest), metric("Binding", arm.binding_digest), metric("Source", arm.source_ref)); arms.append(item); } root.append(arms);
  const v2Root = $("#v2"); v2Root.replaceChildren(); const v2Card = card("V2 recovery comparison", text("p", v2.note)); v2Card.append(metric("Evidence status", v2.source_status), metric("Outcome", v2.outcome), metric("Candidates", v2.candidate_ids.join(", ") || "unavailable"), metric("Selected", v2.selected_candidate_id)); v2Root.append(v2Card);
}

async function loadAdaptation() {
  const value = await api("/api/v1/adaptation"); const root = $("#lineage"); root.replaceChildren(); const line = text("div", "", "timeline"); for (const stage of value.stages) { const node = text("article", "", "stage"); node.append(text("span", stage.status, "eyebrow"), text("h3", stage.label), text("div", stage.digest ? short(stage.digest) : "not_recorded", "digest"), text("small", stage.source_ref ?? "source unavailable", "muted")); line.append(node); } root.append(line, card("Selective binding", text("p", value.selective_binding_explanation)));
  const diffs = $("#diffs"); diffs.replaceChildren(); const grid = text("div", "", "grid"); const p = card("Prompt diff", text("pre", value.prompt_diff)); const s = card("Skill diff", text("pre", value.skill_diff)); grid.append(p, s); diffs.append(grid);
}

async function loadState() {
  const value = await api("/api/v1/state-history"); const root = $("#state-content"); root.replaceChildren(); const active = card("Current active identity", null); if (value.active === "unavailable") active.append(text("p", "unavailable")); else active.append(metric("Binding revision", value.active.binding_revision), metric("State version", value.active.state_version), metric("State digest", value.active.state_digest), metric("Decision", value.active.decision_id)); root.append(active);
  const versions = text("div", "", "grid"); for (const version of value.versions) { const node = card(`State v${version.state_version}`, null); node.append(metric("Digest", version.state_digest), metric("Parent", version.parent_state_digest), metric("Entries", version.entry_kinds.join(", ") || "base only")); versions.append(node); } root.append(card("Version history", versions));
  const decisions = text("div", ""); for (const decision of value.decisions) { const node = text("article", "", "card"); node.append(text("span", `#${decision.decision_sequence} · ${decision.kind}`, "eyebrow"), text("h3", `${decision.result}: ${decision.reason}`), metric("Prior", decision.prior_state_digest), metric("Next", decision.next_state_digest), metric("Rollback target", decision.rollback_target_digest), metric("Decision digest", decision.decision_digest)); decisions.append(node); } root.append(card("Decision / rollback history", decisions));
}

document.querySelectorAll("nav button").forEach((button) => button.addEventListener("click", async () => { document.querySelectorAll("nav button,.view").forEach((node) => node.classList.remove("active")); button.classList.add("active"); $(`#${button.dataset.view}`).classList.add("active"); try { if (button.dataset.view === "comparison") await loadComparisons(); if (button.dataset.view === "adaptation") await loadAdaptation(); if (button.dataset.view === "state") await loadState(); } catch (error) { failure(error); } }));
$("#create-session").addEventListener("submit", async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); try { const value = await api("/api/v1/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ session_id: data.get("session_id"), title: data.get("title") }) }); await loadSessions(value.session_id); } catch (error) { failure(error); } });
$("#continue-session").addEventListener("submit", async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); try { await api(`/api/v1/sessions/${activeSession}/turns`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ run_id: data.get("run_id"), prompt: data.get("prompt") }) }); await loadSessions(activeSession); } catch (error) { failure(error); } });
Promise.all([loadOverview(), loadSessions()]).catch(failure);
