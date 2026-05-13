#!/usr/bin/env bun
/**
 * Generate SDK API reference by parsing sdk/src/*.ts exports.
 *
 * For each source file, extract:
 *   - Module-level JSDoc
 *   - Each exported function/class/const with its JSDoc and signature
 *
 * Emit one MDX page per source file.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, join, basename } from "node:path";

const SDK_SRC = "../sdk/src";
const OUT_DIR = "content/docs/reference/api/sdk";

mkdirSync(OUT_DIR, { recursive: true });

// Collect .ts files (skip .test.ts, .d.ts)
function collect(dir) {
	const out = [];
	for (const e of readdirSync(dir)) {
		if (e.endsWith(".test.ts") || e.endsWith(".d.ts")) continue;
		if (e.endsWith(".ts")) out.push(join(dir, e));
	}
	return out;
}

function extractExports(content) {
	const exports = [];
	// Just signatures — no JSDoc body to avoid MDX parsing issues
	const re = /^export\s+(async\s+)?(function|const|let|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)([^\n]*)/gm;
	let m;
	while ((m = re.exec(content)) !== null) {
		exports.push({ kind: m[2], name: m[3], tail: (m[4] || "").replace(/[\s{=].*$/, "").trim() });
	}
	return exports;
}

function extractModuleDoc() {
	// Skip: we don't include JSDoc verbatim to avoid MDX parsing issues.
	return "";
}

function quoteFrontmatter(s) {
	if (!s) return '""';
	// JSON.stringify gives us a properly-quoted string for YAML
	return JSON.stringify(String(s).replace(/\s+/g, " ").trim().slice(0, 200));
}

const files = collect(resolve(SDK_SRC));
const moduleSummaries = [];

for (const file of files) {
	const name = basename(file, ".ts");
	if (name === "index") continue; // Skip the barrel
	const content = readFileSync(file, "utf-8");
	const exports = extractExports(content);

	let body = `---\ntitle: ${name}\ndescription: ${quoteFrontmatter(`SDK module ${name} — exports and signatures`)}\n---\n\n`;
	body += `**Source:** \`sdk/src/${name}.ts\`\n\n`;
	body += `For implementation details and inline JSDoc, see the source on GitHub: [\`sdk/src/${name}.ts\`](https://github.com/OlympusOSS/sdk/blob/main/src/${name}.ts).\n\n`;

	body += `## Exports\n\n`;
	if (exports.length === 0) {
		body += `*This module exports nothing detectable by the static parser. Check the source.*\n`;
	} else {
		for (const e of exports) {
			body += `### \`${e.name}\` (\`${e.kind}\`)\n\n`;
			body += `\`\`\`ts\n${e.kind} ${e.name}${e.tail ? " " + e.tail : ""}\n\`\`\`\n\n`;
		}
	}

	body += `---\n\n*Generated from \`sdk/src/${name}.ts\` at build time.*\n`;
	writeFileSync(join(OUT_DIR, `${name}.mdx`), body);
	moduleSummaries.push({ name, exports });
}

// Overview
let overview = `---\ntitle: SDK API\ndescription: "@olympusoss/sdk exported API surface"\n---\n\nThe SDK is consumed by Athena, Hera, and Site. It provides:\n- Settings vault (key-value in the \`olympus\` database)\n- AES-256-GCM encryption with HKDF-SHA256 key derivation\n- In-memory TTL cache for hot reads\n- Brute-force tracking, lockout, and security audit\n- Session location tracking\n\nThe API is small. There are no async iterators, no event emitters, no streaming. Most functions are async (read/write Postgres) and return well-typed data.\n\n## Modules\n\n| Module | Exports | Description |\n|--------|---------|-------------|\n`;
for (const m of moduleSummaries.sort((a, b) => a.name.localeCompare(b.name))) {
	overview += `| [${m.name}](./${m.name}) | ${m.exports.length} | ${m.exports.slice(0, 3).map((e) => `\`${e.name}\``).join(", ")}${m.exports.length > 3 ? ", …" : ""} |\n`;
}
overview += `\n## Installation\n\n\`\`\`bash\nbun add @olympusoss/sdk\n\`\`\`\n\n`;
overview += `## Required environment\n\nThe SDK requires:\n- \`DATABASE_URL\` — Postgres connection string\n- \`ENCRYPTION_KEY\` — 32-byte base64-encoded key for AES-256-GCM (see [Security — Encryption at Rest](/docs/security/encryption-at-rest))\n\nSee the [environment variable catalog](/docs/reference/env-vars) for the full list.\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify({ title: "SDK", pages: ["overview", ...moduleSummaries.map((m) => m.name).sort()] }, null, 2),
);

console.log(`Generated ${moduleSummaries.length} SDK module pages in ${OUT_DIR}`);
