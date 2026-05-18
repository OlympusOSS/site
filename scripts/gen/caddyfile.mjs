#!/usr/bin/env bun
/**
 * Caddyfile reference. One page per host block + a global page + overview.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const SRC = "../platform/prod/Caddyfile";
const OUT_DIR = "content/docs/reference/config/caddy";

let raw;
try {
	raw = readFileSync(resolve(SRC), "utf-8");
} catch (e) {
	console.warn(`Caddyfile not found at ${SRC}: ${e.message}`);
	process.exit(0);
}

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const lines = raw.split("\n");
const blocks = [];
let cur = null;
let braceDepth = 0;
const globalBlock = { directives: [] };
let inGlobal = false;

for (const lineRaw of lines) {
	const line = lineRaw.replace(/#.*$/, "").trim();
	if (!line) continue;

	if (braceDepth === 0 && line.startsWith("{") && cur === null) {
		inGlobal = true;
		braceDepth++;
		continue;
	}
	if (braceDepth === 1 && inGlobal && line === "}") {
		inGlobal = false;
		braceDepth--;
		continue;
	}
	if (inGlobal) {
		globalBlock.directives.push(line);
		continue;
	}
	if (line.endsWith("{") && braceDepth === 0) {
		const host = line.slice(0, -1).trim();
		cur = { host, directives: [] };
		braceDepth++;
		continue;
	}
	if (line === "}" && braceDepth === 1) {
		if (cur) blocks.push(cur);
		cur = null;
		braceDepth--;
		continue;
	}
	if (cur && braceDepth >= 1) {
		braceDepth += (line.match(/\{/g) || []).length;
		braceDepth -= (line.match(/\}/g) || []).length;
		cur.directives.push(line);
	}
}

function slugify(s) {
	return s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

const globalBody = `---\ntitle: Global block\ndescription: ${JSON.stringify("Global Caddy configuration applied to all host blocks")}\n---\n\nThe Caddyfile global block applies to every host block. ${globalBlock.directives.length} directives.\n\n\`\`\`text\n${globalBlock.directives.join("\n")}\n\`\`\`\n\nSee [Caddy directives reference](https://caddyserver.com/docs/caddyfile/options).\n`;
writeFileSync(join(OUT_DIR, "global.mdx"), globalBody);

for (const b of blocks) {
	const slug = slugify(b.host);
	const body = `---\ntitle: ${JSON.stringify(b.host)}\ndescription: ${JSON.stringify(`Caddy host block for ${b.host}`)}\n---\n\nHost block for \`${b.host}\` — ${b.directives.length} directives.\n\n\`\`\`text\n${b.directives.join("\n")}\n\`\`\`\n\n## Upstream reference\n\n- [Caddy directives](https://caddyserver.com/docs/caddyfile/directives)\n- [reverse_proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)\n- [rate_limit module](https://github.com/mholt/caddy-ratelimit)\n`;
	writeFileSync(join(OUT_DIR, `${slug}.mdx`), body);
}

let overview = `---\ntitle: Caddyfile\ndescription: ${JSON.stringify("Production Caddy reverse-proxy configuration")}\n---\n\nThe production Caddyfile defines:\n- Global block with ${globalBlock.directives.length} directives.\n- ${blocks.length} host blocks.\n\n## Host blocks\n\n| Host | Directives |\n|------|------------|\n`;
for (const b of blocks) overview += `| [\`${b.host}\`](./${slugify(b.host)}) | ${b.directives.length} |\n`;
overview += `\n## Related\n\n- [Global block](./global)\n- [Security — Caddy supply chain](/docs/security/caddy-supply-chain)\n- [Security — Rate limiting](/docs/security/rate-limiting)\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify({ title: "Caddyfile", pages: ["overview", "global", ...blocks.map((b) => slugify(b.host))] }, null, 2),
);

console.log(`Generated ${blocks.length + 2} Caddy config pages in ${OUT_DIR}`);
