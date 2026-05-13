#!/usr/bin/env bun
/**
 * Generate a Kratos configuration reference by walking the 4 kratos.yml files
 * (dev/prod × CIAM/IAM) and producing a single MDX page that surfaces every
 * setting with its values per environment/domain.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";

const FILES = [
	{ slug: "ciam-dev", path: "../platform/dev/ciam-kratos/kratos.yml", label: "CIAM dev" },
	{ slug: "ciam-prod", path: "../platform/prod/ciam-kratos/kratos.yml", label: "CIAM prod" },
	{ slug: "iam-dev", path: "../platform/dev/iam-kratos/kratos.yml", label: "IAM dev" },
	{ slug: "iam-prod", path: "../platform/prod/iam-kratos/kratos.yml", label: "IAM prod" },
];

const OUT = "content/docs/reference/config/kratos-yml.mdx";

function flatten(obj, prefix = "") {
	const out = {};
	if (obj == null) return out;
	if (typeof obj !== "object" || Array.isArray(obj)) {
		out[prefix || "(root)"] = obj;
		return out;
	}
	for (const [k, v] of Object.entries(obj)) {
		const key = prefix ? `${prefix}.${k}` : k;
		if (v == null || typeof v !== "object" || Array.isArray(v)) {
			out[key] = v;
		} else {
			Object.assign(out, flatten(v, key));
		}
	}
	return out;
}

const loaded = [];
for (const f of FILES) {
	try {
		const raw = readFileSync(resolve(f.path), "utf-8");
		loaded.push({ ...f, data: parseYaml(raw) });
	} catch (e) {
		console.warn(`Skipping ${f.path}: ${e.message}`);
	}
}

// Collect all unique keys
const allKeys = new Set();
const flat = {};
for (const cfg of loaded) {
	flat[cfg.slug] = flatten(cfg.data);
	for (const k of Object.keys(flat[cfg.slug])) allKeys.add(k);
}
const keys = [...allKeys].sort();

// Group by top-level section
const sections = {};
for (const k of keys) {
	const top = k.split(".")[0];
	(sections[top] ||= []).push(k);
}

function formatValue(v) {
	if (v == null) return "—";
	if (Array.isArray(v)) return `array[${v.length}]`;
	if (typeof v === "object") return "object";
	if (typeof v === "string") {
		const truncated = v.length > 60 ? v.slice(0, 57) + "…" : v;
		return `\`${truncated.replace(/\|/g, "\\|").replace(/`/g, "'")}\``;
	}
	return `\`${String(v).replace(/\|/g, "\\|")}\``;
}

let body = `---\ntitle: kratos.yml\ndescription: ${JSON.stringify("Field-by-field reference for every Kratos configuration file across CIAM/IAM and dev/prod")}\n---\n\n`;
body += `Olympus runs **four** Kratos instances — one per CIAM/IAM × dev/prod combination. Each has its own \`kratos.yml\` config file in the platform repo:\n\n`;
body += loaded.map((f) => `- **${f.label}** — \`${f.path.replace("../", "")}\``).join("\n");
body += `\n\nThis page lists every leaf configuration key found in those files, grouped by top-level section. Each row shows the value present in each of the four instances. Empty cells mean the key is not set in that file.\n\n`;
body += `> The full Kratos configuration schema is documented in [Ory's reference](https://www.ory.sh/docs/kratos/reference/configuration). This page documents the **Olympus-specific** values.\n\n`;

for (const section of Object.keys(sections).sort()) {
	body += `## \`${section}\`\n\n`;
	body += `| Key | CIAM dev | CIAM prod | IAM dev | IAM prod |\n`;
	body += `|-----|----------|-----------|---------|----------|\n`;
	for (const key of sections[section]) {
		const shortKey = key.replace(`${section}.`, "");
		body += `| \`${shortKey}\` | ${formatValue(flat["ciam-dev"]?.[key])} | ${formatValue(flat["ciam-prod"]?.[key])} | ${formatValue(flat["iam-dev"]?.[key])} | ${formatValue(flat["iam-prod"]?.[key])} |\n`;
	}
	body += "\n";
}

body += `---\n\n*Generated from the four \`kratos.yml\` files at build time.*\n`;

writeFileSync(OUT, body);
console.log(`Generated Kratos config reference at ${OUT} (${keys.length} keys, ${Object.keys(sections).length} sections)`);
