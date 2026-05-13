#!/usr/bin/env bun
/**
 * Run all docs generators in order.
 *
 * The generators write into content/docs/reference/. Each one is idempotent:
 * re-running rewrites the output deterministically.
 */

import { spawnSync } from "node:child_process";

const GENERATORS = [
	{ name: "OpenAPI → Hydra", cmd: ["bun", "run", "scripts/gen/openapi-to-mdx.mjs", "../athena/openapi.json", "content/docs/reference/api/hydra", "hydra"] },
	{ name: "Compose services", cmd: ["bun", "run", "scripts/gen/compose-services.mjs"] },
	{ name: "Env-var catalog", cmd: ["bun", "run", "scripts/gen/env-vars.mjs"] },
	{ name: "Identity schemas", cmd: ["bun", "run", "scripts/gen/identity-schemas.mjs"] },
	{ name: "MCP tools", cmd: ["bun", "run", "scripts/gen/mcp-tools.mjs"] },
	{ name: "SDK API", cmd: ["bun", "run", "scripts/gen/sdk-api.mjs"] },
	{ name: "Athena routes", cmd: ["bun", "run", "scripts/gen/athena-routes.mjs"] },
];

let failed = 0;
for (const g of GENERATORS) {
	console.log(`\n=== ${g.name} ===`);
	const r = spawnSync(g.cmd[0], g.cmd.slice(1), { stdio: "inherit" });
	if (r.status !== 0) {
		failed++;
		console.error(`FAIL: ${g.name} exited with status ${r.status}`);
	}
}

if (failed > 0) {
	console.error(`\n${failed} generator(s) failed.`);
	process.exit(1);
}
console.log(`\nAll ${GENERATORS.length} generators succeeded.`);
