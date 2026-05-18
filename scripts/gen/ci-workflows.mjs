#!/usr/bin/env bun
/**
 * Generate per-CI-workflow reference pages. Scans .github/workflows/*.yml
 * across all repos.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

const REPOS = ["platform", "athena", "hera", "site", "sdk", "canvas", "octl", "daedalus"];

const OUT_DIR = "content/docs/reference/workflows";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const workflows = [];
for (const repo of REPOS) {
	const dir = resolve(`../${repo}/.github/workflows`);
	try {
		const files = readdirSync(dir).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
		for (const f of files) {
			try {
				const content = readFileSync(join(dir, f), "utf-8");
				const parsed = parseYaml(content);
				workflows.push({ repo, file: f, parsed, content });
			} catch (e) {
				console.warn(`Skipping ${repo}/${f}: ${e.message}`);
			}
		}
	} catch {
		// repo or workflows dir doesn't exist
	}
}

function slugify(s) {
	return s
		.toLowerCase()
		.replace(/\.ya?ml$/, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function summarizeTriggers(on) {
	if (!on) return "(unspecified)";
	if (typeof on === "string") return `on \`${on}\``;
	if (Array.isArray(on)) return on.map((t) => `\`${t}\``).join(", ");
	if (typeof on === "object") {
		return Object.keys(on)
			.map((t) => {
				const cfg = on[t];
				if (t === "schedule" && Array.isArray(cfg) && cfg[0]?.cron) {
					return `\`schedule(${cfg[0].cron})\``;
				}
				if (t === "push" && cfg?.branches) {
					return `\`push\` (branches: ${cfg.branches.join(", ")})`;
				}
				return `\`${t}\``;
			})
			.join(", ");
	}
	return "(unknown)";
}

function summarizeJobs(jobs) {
	if (!jobs || typeof jobs !== "object") return "(no jobs)";
	return Object.keys(jobs)
		.map((name) => {
			const job = jobs[name];
			const stepCount = job?.steps?.length || 0;
			return `- **\`${name}\`** — ${stepCount} steps, runs on \`${job?.["runs-on"] || "(default)"}\``;
		})
		.join("\n");
}

// Per-workflow pages
for (const w of workflows) {
	const slug = `${w.repo}-${slugify(w.file)}`;
	const title = w.parsed.name || w.file;

	let body = `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(`CI workflow in ${w.repo}/.github/workflows/${w.file}`)}\n---\n\n`;
	body += `# ${title}\n\n`;
	body += `**Repo:** \`${w.repo}\`\n\n`;
	body += `**File:** [\`${w.repo}/.github/workflows/${w.file}\`](https://github.com/OlympusOSS/${w.repo}/blob/main/.github/workflows/${w.file})\n\n`;
	body += `**Triggers:** ${summarizeTriggers(w.parsed.on)}\n\n`;
	body += `## Jobs\n\n${summarizeJobs(w.parsed.jobs)}\n\n`;

	if (w.parsed.jobs) {
		for (const [jobName, job] of Object.entries(w.parsed.jobs)) {
			if (job?.steps?.length) {
				body += `### Job: \`${jobName}\`\n\n`;
				body += `Runs on: \`${job["runs-on"] || "(default)"}\`\n\n`;
				body += `Steps:\n\n`;
				for (const step of job.steps) {
					// Prefer step.name, then step.uses, then the first line of step.run.
					// Truncate long lines at a word boundary so we don't chop mid-word.
					let raw = step.name || step.uses || step.run?.split("\n")[0] || "(unnamed)";
					if (raw.length > 100) {
						raw = `${raw.slice(0, 100).replace(/\s+\S*$/, "")}…`;
					}
					// Wrap in inline code so MDX/Turbopack doesn't interpret `${{ ... }}`
					// (GitHub Actions expressions) as JSX. Strip backticks inside the
					// name itself so the wrapper stays intact.
					const safe = raw.replace(/`/g, "'").replace(/\|/g, "\\|");
					body += `- \`${safe}\`\n`;
				}
				body += `\n`;
			}
		}
	}

	body += `\n## Source\n\n\`\`\`yaml\n${w.content.slice(0, 2000).replace(/\$/g, "$").replace(/`/g, "'")}${w.content.length > 2000 ? "\n... (truncated; see source link above)" : ""}\n\`\`\`\n`;
	body += `\n---\n\n*Generated from \`${w.repo}/.github/workflows/${w.file}\` at build time.*\n`;
	writeFileSync(join(OUT_DIR, `${slug}.mdx`), body);
}

// Overview
let overview = `---\ntitle: CI Workflows\ndescription: ${JSON.stringify(`${workflows.length} GitHub Actions workflows across the Olympus repos`)}\n---\n\nOlympus uses GitHub Actions for CI/CD. This page enumerates every workflow.\n\n## By repo\n\n`;
const byRepo = {};
for (const w of workflows) (byRepo[w.repo] ||= []).push(w);
for (const repo of Object.keys(byRepo).sort()) {
	overview += `### ${repo}\n\n`;
	for (const w of byRepo[repo]) {
		const slug = `${w.repo}-${slugify(w.file)}`;
		overview += `- [${w.parsed.name || w.file}](./${slug}) — \`${w.file}\`\n`;
	}
	overview += `\n`;
}
overview += `Total: ${workflows.length} workflows.\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify(
		{
			title: "Workflows",
			pages: ["overview", ...workflows.map((w) => `${w.repo}-${slugify(w.file)}`)],
		},
		null,
		2,
	),
);

console.log(`Generated ${workflows.length + 1} CI workflow pages in ${OUT_DIR}`);
