#!/usr/bin/env bun
/**
 * Generate MCP tool reference pages by parsing daedalus/src-tauri/src/mcp/tools.rs.
 *
 * The Rust source defines ToolDefinition literals; we extract:
 *   name, description, input_schema (as raw JSON).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";

const SRC = "../daedalus/src-tauri/src/mcp/tools.rs";
const OUT_DIR = "content/docs/reference/api/mcp";

const source = (() => {
	try {
		return readFileSync(resolve(SRC), "utf-8");
	} catch {
		return null;
	}
})();

if (!source) {
	console.warn(`MCP source not found at ${SRC}, skipping MCP generator`);
	process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });

// Parse ToolDefinition blocks — the format uses .into() and json!({ ... })
const tools = [];
const re =
	/ToolDefinition\s*\{\s*name:\s*"([^"]+)"\s*\.\s*into\(\)\s*,\s*description:\s*"((?:[^"\\]|\\.)*)"\s*\.\s*into\(\)\s*,\s*input_schema:\s*json!\(\s*(\{[\s\S]*?\})\s*\)\s*,?\s*\}/g;
let m;
while ((m = re.exec(source)) !== null) {
	tools.push({
		name: m[1],
		description: m[2].replace(/\\"/g, '"').replace(/\\n/g, "\n"),
		schema: m[3],
	});
}

// Fallback: simpler regex if the strict one missed any
if (tools.length === 0) {
	const simpler = /name:\s*"([^"]+)"\s*\.\s*into\(\)\s*,\s*description:\s*\n?\s*"((?:[^"\\]|\\.)*)"/g;
	let m2;
	while ((m2 = simpler.exec(source)) !== null) {
		tools.push({
			name: m2[1],
			description: m2[2].replace(/\\"/g, '"').replace(/\\n/g, "\n"),
			schema: null,
		});
	}
}

for (const t of tools) {
	let body = `---\ntitle: ${t.name}\ndescription: ${JSON.stringify(t.description.split("\n")[0].slice(0, 200))}\n---\n\n`;
	body += `## MCP tool: \`${t.name}\`\n\n`;
	body += `${t.description}\n\n`;
	if (t.schema) {
		body += `### Input schema\n\n\`\`\`json\n${t.schema}\n\`\`\`\n\n`;
	}
	body += `### Calling this tool\n\n`;
	body += `\`\`\`json\n`;
	body += `{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "method": "tools/call",\n  "params": {\n    "name": "${t.name}",\n    "arguments": { /* match input schema */ }\n  }\n}\n`;
	body += `\`\`\`\n\n`;
	body += `Send to \`http://127.0.0.1:14210\` while Daedalus is running.\n`;
	body += `\n---\n\n*Generated from \`${SRC.replace("../", "")}\` at build time.*\n`;
	writeFileSync(join(OUT_DIR, `${t.name}.mdx`), body);
}

let overview = `---\ntitle: Daedalus MCP\ndescription: JSON-RPC 2.0 tools exposed by the Daedalus deployment wizard\n---\n\nDaedalus embeds an MCP server on \`127.0.0.1:14210\` (HTTP / JSON-RPC 2.0). When Daedalus is running, Claude (or any MCP client) can call these tools to drive the deployment wizard programmatically.\n\nThe server is **localhost-only** — see [ADR 0022 — MCP Localhost Only](/docs/adrs/0022-mcp-localhost-only).\n\n## Tools\n\n| Name | Description |\n|------|-------------|\n`;
for (const t of tools) {
	overview += `| [${t.name}](./${t.name}) | ${t.description.split("\n")[0].slice(0, 100).replace(/\|/g, "\\|")} |\n`;
}
overview += `\n## Total\n\n${tools.length} tools.\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify({ title: "MCP", pages: ["overview", ...tools.map((t) => t.name)] }, null, 2),
);

console.log(`Generated ${tools.length} MCP tool pages in ${OUT_DIR}`);
