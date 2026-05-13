#!/usr/bin/env bun
/**
 * Generate Athena API route reference by walking the app/api directory.
 *
 * For each route.ts file:
 *   - Derive the URL path from the directory structure
 *   - Detect which HTTP methods are exported (GET, POST, PUT, DELETE, PATCH)
 *   - Extract any leading JSDoc comment
 *
 * Emit one MDX page per route.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, join, relative } from "node:path";

const APP_API = "../athena/src/app/api";
const OUT_DIR = "content/docs/reference/api/athena";

mkdirSync(OUT_DIR, { recursive: true });

function findRoutes(dir, base = "") {
	const out = [];
	for (const e of readdirSync(dir)) {
		const p = join(dir, e);
		const st = statSync(p);
		if (st.isDirectory()) {
			out.push(...findRoutes(p, base + "/" + e));
		} else if (e === "route.ts") {
			out.push({ file: p, urlPath: base || "/" });
		}
	}
	return out;
}

const routes = findRoutes(resolve(APP_API));

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

function analyzeRoute(file) {
	const content = readFileSync(file, "utf-8");

	const methods = [];
	for (const m of METHODS) {
		if (new RegExp(`export\\s+(async\\s+)?function\\s+${m}\\b`).test(content)) methods.push(m);
		else if (new RegExp(`export\\s+const\\s+${m}\\s*=`).test(content)) methods.push(m);
	}

	return { methods };
}

function pathToSlug(p) {
	return (
		p
			.replace(/^\//, "")
			.replace(/\//g, "-")
			.replace(/\[(\.\.\.)?(\w+)\]/g, "$2") || "root"
	);
}

const summaries = [];
for (const r of routes) {
	const { methods } = analyzeRoute(r.file);
	if (methods.length === 0) continue;

	const slug = pathToSlug(r.urlPath);
	const fullPath = r.urlPath.replace(/\[(\.\.\.)?(\w+)\]/g, ":$2");
	const sourcePath = `athena/src/app/api${r.urlPath}/route.ts`;

	let body = `---\ntitle: ${JSON.stringify(fullPath)}\ndescription: ${JSON.stringify(`Athena API route: ${methods.join(", ")} ${fullPath}`)}\n---\n\n`;
	body += `**Source:** [\`${sourcePath}\`](https://github.com/OlympusOSS/athena/blob/main/src/app/api${r.urlPath}/route.ts)\n\n`;
	body += `**URL:** \`${fullPath}\`\n\n`;
	body += `**Methods:** ${methods.map((m) => `\`${m}\``).join(", ")}\n\n`;
	body += `Open the source link above for the inline JSDoc, request/response shape, and authorization details. The Athena reference pages document the cross-cutting auth chain and error envelope:\n\n`;
	body += `- [Athena API Authentication](/docs/reference/api-athena-authentication)\n`;
	body += `- [Athena API Errors](/docs/reference/api-athena-errors)\n`;
	body += `- [Athena API Pagination](/docs/reference/api-athena-pagination)\n\n`;

	body += `---\n\n*Generated from \`${sourcePath}\` at build time.*\n`;
	writeFileSync(join(OUT_DIR, `${slug}.mdx`), body);
	summaries.push({ slug, fullPath, methods });
}

// Overview
let overview = `---\ntitle: Athena API\ndescription: REST API exposed by the Athena admin dashboard\n---\n\nAthena exposes a REST API at \`/api/*\`. Every route is protected by a session cookie (see [Athena API Authentication](/docs/reference/api-athena-authentication)) — only \`/api/health\` and \`/api/auth/**\` are public.\n\n## Route inventory\n\n| Path | Methods |\n|------|---------|\n`;
for (const s of summaries.sort((a, b) => a.fullPath.localeCompare(b.fullPath))) {
	overview += `| [\`${s.fullPath}\`](./${s.slug}) | ${s.methods.map((m) => `\`${m}\``).join(", ")} |\n`;
}
overview += `\n## Total surface\n\n${summaries.length} routes, ${summaries.reduce((sum, s) => sum + s.methods.length, 0)} method handlers.\n\n## Authentication\n\nSee [Athena API Authentication](/docs/reference/api-athena-authentication).\n\n## Errors\n\nSee [Athena API Errors](/docs/reference/api-athena-errors).\n\n## Pagination\n\nSee [Athena API Pagination](/docs/reference/api-athena-pagination).\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify(
		{
			title: "Athena",
			pages: ["overview", ...summaries.map((s) => s.slug).sort()],
		},
		null,
		2,
	),
);

console.log(`Generated ${summaries.length} Athena route pages (${summaries.reduce((s, x) => s + x.methods.length, 0)} method handlers) in ${OUT_DIR}`);
