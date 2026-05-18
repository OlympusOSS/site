#!/usr/bin/env bun
/**
 * Per-glossary-term page (top 20 most-linked terms).
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "content/docs/glossary-terms";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const TERMS = [
	{
		slug: "aal",
		term: "AAL",
		definition:
			"Authenticator Assurance Level. NIST 800-63B concept for the strength of authentication. AAL1 = single factor; AAL2 = two factors; AAL3 = phishing-resistant hardware.",
		related: ["/docs/identity/sessions-aal-refresh", "/docs/identity/mfa-policy"],
	},
	{
		slug: "ciam",
		term: "CIAM",
		definition: "Customer Identity and Access Management. The customer-facing half of an Olympus deployment. Ports 3xxx.",
		related: ["/docs/get-started/concepts-ciam-vs-iam", "/docs/architecture"],
	},
	{
		slug: "iam",
		term: "IAM",
		definition: "Identity and Access Management. The employee-facing half. Ports 4xxx.",
		related: ["/docs/get-started/concepts-ciam-vs-iam"],
	},
	{
		slug: "kratos",
		term: "Kratos",
		definition: "Ory Kratos. The identity service. Handles registration, login, recovery, verification, sessions.",
		related: ["/docs/architecture", "/docs/reference/api/kratos/overview"],
	},
	{
		slug: "hydra",
		term: "Hydra",
		definition: "Ory Hydra. The OAuth2/OIDC server. Issues tokens.",
		related: ["/docs/architecture", "/docs/reference/api/hydra/overview"],
	},
	{
		slug: "athena",
		term: "Athena",
		definition: "The Olympus admin dashboard. One instance per domain.",
		related: ["/docs/repo-map", "/docs/internals/athena-route-map"],
	},
	{
		slug: "hera",
		term: "Hera",
		definition: "The Olympus login/consent UI. Renders Kratos flows + handles Hydra challenges.",
		related: ["/docs/internals/hera-route-map"],
	},
	{
		slug: "trait",
		term: "Trait",
		definition: "A field on a Kratos identity, defined by the JSON-Schema identity schema. Email, name, role, etc.",
		related: ["/docs/identity/identity-schemas"],
	},
	{
		slug: "identifier",
		term: "Identifier",
		definition: "A trait declared in the schema as a login key. Typically email.",
		related: ["/docs/identity/identifiers-and-verification"],
	},
	{
		slug: "flow",
		term: "Flow",
		definition: "A Kratos self-service flow: login, registration, recovery, verification, settings. Each is a state machine.",
		related: ["/docs/identity/flow-login"],
	},
	{
		slug: "credential",
		term: "Credential",
		definition: "An authentication factor on a Kratos identity: password, OIDC, TOTP, WebAuthn, lookup_secret, code.",
		related: ["/docs/identity/identifiers-and-verification"],
	},
	{ slug: "scope", term: "Scope", definition: "An OAuth2 permission a token holds.", related: ["/docs/reference/scopes/overview"] },
	{
		slug: "session",
		term: "Session",
		definition: "A logged-in browser session. Stored in Kratos's sessions table. Has an AAL.",
		related: ["/docs/identity/sessions-aal-refresh"],
	},
	{
		slug: "pkce",
		term: "PKCE",
		definition: "Proof Key for Code Exchange. RFC 7636. Required for all public OAuth2 clients in Olympus.",
		related: ["/docs/security/pkce-enforcement", "/docs/integrate/oauth2-pkce"],
	},
	{
		slug: "consent",
		term: "Consent",
		definition: "The OAuth2 step where the user authorizes a client to receive specific scopes.",
		related: ["/docs/integrate/oauth2-authorization-code"],
	},
	{
		slug: "ofcl",
		term: "OFCL",
		definition: "Olympus Free Container License. Source-available license — operate freely; can't redistribute modified source as a competitor.",
		related: ["/docs/license", "/docs/adrs/0003-source-only-licensing"],
	},
	{ slug: "ory", term: "Ory", definition: "The company behind Kratos and Hydra. Olympus stands on Ory's shoulders.", related: [] },
	{
		slug: "mcp",
		term: "MCP",
		definition: "Model Context Protocol. Anthropic's protocol for exposing tools to LLMs. Daedalus embeds an MCP server.",
		related: ["/docs/integrate/mcp-with-daedalus", "/docs/internals/daedalus-mcp-server"],
	},
	{
		slug: "sdk",
		term: "SDK",
		definition: "The @olympusoss/sdk npm package. Shared settings, encryption, brute-force protection.",
		related: ["/docs/reference/api/sdk/overview", "/docs/internals/sdk-modules"],
	},
	{
		slug: "canvas",
		term: "Canvas",
		definition: "The @olympusoss/canvas design system. React components for Athena, Hera, Site.",
		related: ["/docs/repo-map", "/docs/develop/working-with-canvas"],
	},
	{
		slug: "daedalus",
		term: "Daedalus",
		definition: "The production deployment wizard. Tauri desktop app with embedded MCP.",
		related: ["/docs/deploy/with-daedalus-wizard"],
	},
	{
		slug: "octl",
		term: "Octl",
		definition: "The local-development CLI. `octl deploy` brings up the dev stack.",
		related: ["/docs/get-started/quickstart-octl"],
	},
	{ slug: "platform", term: "Platform", definition: "The infrastructure repo. Compose, configs, schemas, CI/CD.", related: ["/docs/repo-map"] },
	{
		slug: "verify-full",
		term: "verify-full",
		definition: "PostgreSQL TLS mode that verifies certificate chain AND hostname. Required in Olympus production.",
		related: ["/docs/deploy/database-ssl-verify-full", "/docs/adrs/0013-postgres-sslmode-verify-full"],
	},
	{
		slug: "podman",
		term: "Podman",
		definition: "Daemonless OCI container engine. Olympus's runtime.",
		related: ["/docs/adrs/0010-podman-over-docker"],
	},
];

for (const t of TERMS) {
	let body = `---\ntitle: ${JSON.stringify(t.term)}\ndescription: ${JSON.stringify(t.definition.slice(0, 120))}\n---\n\n# ${t.term}\n\n${t.definition}\n\n`;
	if (t.related.length) {
		body += `## Related\n\n${t.related.map((r) => `- [${r}](${r})`).join("\n")}\n\n`;
	}
	body += `See the [full glossary](/docs/glossary) for all terms.\n`;
	writeFileSync(join(OUT_DIR, `${t.slug}.mdx`), body);
}

let overview = `---\ntitle: Glossary terms\ndescription: ${JSON.stringify("Detail pages for the most-referenced terms")}\n---\n\nFor every-term short definitions, see the [full glossary](/docs/glossary). This sub-section has dedicated pages for the most-linked terms.\n\n| Term | Definition |\n|------|------------|\n`;
for (const t of TERMS) {
	overview += `| [${t.term}](./${t.slug}) | ${t.definition.slice(0, 80)}... |\n`;
}
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(join(OUT_DIR, "meta.json"), JSON.stringify({ title: "Glossary terms", pages: ["overview", ...TERMS.map((t) => t.slug)] }, null, 2));

console.log(`Generated ${TERMS.length + 1} glossary term pages in ${OUT_DIR}`);
