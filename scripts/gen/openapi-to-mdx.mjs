#!/usr/bin/env bun
/**
 * Generate one MDX page per OpenAPI operation.
 *
 * Usage:
 *   bun run scripts/gen/openapi-to-mdx.mjs <spec.json> <out-dir> <service-name>
 *
 * Example:
 *   bun run scripts/gen/openapi-to-mdx.mjs ../athena/openapi.json content/docs/reference/api/hydra hydra
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";

const [, , specPath, outDir, serviceName] = process.argv;
if (!specPath || !outDir || !serviceName) {
	console.error("Usage: openapi-to-mdx.mjs <spec.json> <out-dir> <service-name>");
	process.exit(1);
}

const spec = JSON.parse(readFileSync(resolve(specPath), "utf-8"));
const SERVICE_TITLE = spec.info?.title || serviceName;
const SERVICE_VERSION = spec.info?.version || "unknown";

const HTTP_METHODS = ["get", "post", "put", "delete", "patch", "head", "options"];

// Resolve a $ref to its target object (recursively if needed)
function resolveRef(ref) {
	if (!ref?.startsWith("#/")) return ref;
	const parts = ref.slice(2).split("/");
	let current = spec;
	for (const p of parts) {
		current = current?.[p];
		if (!current) return null;
	}
	return current;
}

// Render a JSON Schema reference / object as a markdown table row content
function describeSchema(schema, depth = 0) {
	if (!schema) return "—";
	if (schema.$ref) {
		const resolved = resolveRef(schema.$ref);
		const refName = schema.$ref.split("/").pop();
		if (depth > 1 || !resolved) return `\`${refName}\``;
		return describeSchema(resolved, depth + 1);
	}
	if (schema.type === "array") {
		const items = describeSchema(schema.items, depth);
		return `array of ${items}`;
	}
	if (schema.type === "object" || schema.properties) {
		return "object";
	}
	if (schema.enum) {
		return `enum: ${schema.enum.map((v) => `\`${v}\``).join(", ")}`;
	}
	if (schema.type) {
		const fmt = schema.format ? ` (${schema.format})` : "";
		return `${schema.type}${fmt}`;
	}
	return "—";
}

function renderParams(params) {
	if (!params?.length) return "";
	const grouped = { path: [], query: [], header: [], cookie: [] };
	for (const raw of params) {
		const p = raw.$ref ? resolveRef(raw.$ref) : raw;
		if (!p?.in) continue;
		(grouped[p.in] ||= []).push(p);
	}
	let out = "";
	for (const [loc, list] of Object.entries(grouped)) {
		if (!list.length) continue;
		out += `\n#### ${loc.charAt(0).toUpperCase() + loc.slice(1)} parameters\n\n`;
		out += "| Name | Type | Required | Description |\n";
		out += "|------|------|----------|-------------|\n";
		for (const p of list) {
			const name = `\`${p.name}\``;
			const type = describeSchema(p.schema);
			const req = p.required ? "yes" : "no";
			const desc = (p.description || "").replace(/\n/g, " ").replace(/\|/g, "\\|");
			out += `| ${name} | ${type} | ${req} | ${desc} |\n`;
		}
	}
	return out;
}

function renderRequestBody(body) {
	if (!body) return "";
	const resolved = body.$ref ? resolveRef(body.$ref) : body;
	if (!resolved?.content) return "";
	let out = "\n#### Request body\n\n";
	if (resolved.description) out += `${resolved.description}\n\n`;
	for (const [mime, def] of Object.entries(resolved.content)) {
		out += `**Content-Type:** \`${mime}\`\n\n`;
		if (def.schema) {
			const summary = describeSchema(def.schema);
			out += `Type: ${summary}\n\n`;
			if (def.schema.$ref) {
				const refName = def.schema.$ref.split("/").pop();
				out += `Schema: \`${refName}\` — see the [${SERVICE_TITLE} schemas](https://www.ory.sh/docs/reference/api) reference for the full type.\n\n`;
			}
		}
	}
	return out;
}

function renderResponses(responses) {
	if (!responses) return "";
	let out = "\n#### Responses\n\n";
	out += "| Status | Description | Body |\n";
	out += "|--------|-------------|------|\n";
	for (const [code, raw] of Object.entries(responses)) {
		const r = raw.$ref ? resolveRef(raw.$ref) : raw;
		const desc = (r.description || "").replace(/\n/g, " ").replace(/\|/g, "\\|");
		let body = "—";
		if (r.content) {
			const mime = Object.keys(r.content)[0];
			if (mime) {
				const schema = r.content[mime].schema;
				const summary = describeSchema(schema);
				body = `\`${mime}\` — ${summary}`;
			}
		}
		out += `| ${code} | ${desc} | ${body} |\n`;
	}
	return out;
}

function slugify(s) {
	return s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function escapeFrontmatter(s) {
	// Returns a YAML/JSON-safe double-quoted string (without outer quotes — caller adds them).
	if (!s) return "";
	return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ").trim().slice(0, 200);
}

// Collect operations
const operations = [];
for (const [path, pathItem] of Object.entries(spec.paths || {})) {
	for (const method of HTTP_METHODS) {
		const op = pathItem[method];
		if (!op) continue;
		const tags = op.tags && op.tags.length ? op.tags : ["other"];
		operations.push({ method, path, op, tag: tags[0] });
	}
}

// Group by tag
const byTag = {};
for (const o of operations) {
	(byTag[o.tag] ||= []).push(o);
}

// Clear output dir
if (existsSync(outDir)) {
	rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

// Write per-tag overview + per-operation pages
const tagSlugs = Object.keys(byTag).map(slugify).sort();
for (const tag of Object.keys(byTag).sort()) {
	const tagSlug = slugify(tag);
	const tagDir = join(outDir, tagSlug);
	mkdirSync(tagDir, { recursive: true });

	// Tag overview
	let overview = `---\ntitle: ${tag}\ndescription: ${escapeFrontmatter(`${tag} endpoints in the ${SERVICE_TITLE} (v${SERVICE_VERSION})`)}\n---\n\n`;
	overview += `Endpoints in the **${tag}** group of the ${SERVICE_TITLE}.\n\n`;
	overview += `| Method | Path | Summary |\n|--------|------|---------|\n`;
	for (const { method, path, op } of byTag[tag]) {
		const opId = op.operationId || `${method}-${slugify(path)}`;
		const summary = (op.summary || op.description || "").split("\n")[0].slice(0, 100);
		overview += `| \`${method.toUpperCase()}\` | [\`${path}\`](./${slugify(opId)}) | ${summary.replace(/\|/g, "\\|")} |\n`;
	}
	writeFileSync(join(tagDir, "overview.mdx"), overview);

	// Operations
	for (const { method, path, op } of byTag[tag]) {
		const opId = op.operationId || `${method}-${slugify(path)}`;
		const slug = slugify(opId);
		const title = op.summary || opId;
		const description = (op.description || op.summary || "").split("\n")[0];

		let body = `---\ntitle: "${escapeFrontmatter(title)}"\ndescription: "${escapeFrontmatter(description)}"\n---\n\n`;
		body += `## \`${method.toUpperCase()} ${path}\`\n\n`;
		if (op.description) body += `${op.description}\n\n`;
		body += `**Operation ID:** \`${opId}\` &nbsp;&nbsp; **Tag:** ${tag}\n\n`;
		body += renderParams(op.parameters);
		body += renderRequestBody(op.requestBody);
		body += renderResponses(op.responses);

		if (op.security) {
			body += `\n#### Security\n\n`;
			for (const sec of op.security) {
				const scheme = Object.keys(sec)[0];
				const scopes = sec[scheme];
				body += `- \`${scheme}\``;
				if (scopes?.length) body += ` (scopes: ${scopes.map((s) => `\`${s}\``).join(", ")})`;
				body += "\n";
			}
		}

		body += `\n---\n\n*Generated from \`${specPath}\` at build time.*\n`;
		writeFileSync(join(tagDir, `${slug}.mdx`), body);
	}

	// meta.json for the tag
	const opSlugs = byTag[tag].map(({ op, method, path }) => {
		const opId = op.operationId || `${method}-${slugify(path)}`;
		return slugify(opId);
	});
	writeFileSync(
		join(tagDir, "meta.json"),
		JSON.stringify({ title: tag, pages: ["overview", ...opSlugs] }, null, 2),
	);
}

// Top-level overview + meta.json
const topOverview = `---
title: ${SERVICE_TITLE} API
description: Reference for the ${SERVICE_TITLE} (v${SERVICE_VERSION}). Generated from OpenAPI.
---

This reference is generated from the ${SERVICE_TITLE} OpenAPI specification at build time. The spec is pinned to **v${SERVICE_VERSION}**.

## Tags

${Object.keys(byTag).sort().map((tag) => {
	const tagSlug = slugify(tag);
	const count = byTag[tag].length;
	return `- [${tag}](./${tagSlug}/overview) — ${count} endpoint${count === 1 ? "" : "s"}`;
}).join("\n")}

## Total surface

| Tag | Endpoint count |
|-----|----------------|
${Object.keys(byTag).sort().map((tag) => `| ${tag} | ${byTag[tag].length} |`).join("\n")}
| **Total** | **${operations.length}** |
`;
writeFileSync(join(outDir, "overview.mdx"), topOverview);
writeFileSync(
	join(outDir, "meta.json"),
	JSON.stringify(
		{
			title: SERVICE_TITLE,
			// Bare subdir names render each tag as a collapsible folder in the
			// fumadocs sidebar. The "..." (spread) syntax instead flattens a
			// subdir's pages into the parent, defeating the tree view.
			pages: ["overview", ...tagSlugs],
		},
		null,
		2,
	),
);

console.log(`Generated ${operations.length} operation pages across ${Object.keys(byTag).length} tags in ${outDir}`);
