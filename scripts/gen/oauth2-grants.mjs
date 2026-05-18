#!/usr/bin/env bun
/**
 * Per-OAuth2-grant deep-dive pages.
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "content/docs/reference/grants";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const GRANTS = [
	{
		slug: "authorization-code",
		title: "Authorization Code",
		rfc: "RFC 6749 §4.1",
		supported: true,
		whenToUse: "Server-side web apps that can keep a secret.",
		summary: "User redirects to Hydra → authenticates via Hera/Kratos → returns to app with one-time code → app exchanges code for tokens.",
		integration: "/docs/integrate/oauth2-authorization-code",
	},
	{
		slug: "pkce",
		title: "Authorization Code + PKCE",
		rfc: "RFC 7636",
		supported: true,
		whenToUse: "Public clients (SPAs, mobile, CLIs). Mandatory in Olympus.",
		summary: "Same as Authorization Code, but with a per-flow `code_verifier` ↔ `code_challenge` pair to prevent code interception.",
		integration: "/docs/integrate/oauth2-pkce",
	},
	{
		slug: "client-credentials",
		title: "Client Credentials",
		rfc: "RFC 6749 §4.4",
		supported: true,
		whenToUse: "Backend-to-backend (M2M). No user involved.",
		summary:
			"Confidential client POSTs `grant_type=client_credentials` with its credentials. Hydra returns an access token (no refresh, no ID token).",
		integration: "/docs/integrate/oauth2-client-credentials",
	},
	{
		slug: "refresh-token",
		title: "Refresh Token",
		rfc: "RFC 6749 §6",
		supported: true,
		whenToUse: "Renewing access tokens without re-authenticating the user.",
		summary: "Client exchanges refresh token for a new access token (and a new refresh token — Hydra rotates).",
		integration: "/docs/integrate/oauth2-refresh-tokens",
	},
	{
		slug: "implicit",
		title: "Implicit",
		rfc: "RFC 6749 §4.2 (deprecated)",
		supported: false,
		whenToUse: "Never. Removed in OAuth 2.1. Use PKCE instead.",
		summary: "Returned tokens directly in the authorization URL fragment. Insecure (token in URL, browser history, referrer).",
	},
	{
		slug: "password",
		title: "Resource Owner Password Credentials",
		rfc: "RFC 6749 §4.3 (deprecated)",
		supported: false,
		whenToUse: "Never. Removed in OAuth 2.1. Use Authorization Code instead.",
		summary:
			"Client collected the user's password and POSTed directly to the token endpoint. The user's password is in your app — defeats the point of OAuth2 delegation.",
	},
];

for (const g of GRANTS) {
	let body = `---\ntitle: ${JSON.stringify(g.title)}\ndescription: ${JSON.stringify(g.summary)}\n---\n\n# ${g.title}\n\n**Spec:** ${g.rfc}\n\n**Supported in Olympus:** ${g.supported ? "**Yes**" : "**No** (deprecated; do not use)"}\n\n## When to use\n\n${g.whenToUse}\n\n## How it works\n\n${g.summary}\n\n`;

	if (g.supported) {
		body += `## Integration guide\n\nSee [${g.integration}](${g.integration}) for full setup.\n\n`;
	} else {
		body += `## Why not\n\nThis grant is deprecated and removed in OAuth 2.1. Olympus rejects it. The replacement is **Authorization Code + PKCE**.\n\n`;
	}

	body += `## Related\n\n- [Integrate — OAuth2 overview](/docs/integrate/oauth2-overview)\n- [Security — PKCE enforcement](/docs/security/pkce-enforcement)\n`;
	writeFileSync(join(OUT_DIR, `${g.slug}.mdx`), body);
}

let overview = `---\ntitle: OAuth2 grant types\ndescription: ${JSON.stringify("Every OAuth2 grant type, supported and unsupported")}\n---\n\nOlympus supports four OAuth2 grant types and explicitly rejects two deprecated ones.\n\n## Supported\n\n| Grant | RFC | When to use |\n|-------|-----|-------------|\n`;
for (const g of GRANTS.filter((x) => x.supported)) {
	overview += `| [${g.title}](./${g.slug}) | ${g.rfc} | ${g.whenToUse} |\n`;
}
overview += `\n## Not supported (deprecated)\n\n| Grant | RFC | Why |\n|-------|-----|-----|\n`;
for (const g of GRANTS.filter((x) => !x.supported)) {
	overview += `| [${g.title}](./${g.slug}) | ${g.rfc} | ${g.whenToUse} |\n`;
}
overview += `\nSee [Integrate — OAuth2 overview](/docs/integrate/oauth2-overview) for picking the right grant.\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(join(OUT_DIR, "meta.json"), JSON.stringify({ title: "Grants", pages: ["overview", ...GRANTS.map((g) => g.slug)] }, null, 2));

console.log(`Generated ${GRANTS.length + 1} OAuth2 grant pages in ${OUT_DIR}`);
