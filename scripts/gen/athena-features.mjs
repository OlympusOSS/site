#!/usr/bin/env bun
/**
 * Generate per-feature-module pages for athena/src/features/.
 */

import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const FEATURES_DIR = "../athena/src/features";
const OUT_DIR = "content/docs/reference/api/athena-features";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const featureDescriptions = {
	analytics: "Dashboard analytics widgets — PKCE traffic, MFA stats, login attempts, lockout trends.",
	auth: "Athena's own auth chain. Login via OAuth2 against IAM Hera; session cookie management.",
	identities: "Identity CRUD UI — list, view, edit, delete identities in either CIAM or IAM Kratos.",
	"m2m-clients": "Machine-to-machine OAuth2 client management. Create, view, rotate secrets.",
	messages: "Kratos courier message log — verification emails, recovery emails, notification emails.",
	"oauth2-auth": "Background module handling the OAuth2 flow into Athena itself.",
	"oauth2-clients": "User-facing OAuth2 client management UI.",
	"oauth2-tokens": "OAuth2 token introspection — paste a token, see its claims.",
	schemas: "Identity schema editor with live reload via the Kratos reload sidecar.",
	security: "Security audit log viewer.",
	sessions: "Active sessions list with revoke action.",
	settings: "Settings vault editor for the Olympus settings DB.",
};

const features = readdirSync(resolve(FEATURES_DIR))
	.filter((f) => {
		try {
			return statSync(join(resolve(FEATURES_DIR), f)).isDirectory();
		} catch {
			return false;
		}
	})
	.sort();

for (const f of features) {
	const desc = featureDescriptions[f] || `Feature module: ${f}`;
	let body = `---\ntitle: ${JSON.stringify(f)}\ndescription: ${JSON.stringify(desc)}\n---\n\n# Feature: \`${f}\`\n\n${desc}\n\n`;
	body += `**Source:** [\`athena/src/features/${f}/\`](https://github.com/OlympusOSS/athena/tree/main/src/features/${f})\n\n`;
	body += `## Files\n\nA feature module typically contains:\n- \`page.tsx\` — Next.js route entry.\n- \`components/\` — feature-specific React components.\n- \`actions.ts\` — server actions / API client calls.\n- \`*.test.ts\` — Vitest unit tests.\n\n`;
	body += `## How it talks to Ory\n\nAll Kratos/Hydra calls go through the [service layer](/docs/internals/athena-service-layer) — never direct from the feature. This keeps the feature testable in isolation.\n\n`;
	body += `## Related\n\n- [Internals — Athena route map](/docs/internals/athena-route-map)\n- [Internals — Athena service layer](/docs/internals/athena-service-layer)\n- [Internals — Athena feature modules](/docs/internals/athena-features)\n`;
	body += `\n---\n\n*Generated from \`athena/src/features/\` at build time.*\n`;
	writeFileSync(join(OUT_DIR, `${f}.mdx`), body);
}

// Overview
let overview = `---\ntitle: Athena feature modules\ndescription: ${JSON.stringify(`${features.length} feature modules in Athena`)}\n---\n\nAthena's \`src/features/\` directory holds per-feature code. Each module is a self-contained Next.js page + components + actions + tests.\n\n## Modules\n\n| Module | Description |\n|--------|-------------|\n`;
for (const f of features) {
	overview += `| [\`${f}\`](./${f}) | ${(featureDescriptions[f] || "—").replace(/\|/g, "\\|").slice(0, 80)} |\n`;
}
overview += `\nSee [Internals — Athena features](/docs/internals/athena-features) for the architectural pattern.\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(join(OUT_DIR, "meta.json"), JSON.stringify({ title: "Athena features", pages: ["overview", ...features] }, null, 2));

console.log(`Generated ${features.length + 1} athena feature pages in ${OUT_DIR}`);
