import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { writeText } from "../coding-task/artifacts.ts";
import { buildAnalysisReportView } from "./analysis-report-view.ts";
import { renderAnalysisReportBriefHtml, renderAnalysisReportHtml, renderAnalysisReportMarkdown } from "./analysis-report-render.ts";

export interface GeneratedAnalysisReportPaths {
	markdown: string;
	html: string;
	pdfBrief: string;
}

export const ANALYSIS_REPORT_FILENAMES = {
	markdown: "Skill评测审阅报告.md",
	html: "Skill评测审阅报告.html",
	pdfBrief: "Skill评测审阅简报.pdf",
} as const;

const BROWSER_PATHS = [
	"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
	"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
	"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
	"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

function browserPath(explicitPath?: string): string {
	if (explicitPath) {
		const resolved = resolve(explicitPath);
		if (!existsSync(resolved)) throw new Error(`Report PDF browser does not exist: ${resolved}`);
		return resolved;
	}
	const found = BROWSER_PATHS.find(existsSync);
	if (!found) throw new Error("No existing system Edge or Chrome executable was found for Brief PDF rendering");
	return found;
}

export function renderBriefPdf(options: { html: string; outputPath: string; browserExecutable?: string }): void {
	const outputPath = resolve(options.outputPath);
	if (existsSync(outputPath)) throw new Error(`Report artifact already exists: ${outputPath}`);
	mkdirSync(dirname(outputPath), { recursive: true });
	const temporary = mkdtempSync(resolve(tmpdir(), "analysis-report-brief-"));
	try {
		const htmlPath = resolve(temporary, "brief.html");
		const profilePath = resolve(temporary, "browser-profile");
		writeFileSync(htmlPath, options.html, "utf8");
		const result = spawnSync(browserPath(options.browserExecutable), [
			"--headless",
			"--disable-gpu",
			"--no-pdf-header-footer",
			`--user-data-dir=${profilePath}`,
			`--print-to-pdf=${outputPath}`,
			pathToFileURL(htmlPath).href,
		], { encoding: "utf8", windowsHide: true, timeout: 60_000 });
		if (result.error) throw result.error;
		if (result.status !== 0 || !existsSync(outputPath)) throw new Error(`Brief PDF rendering failed (${String(result.status)}): ${result.stderr || result.stdout}`);
	} finally {
		rmSync(temporary, { recursive: true, force: true });
	}
}

export async function generateAnalysisReports(options: {
	batchPath: string;
	mappingPath: string;
	statePath: string;
	outputDirectory?: string;
	browserExecutable?: string;
}): Promise<GeneratedAnalysisReportPaths> {
	const view = await buildAnalysisReportView(options);
	const outputDirectory = resolve(options.outputDirectory ?? resolve(dirname(options.statePath), "reports"));
	const paths = {
		markdown: resolve(outputDirectory, ANALYSIS_REPORT_FILENAMES.markdown),
		html: resolve(outputDirectory, ANALYSIS_REPORT_FILENAMES.html),
		pdfBrief: resolve(outputDirectory, ANALYSIS_REPORT_FILENAMES.pdfBrief),
	};
	writeText(paths.markdown, renderAnalysisReportMarkdown(view));
	writeText(paths.html, renderAnalysisReportHtml(view));
	renderBriefPdf({ html: renderAnalysisReportBriefHtml(view), outputPath: paths.pdfBrief, ...(options.browserExecutable ? { browserExecutable: options.browserExecutable } : {}) });
	return paths;
}
