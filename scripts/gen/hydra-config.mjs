#!/usr/bin/env bun
/**
 * Generate Hydra configuration reference. One page per top-level section.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { parse as parseYaml } from "yaml";

const FILES = [
	{ slug: "ciam-dev", path: "../platform/dev/ciam-hydra/hydra.yml", label: "CIAM dev" },
	{ slug: "ciam-prod", path: "../platform/prod/ciam-hydra/hydra.yml", label: "CIAM prod" },
	{ slug: "iam-dev", path: "../platform/dev/iam-hydra/hydra.yml", label: "IAM dev" },
	{ slug: "iam-prod", path: "../platform/prod/iam-hydra/hydra.yml", label: "IAM prod" },
];

const OUT_DIR = "content/docs/reference/config/hydra";

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
		const truncated = v.length > 60 ? v.slice(0, 57) + "…" : v;
		return `\`${truncated.replace(/\|/g, "\\|").replace(/`/g, "'")}\``;
	}
	return `\`${String(v).replace(/\|/g, "\\|")}\``;
}

const sectionDescriptions = {
	serve: "HTTP server — public and admin listen, CORS, TLS.",
	urls: "Externally-visible URLs — issuer, login, consent, logout.",
	secrets: "System secret (encrypts client secrets), cookie secret.",
	oidc: "OIDC subject strategy, discovery customizations.",
	oauth2: "PKCE enforcement, token TTLs, refresh rotation.",
	dsn: "Database connection string.",
	log: "Logging level and `leak_sensitive_values`.",
	ttl: "Token and session TTLs.",
	strategies: "Opaque vs JWT access tokens.",
};

for (const section of Object.keys(sections).sort()) {
	let body = `---\ntitle: ${JSON.stringify(section)}\ndescription: ${JSON.stringify(`Hydra ${section} configuration`)}\n---\n\n# \`${section}\` section\n\n`;
	if (sectionDescriptions[section]) body += `${sectionDescriptions[section]}\n\n`;
	body += `| Key | CIAM dev | CIAM prod | IAM dev | IAM prod |\n|-----|----------|-----------|---------|----------|\n`;
	for (const key of sections[section]) {
		const shortKey = key.replace(`${section}.`, "") || section;
		body += `| \`${shortKey}\` | ${formatValue(flat["ciam-dev"]?.[key])} | ${formatValue(flat["ciam-prod"]?.[key])} | ${formatValue(flat["iam-dev"]?.[key])} | ${formatValue(flat["iam-prod"]?.[key])} |\n`;
	}
	body += `\nSee [Ory Hydra config reference](https://www.ory.sh/docs/hydra/reference/configuration).\n`;
	body += `\n---\n\n*Generated from hydra.yml files at build time.*\n`;
	writeFileSync(join(OUT_DIR, `${section}.mdx`), body);
}

let overview = `---\ntitle: hydra.yml\ndescription: ${JSON.stringify("Reference for the four Hydra configuration files")}\n---\n\nOlympus runs four Hydra instances. Configuration split across ${Object.keys(sections).length} sections.\n\n`;
for (const f of loaded) overview += `- **${f.label}** — \`${f.path.replace("../", "")}\`\n`;
overview += `\n## Sections\n\n| Section | Keys |\n|---------|------|\n`;
for (const section of Object.keys(sections).sort()) {
	overview += `| [\`${section}\`](./${section}) | ${sections[section].length} |\n`;
}
overview += `\n${keys.length} keys total. Upstream: [Ory Hydra config](https://www.ory.sh/docs/hydra/reference/configuration).\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify({ title: "hydra.yml", pages: ["overview", ...Object.keys(sections).sort()] }, null, 2),
);

console.log(`Generated ${Object.keys(sections).length + 1} Hydra config pages in ${OUT_DIR}`);
