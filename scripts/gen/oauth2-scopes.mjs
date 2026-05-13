#!/usr/bin/env bun
/**
 * Per-OAuth2-scope reference pages — standard + Olympus suggested.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "content/docs/reference/scopes";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const SCOPES = [
	{ slug: "openid", name: "openid", source: "OIDC spec", description: "Required to receive an ID token. Without it, the OAuth2 flow returns only an access token (no OIDC features)." },
	{ slug: "profile", name: "profile", source: "OIDC spec", description: "Profile-related claims: `name`, `given_name`, `family_name`, `preferred_username`, `locale`. Olympus also surfaces identity traits here." },
	{ slug: "email", name: "email", source: "OIDC spec", description: "`email` and `email_verified` claims." },
	{ slug: "offline-access", name: "offline_access", source: "OIDC spec", description: "Request a refresh token. Required for long-lived sessions." },
	{ slug: "address", name: "address", source: "OIDC spec", description: "Postal address claims. Olympus doesn't ship this by default; available if you add a trait." },
	{ slug: "phone", name: "phone", source: "OIDC spec", description: "`phone_number`, `phone_number_verified`. Add to schema if you collect phone." },
	{ slug: "groups", name: "groups", source: "Olympus convention", description: "Custom claim with array of group memberships. Used by ArgoCD, Grafana, etc. for role mapping." },
	{ slug: "role", name: "role", source: "Olympus convention", description: "Custom single-string role claim. `admin`, `user`, etc." },
	{ slug: "api-read", name: "api:read", source: "Per-app", description: "Example custom scope — read access to your API." },
	{ slug: "api-write", name: "api:write", source: "Per-app", description: "Example custom scope — write access." },
	{ slug: "admin", name: "admin", source: "Per-app", description: "Example custom scope — admin operations." },
];

for (const s of SCOPES) {
	let body = `---\ntitle: ${JSON.stringify(s.name)}\ndescription: ${JSON.stringify(s.description)}\n---\n\n# OAuth2 scope: \`${s.name}\`\n\n**Source:** ${s.source}\n\n## Description\n\n${s.description}\n\n## Requesting this scope\n\nIn the authorization URL:\n\n\`\`\`\nGET /oauth2/auth?\n  &scope=${s.name}\n  ...\n\`\`\`\n\nMultiple scopes are space-separated.\n\n## Granting access\n\nA client only receives this scope if it's on the client's allowed scope list. Configure in Athena → OAuth2 Clients → your client → Allowed Scopes.\n\n## Checking in your backend\n\nThe access token's \`scope\` claim contains the granted scopes:\n\n\`\`\`ts\nconst granted = info.scope?.split(" ") ?? [];\nif (!granted.includes("${s.name}")) return 403;\n\`\`\`\n\n## Related\n\n- [Cookbook — Add OAuth2 scope](/docs/cookbook/add-oauth2-scope)\n- [Cookbook — Map roles to scopes](/docs/cookbook/map-roles-to-scopes)\n- [Integrate — OAuth2 overview](/docs/integrate/oauth2-overview)\n`;
	writeFileSync(join(OUT_DIR, `${s.slug}.mdx`), body);
}

let overview = `---\ntitle: OAuth2 scopes\ndescription: ${JSON.stringify("Standard OIDC scopes and Olympus-specific conventions")}\n---\n\nOAuth2 scopes describe what a token can do. Standard OIDC scopes are universal; custom scopes are per-app.\n\n## Standard OIDC scopes\n\n| Scope | Description |\n|-------|-------------|\n`;
for (const s of SCOPES.filter(s => s.source === "OIDC spec")) {
	overview += `| [\`${s.name}\`](./${s.slug}) | ${s.description.slice(0, 80)} |\n`;
}
overview += `\n## Olympus conventions\n\n| Scope | Description |\n|-------|-------------|\n`;
for (const s of SCOPES.filter(s => s.source !== "OIDC spec")) {
	overview += `| [\`${s.name}\`](./${s.slug}) | ${s.description.slice(0, 80)} |\n`;
}
overview += `\nSee [Cookbook — Add OAuth2 scope](/docs/cookbook/add-oauth2-scope) to define your own.\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify({ title: "Scopes", pages: ["overview", ...SCOPES.map(s => s.slug)] }, null, 2),
);

console.log(`Generated ${SCOPES.length + 1} OAuth2 scope pages in ${OUT_DIR}`);
