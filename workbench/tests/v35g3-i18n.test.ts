import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
// The production module is intentionally plain ESM so the browser can load it without a build step.
// @ts-ignore -- browser JavaScript is exercised directly by Node's ESM loader.
import { createI18n, goal25Narrative, messages, normalizeLocale, resolveInitialLocale, selectiveBindingNarrative, stableLabel, STORAGE_KEY, translate, v2Narrative } from "../src/webui/static/i18n.js";

test("English and Simplified Chinese dictionaries have identical complete key sets", () => {
	assert.deepEqual(Object.keys(messages["zh-CN"]).sort(), Object.keys(messages.en).sort());
	assert.ok(Object.keys(messages.en).length > 80);
	for (const locale of ["en", "zh-CN"] as const) {
		for (const [key, value] of Object.entries(messages[locale])) {
			assert.equal(typeof value, "string", key);
			assert.ok((value as string).length > 0, key);
		}
	}
});

test("static markup and application literal keys are present while evidence text stays raw", () => {
	const staticRoot = resolve(import.meta.dirname, "../src/webui/static");
	const html = readFileSync(resolve(staticRoot, "index.html"), "utf8");
	const app = readFileSync(resolve(staticRoot, "app.js"), "utf8");
	const i18nSource = readFileSync(resolve(staticRoot, "i18n.js"), "utf8");
	const referenced = [
		...html.matchAll(/data-i18n(?:-aria-label)?="([^"]+)"/g),
		...app.matchAll(/i18n\.t\("([^"]+)"/g),
	].map((match) => match[1]!);
	for (const key of referenced) assert.equal(typeof messages.en[key], "string", key);
	assert.match(app, /message\.text \?\?/);
	assert.match(app, /goal25Narrative\(i18n\.locale, goal25\)/);
	assert.match(app, /value\.prompt_diff/);
	assert.match(app, /value\.skill_diff/);
	assert.match(app, /run\.source_ref/);
	assert.match(i18nSource, /value\?\.result_statement/);
	assert.match(i18nSource, /value\?\.note/);
	assert.match(i18nSource, /value\?\.selective_binding_explanation/);
	assert.match(app, /document\.documentElement\.lang = i18n\.locale/);
	assert.match(app, /\[data-locale\]/);
	assert.doesNotMatch(`${app}\n${i18nSource}`, /https?:\/\//);
});

test("stable enum labels and structured derived narratives translate without string matching", () => {
	assert.equal(stableLabel("zh-CN", "stage", "validation", "raw label"), "对称验证");
	assert.equal(stableLabel("zh-CN", "decision.reason", "operator_rollback", "raw reason"), "操作员执行回滚");
	assert.equal(stableLabel("zh-CN", "decision.reason", "future_reason", "future_reason"), "future_reason");

	const goal25 = {
		kind: "goal25_skill_comparison",
		result_statement: "ORIGINAL GOAL 2.5 NARRATIVE",
		base: { task_outcome: "passed", input_tokens: 10, output_tokens: 2 },
		candidate: { task_outcome: "passed", input_tokens: 14, output_tokens: 3 },
	};
	assert.equal(goal25Narrative("en", goal25), goal25.result_statement);
	assert.match(goal25Narrative("zh-CN", goal25), /均通过.*更多 Token/);
	assert.equal(goal25Narrative("zh-CN", { ...goal25, kind: "future_kind" }), goal25.result_statement);

	const v2 = { kind: "v2_recovery", outcome: "mechanism_demonstrated_real_negative_incomplete", candidate_ids: ["a", "b"], selected_candidate_id: "a", note: "ORIGINAL V2 NARRATIVE" };
	assert.equal(v2Narrative("en", v2), v2.note);
	assert.match(v2Narrative("zh-CN", v2), /Verifier.*不能视为完整通过/);
	assert.equal(v2Narrative("zh-CN", { ...v2, outcome: "future_outcome" }), v2.note);

	const adaptation = {
		kind: "v3_adaptation_lineage",
		selective_binding_explanation: "ORIGINAL SELECTIVE-BINDING NARRATIVE",
		stages: ["validation", "decision", "active_state", "selective_binding"].map((stage) => ({ stage, status: "available" })),
	};
	assert.equal(selectiveBindingNarrative("en", adaptation), adaptation.selective_binding_explanation);
	assert.match(selectiveBindingNarrative("zh-CN", adaptation), /浏览器仅展示投影/);
	assert.equal(selectiveBindingNarrative("zh-CN", { ...adaptation, stages: adaptation.stages.slice(0, 3) }), adaptation.selective_binding_explanation);
});

test("locale resolution, fallback and interpolation are deterministic", () => {
	assert.equal(normalizeLocale("zh-Hans-CN"), "zh-CN");
	assert.equal(normalizeLocale("en-US"), "en");
	assert.equal(resolveInitialLocale("zh-CN", "en-US"), "zh-CN");
	assert.equal(resolveInitialLocale("invalid", "zh-TW"), "zh-CN");
	assert.equal(translate("zh-CN", "sessions.runCount", { count: 3 }), "3 次运行");
	assert.equal(translate("zh-CN", "missing.key"), "missing.key");
	assert.equal(translate("unknown", "action.create"), "Create");
});

test("locale controller persists explicit choice and tolerates unavailable storage", () => {
	const values = new Map<string, string>();
	const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
	const controller = createI18n({ storage, browserLanguage: "zh-CN" });
	assert.equal(controller.locale, "zh-CN");
	assert.equal(controller.setLocale("en"), true);
	assert.equal(values.get(STORAGE_KEY), "en");
	assert.equal(controller.t("action.create"), "Create");
	assert.equal(controller.setLocale("fr"), false);
	assert.equal(controller.locale, "en");

	const unavailable = createI18n({ storage: { getItem() { throw new Error("disabled"); }, setItem() { throw new Error("disabled"); } }, browserLanguage: "zh-Hans" });
	assert.equal(unavailable.locale, "zh-CN");
	assert.equal(unavailable.setLocale("en"), true);
});
