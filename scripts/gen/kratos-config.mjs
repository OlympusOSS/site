#!/usr/bin/env bun
/**
 * Generate Kratos configuration reference. One page per top-level section.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

const FILES = [
	{ slug: "ciam-dev", path: "../platform/dev/ciam-kratos/kratos.yml", label: "CIAM dev" },
	{ slug: "ciam-prod", path: "../platform/prod/ciam-kratos/kratos.yml", label: "CIAM prod" },
	{ slug: "iam-dev", path: "../platform/dev/iam-kratos/kratos.yml", label: "IAM dev" },
	{ slug: "iam-prod", path: "../platform/prod/iam-kratos/kratos.yml", label: "IAM prod" },
];

const OUT_DIR = "content/docs/reference/config/kratos";

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

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

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
		const truncated = v.length > 60 ? `${v.slice(0, 57)}…` : v;
		return `\`${truncated.replace(/\|/g, "\\|").replace(/`/g, "'")}\``;
	}
	return `\`${String(v).replace(/\|/g, "\\|")}\``;
}

const sectionDescriptions = {
	version: "Schema version pinned to the Kratos version's spec.",
	dsn: "Database connection string.",
	serve: "HTTP server config — listen, CORS, cookie domain.",
	selfservice: "Self-service flow config — the user-facing surface.",
	identity: "Identity schema pointer.",
	log: "Logging level and redaction.",
	secrets: "Cryptographic secrets — cookie HMAC, recovery cipher.",
	ciphers: "Symmetric cipher algorithm choice.",
	hashers: "Password hash algorithm and parameters.",
	courier: "Email courier — SMTP, sender, templates.",
};

for (const section of Object.keys(sections).sort()) {
	let body = `---\ntitle: ${JSON.stringify(section)}\ndescription: ${JSON.stringify(`Kratos ${section} configuration`)}\n---\n\n# \`${section}\` section\n\n`;
	if (sectionDescriptions[section]) body += `${sectionDescriptions[section]}\n\n`;
	body += `Every \`${section}.*\` key across the four Kratos instances:\n\n`;
	body += `| Key | CIAM dev | CIAM prod | IAM dev | IAM prod |\n|-----|----------|-----------|---------|----------|\n`;
	for (const key of sections[section]) {
		const shortKey = key.replace(`${section}.`, "") || section;
		body += `| \`${shortKey}\` | ${formatValue(flat["ciam-dev"]?.[key])} | ${formatValue(flat["ciam-prod"]?.[key])} | ${formatValue(flat["iam-dev"]?.[key])} | ${formatValue(flat["iam-prod"]?.[key])} |\n`;
	}
	body += `\nSee [Ory Kratos config reference](https://www.ory.sh/docs/kratos/reference/configuration) for the full schema.\n`;
	body += `\n---\n\n*Generated from kratos.yml files at build time.*\n`;
	writeFileSync(join(OUT_DIR, `${section}.mdx`), body);
}

let overview = `---\ntitle: kratos.yml\ndescription: ${JSON.stringify("Reference for the four Kratos configuration files")}\n---\n\nOlympus runs four Kratos instances. The configuration is split across ${Object.keys(sections).length} top-level sections.\n\n## Files\n\n`;
for (const f of loaded) overview += `- **${f.label}** — \`${f.path.replace("../", "")}\`\n`;
overview += `\n## Sections\n\n| Section | Keys | Description |\n|---------|------|-------------|\n`;
for (const section of Object.keys(sections).sort()) {
	overview += `| [\`${section}\`](./${section}) | ${sections[section].length} | ${(sectionDescriptions[section] || "—").slice(0, 80)} |\n`;
}
overview += `\n${keys.length} keys total. Upstream schema: [Ory Kratos](https://www.ory.sh/docs/kratos/reference/configuration).\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(join(OUT_DIR, "meta.json"), JSON.stringify({ title: "kratos.yml", pages: ["overview", ...Object.keys(sections).sort()] }, null, 2));

console.log(`Generated ${Object.keys(sections).length + 1} Kratos config pages in ${OUT_DIR}`);
