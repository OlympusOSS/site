#!/usr/bin/env bun
/**
 * Per-error-code reference pages — Athena, Kratos, Hydra, OAuth2 RFC.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "content/docs/reference/errors-detail";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const ERRORS = [
	// Athena errors
	{
		slug: "athena-not-authenticated",
		code: "not_authenticated",
		source: "Athena",
		http: 401,
		summary: "Session cookie missing or invalid.",
		when: "Every admin route requires the `athena-session` cookie. Missing or invalid HMAC.",
		causes: ["No session cookie", "Session expired", "Cookie tampered", "`SESSION_SIGNING_KEY` rotated incorrectly"],
		fix: "User re-authenticates. If keys were rotated incorrectly, see [Operate — Session signing key rotation](/docs/operate/session-signing-key-rotation).",
	},
	{
		slug: "athena-forbidden",
		code: "forbidden",
		source: "Athena",
		http: 403,
		summary: "Session is valid but role is insufficient.",
		when: "An admin route required `role: admin` in the session payload.",
		causes: ["User logged in as customer, accessing admin route"],
		fix: "User must log in as an admin identity.",
	},
	{
		slug: "athena-bad-content-type",
		code: "bad_content_type",
		source: "Athena",
		http: 415,
		summary: "Mutation routes require `Content-Type: application/json`.",
		when: "POST/PUT/PATCH/DELETE on an admin route with wrong content type.",
		causes: ["Form submission instead of JSON", "Missing Content-Type header"],
		fix: "Set Content-Type to application/json.",
	},
	// OAuth2 RFC errors
	{
		slug: "oauth2-invalid-request",
		code: "invalid_request",
		source: "Hydra (RFC 6749)",
		http: 400,
		summary: "OAuth2 request is missing or has malformed parameters.",
		when: "Common with bad authorize/token requests.",
		causes: ["Missing client_id", "Missing redirect_uri", "Missing PKCE challenge for public client"],
		fix: "Check the request parameters. See [Troubleshooting — pkce_required](/docs/troubleshooting/oauth2-pkce-required) for the PKCE case.",
	},
	{
		slug: "oauth2-invalid-client",
		code: "invalid_client",
		source: "Hydra (RFC 6749)",
		http: 401,
		summary: "Client authentication failed.",
		when: "Token endpoint received wrong client credentials.",
		causes: ["Wrong client_id or client_secret", "Client not registered"],
		fix: "Verify credentials in Athena → OAuth2 Clients.",
	},
	{
		slug: "oauth2-invalid-grant",
		code: "invalid_grant",
		source: "Hydra (RFC 6749)",
		http: 400,
		summary: "Authorization grant is invalid, expired, revoked, or doesn't match the redirect_uri.",
		when: "Token exchange or refresh.",
		fix: "See [Troubleshooting — OAuth2 invalid_grant](/docs/troubleshooting/oauth2-invalid-grant) for the full diagnostic.",
	},
	{
		slug: "oauth2-unauthorized-client",
		code: "unauthorized_client",
		source: "Hydra (RFC 6749)",
		http: 400,
		summary: "Client not authorized to use this grant type.",
		when: "Confidential client trying to use implicit flow, or public client trying client_credentials.",
		fix: "Update the client's allowed grant types in Athena.",
	},
	{
		slug: "oauth2-unsupported-grant-type",
		code: "unsupported_grant_type",
		source: "Hydra (RFC 6749)",
		http: 400,
		summary: "Grant type not supported by the server.",
		when: "Most often: trying to use `password` grant (removed in Olympus per OAuth 2.1).",
		fix: "Use Authorization Code instead.",
	},
	{
		slug: "oauth2-invalid-scope",
		code: "invalid_scope",
		source: "Hydra (RFC 6749)",
		http: 400,
		summary: "Requested scope is invalid or unknown.",
		when: "Client requested a scope not in its allowed scope list.",
		fix: "Add the scope to the client's allowed scopes in Athena.",
	},
	{
		slug: "oauth2-pkce-required",
		code: "pkce_required",
		source: "Hydra (Olympus enforcement)",
		http: 400,
		summary: "PKCE is mandatory for this client.",
		when: "Public client started a flow without `code_challenge`.",
		fix: "See [Troubleshooting — PKCE required](/docs/troubleshooting/oauth2-pkce-required) for the diagnostic.",
	},
	// Kratos errors
	{
		slug: "kratos-flow-expired",
		code: "self_service_flow_expired",
		source: "Kratos",
		http: 410,
		summary: "Self-service flow has exceeded its TTL.",
		when: "User took too long between flow init and submission.",
		fix: "User starts over. See [Troubleshooting — Kratos flow expired](/docs/troubleshooting/kratos-flow-expired).",
	},
	{
		slug: "kratos-csrf-violation",
		code: "security_csrf_violation",
		source: "Kratos",
		http: 400,
		summary: "CSRF token mismatch.",
		when: "Submission cookie's CSRF token doesn't match form token.",
		fix: "See [Troubleshooting — CSRF violation](/docs/troubleshooting/kratos-csrf-violation).",
	},
	{
		slug: "kratos-aal2-required",
		code: "session_aal2_required",
		source: "Kratos",
		http: 403,
		summary: "Session AAL is too low for the requested operation.",
		when: "AAL1 session trying to perform a settings change that requires AAL2.",
		fix: "Step up via `/self-service/login/browser?aal=aal2&refresh=true`. See [Troubleshooting — AAL too low](/docs/troubleshooting/kratos-session-aal-too-low).",
	},
	{
		slug: "kratos-invalid-credentials",
		code: "invalid_credentials",
		source: "Kratos",
		http: 400,
		summary: "Login credentials are invalid.",
		when: "Wrong password or unknown identifier.",
		fix: "Kratos deliberately doesn't distinguish 'wrong password' from 'no such user' to prevent enumeration. User retries or starts recovery.",
	},
	// SDK errors
	{
		slug: "sdk-encryption-key-not-set",
		code: "encryption_key_not_set",
		source: "SDK",
		http: 500,
		summary: "ENCRYPTION_KEY env var is not set.",
		when: "Container startup — fatal.",
		fix: "Set ENCRYPTION_KEY in deployment env. See [Troubleshooting — Encryption key startup](/docs/troubleshooting/encryption-key-startup-failure).",
	},
	{
		slug: "sdk-encryption-key-blocklisted",
		code: "encryption_key_blocklisted",
		source: "SDK",
		http: 500,
		summary: "ENCRYPTION_KEY is on the blocklist of known-weak values.",
		when: "Container startup — fatal.",
		fix: "Generate a strong key: `openssl rand -base64 32`. See [Security — Encryption key blocklist](/docs/security/encryption-key-blocklist).",
	},
	{
		slug: "sdk-cipher-decrypt-fail",
		code: "cipher_decrypt_fail",
		source: "SDK",
		http: 500,
		summary: "Decryption of an encrypted setting failed.",
		when: "Reading a setting whose ciphertext doesn't match the current ENCRYPTION_KEY.",
		causes: ["ENCRYPTION_KEY rotated without migration", "Ciphertext corruption"],
		fix: "See [Operate — Encryption key rotation](/docs/operate/encryption-key-rotation) or [Cookbook — Recover lost encryption key](/docs/cookbook/recover-lost-encryption-key).",
	},
];

for (const e of ERRORS) {
	let body = `---\ntitle: ${JSON.stringify(`${e.code}`)}\ndescription: ${JSON.stringify(`${e.summary} — source: ${e.source}`)}\n---\n\n# \`${e.code}\`\n\n**Source:** ${e.source}\n\n**HTTP:** ${e.http}\n\n## Summary\n\n${e.summary}\n\n## When this fires\n\n${e.when}\n\n`;
	if (e.causes && e.causes.length) {
		body += `## Common causes\n\n${e.causes.map(c => `- ${c}`).join("\n")}\n\n`;
	}
	body += `## Fix\n\n${e.fix}\n\n`;
	body += `## Source code\n\nGenerated from the platform's error catalog. To find emit sites: \`grep -r "${e.code}" ../<repo>/src\`.\n`;
	writeFileSync(join(OUT_DIR, `${e.slug}.mdx`), body);
}

// Overview
let overview = `---\ntitle: Error catalog (detail)\ndescription: ${JSON.stringify(`${ERRORS.length} known error codes — Athena, Kratos, Hydra, SDK, OAuth2`)}\n---\n\nEvery known error code emitted by Olympus and its components, with what causes it and how to fix.\n\n## By source\n\n`;
const bySource = {};
for (const e of ERRORS) (bySource[e.source] ||= []).push(e);
for (const source of Object.keys(bySource).sort()) {
	overview += `### ${source}\n\n| Code | HTTP | Summary |\n|------|------|---------|\n`;
	for (const e of bySource[source]) {
		overview += `| [\`${e.code}\`](./${e.slug}) | ${e.http} | ${e.summary} |\n`;
	}
	overview += `\n`;
}
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify({ title: "Error catalog", pages: ["overview", ...ERRORS.map(e => e.slug)] }, null, 2),
);

console.log(`Generated ${ERRORS.length + 1} error catalog pages in ${OUT_DIR}`);
