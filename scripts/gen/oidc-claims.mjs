#!/usr/bin/env bun
/**
 * Per-OIDC-claim reference pages.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "content/docs/reference/oidc-claims";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const CLAIMS = [
	{ slug: "sub", name: "sub", type: "string", source: "Hydra/Kratos", description: "Subject identifier. The Kratos identity ID (UUID)." },
	{ slug: "iss", name: "iss", type: "string", source: "Hydra", description: "Issuer URL. Should match your CIAM/IAM Hydra base URL." },
	{ slug: "aud", name: "aud", type: "string or array", source: "Hydra", description: "Audience(s). The client_id(s) this token was issued for." },
	{ slug: "iat", name: "iat", type: "integer", source: "Hydra", description: "Issued at — Unix timestamp." },
	{ slug: "exp", name: "exp", type: "integer", source: "Hydra", description: "Expiry — Unix timestamp." },
	{ slug: "nbf", name: "nbf", type: "integer", source: "Hydra", description: "Not before — Unix timestamp. Token not valid before this." },
	{ slug: "jti", name: "jti", type: "string", source: "Hydra", description: "JWT ID. Unique per token; used for revocation." },
	{ slug: "auth-time", name: "auth_time", type: "integer", source: "Kratos via Hydra", description: "When authentication occurred." },
	{ slug: "acr", name: "acr", type: "string", source: "Kratos via Hydra", description: "Authentication context class reference. `aal1`, `aal2`, etc." },
	{ slug: "amr", name: "amr", type: "array of strings", source: "Kratos via Hydra", description: "Authentication methods reference. `pwd`, `totp`, `webauthn`, etc." },
	{ slug: "azp", name: "azp", type: "string", source: "Hydra", description: "Authorized party. The client_id the token was issued for." },
	{ slug: "nonce", name: "nonce", type: "string", source: "Client → Hydra", description: "Anti-replay nonce, echoed back in the ID token." },
	{ slug: "email", name: "email", type: "string", source: "Kratos identity traits", description: "User's email. Included with `email` scope." },
	{ slug: "email-verified", name: "email_verified", type: "boolean", source: "Kratos identity verifiable_addresses", description: "Whether the email has been verified by Kratos. **Olympus does NOT trust this claim from upstream IdPs**." },
	{ slug: "name", name: "name", type: "string", source: "Kratos identity traits", description: "User's full name. Included with `profile` scope." },
	{ slug: "given-name", name: "given_name", type: "string", source: "Kratos identity traits", description: "First name. Included with `profile` scope." },
	{ slug: "family-name", name: "family_name", type: "string", source: "Kratos identity traits", description: "Last name." },
	{ slug: "preferred-username", name: "preferred_username", type: "string", source: "Kratos identity traits", description: "Preferred display name. Often the email." },
	{ slug: "locale", name: "locale", type: "string", source: "Kratos identity traits", description: "Preferred locale (e.g. `en-US`). Included with `profile` scope." },
	{ slug: "ext", name: "ext", type: "object", source: "Olympus custom claims", description: "Custom claims namespace. Olympus's custom traits (role, groups, etc.) often surface here." },
];

for (const c of CLAIMS) {
	let body = `---\ntitle: ${JSON.stringify(c.name)}\ndescription: ${JSON.stringify(c.description)}\n---\n\n# OIDC claim: \`${c.name}\`\n\n**Type:** \`${c.type}\`\n\n**Source:** ${c.source}\n\n## Description\n\n${c.description}\n\n## Where it appears\n\n- ID tokens (always for standard claims).\n- Userinfo endpoint response (with appropriate scope).\n- Introspection response (for opaque tokens).\n\n## Related\n\n- [Integrate — OIDC userinfo](/docs/integrate/oidc-userinfo)\n- [Integrate — OIDC discovery](/docs/integrate/oidc-discovery)\n- [Cookbook — Add custom claim to ID token](/docs/cookbook/add-custom-claim-id-token)\n`;
	writeFileSync(join(OUT_DIR, `${c.slug}.mdx`), body);
}

let overview = `---\ntitle: OIDC claims\ndescription: ${JSON.stringify("Standard and Olympus-specific OIDC claims")}\n---\n\nThe ID token and userinfo response can include these claims. Per-page detail follows.\n\n| Claim | Type | Source |\n|-------|------|--------|\n`;
for (const c of CLAIMS) {
	overview += `| [\`${c.name}\`](./${c.slug}) | ${c.type} | ${c.source} |\n`;
}
overview += `\nCustom claims live in \`ext.*\` or as identity traits. See [Cookbook — Add custom claim](/docs/cookbook/add-custom-claim-id-token).\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify({ title: "OIDC claims", pages: ["overview", ...CLAIMS.map(c => c.slug)] }, null, 2),
);

console.log(`Generated ${CLAIMS.length + 1} OIDC claim pages in ${OUT_DIR}`);
