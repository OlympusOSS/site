#!/usr/bin/env bun
/**
 * Generate a Hydra configuration reference. Same structure as the Kratos generator
 * but reads the four hydra.yml files.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";

const FILES = [
	{ slug: "ciam-dev", path: "../platform/dev/ciam-hydra/hydra.yml", label: "CIAM dev" },
	{ slug: "ciam-prod", path: "../platform/prod/ciam-hydra/hydra.yml", label: "CIAM prod" },
	{ slug: "iam-dev", path: "../platform/dev/iam-hydra/hydra.yml", label: "IAM dev" },
	{ slug: "iam-prod", path: "../platform/prod/iam-hydra/hydra.yml", label: "IAM prod" },
];

const OUT = "content/docs/reference/config/hydra-yml.mdx";

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

const allKeys = new Set();
const flat = {};
for (const cfg of loaded) {
	flat[cfg.slug] = flatten(cfg.data);
	for (const k of Object.keys(flat[cfg.slug])) allKeys.add(k);
}
const keys = [...allKeys].sort();

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

let body = `---\ntitle: hydra.yml\ndescription: ${JSON.stringify("Field-by-field reference for every Hydra configuration file across CIAM/IAM and dev/prod")}\n---\n\n`;
body += `Olympus runs **four** Hydra instances. Each has its own \`hydra.yml\` config file:\n\n`;
body += loaded.map((f) => `- **${f.label}** — \`${f.path.replace("../", "")}\``).join("\n");
body += `\n\n> The full Hydra configuration schema is documented in [Ory's reference](https://www.ory.sh/docs/hydra/reference/configuration). This page documents the **Olympus-specific** values.\n\n`;

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

body += `---\n\n*Generated from the four \`hydra.yml\` files at build time.*\n`;

writeFileSync(OUT, body);
console.log(`Generated Hydra config reference at ${OUT} (${keys.length} keys, ${Object.keys(sections).length} sections)`);
