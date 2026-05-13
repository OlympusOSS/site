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
	{ name: "OpenAPI → Kratos", cmd: ["bun", "run", "scripts/gen/openapi-to-mdx.mjs", "scripts/gen/specs/kratos-api.json", "content/docs/reference/api/kratos", "kratos"] },
	{ name: "Compose services", cmd: ["bun", "run", "scripts/gen/compose-services.mjs"] },
	{ name: "Env-var catalog", cmd: ["bun", "run", "scripts/gen/env-vars.mjs"] },
	{ name: "Identity schemas", cmd: ["bun", "run", "scripts/gen/identity-schemas.mjs"] },
	{ name: "MCP tools", cmd: ["bun", "run", "scripts/gen/mcp-tools.mjs"] },
	{ name: "SDK API", cmd: ["bun", "run", "scripts/gen/sdk-api.mjs"] },
	{ name: "Athena routes", cmd: ["bun", "run", "scripts/gen/athena-routes.mjs"] },
	{ name: "Kratos config", cmd: ["bun", "run", "scripts/gen/kratos-config.mjs"] },
	{ name: "Hydra config", cmd: ["bun", "run", "scripts/gen/hydra-config.mjs"] },
	{ name: "Caddyfile", cmd: ["bun", "run", "scripts/gen/caddyfile.mjs"] },
	{ name: "Database schemas", cmd: ["bun", "run", "scripts/gen/database-schemas.mjs"] },
	{ name: "Env vars per-var", cmd: ["bun", "run", "scripts/gen/env-vars-per-var.mjs"] },
	{ name: "CI workflows", cmd: ["bun", "run", "scripts/gen/ci-workflows.mjs"] },
	{ name: "Identity traits", cmd: ["bun", "run", "scripts/gen/identity-traits.mjs"] },
	{ name: "Athena features", cmd: ["bun", "run", "scripts/gen/athena-features.mjs"] },
	{ name: "Per-port detail", cmd: ["bun", "run", "scripts/gen/ports.mjs"] },
	{ name: "Error catalog", cmd: ["bun", "run", "scripts/gen/error-catalog.mjs"] },
	{ name: "Hera pages", cmd: ["bun", "run", "scripts/gen/hera-pages.mjs"] },
	{ name: "OAuth2 grants", cmd: ["bun", "run", "scripts/gen/oauth2-grants.mjs"] },
	{ name: "MFA methods", cmd: ["bun", "run", "scripts/gen/mfa-methods.mjs"] },
	{ name: "Caddy directives", cmd: ["bun", "run", "scripts/gen/caddy-directives.mjs"] },
	{ name: "Daedalus steps", cmd: ["bun", "run", "scripts/gen/daedalus-steps.mjs"] },
	{ name: "Secrets catalog", cmd: ["bun", "run", "scripts/gen/secrets-catalog.mjs"] },
	{ name: "OIDC claims", cmd: ["bun", "run", "scripts/gen/oidc-claims.mjs"] },
	{ name: "OAuth2 scopes", cmd: ["bun", "run", "scripts/gen/oauth2-scopes.mjs"] },
	{ name: "Glossary pages", cmd: ["bun", "run", "scripts/gen/glossary-pages.mjs"] },
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
