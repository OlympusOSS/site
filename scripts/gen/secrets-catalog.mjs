#!/usr/bin/env bun
/**
 * Per-secret reference pages — one per secret in Olympus's secret catalog.
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "content/docs/reference/secrets";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const SECRETS = [
	{
		slug: "encryption-key",
		name: "ENCRYPTION_KEY",
		purpose: "Master key for SDK settings encryption.",
		source: "GitHub Secrets → compose env",
		rotation: "/docs/operate/encryption-key-rotation",
		critical: true,
	},
	{
		slug: "session-signing-key",
		name: "SESSION_SIGNING_KEY",
		purpose: "HMAC for Athena session cookies.",
		source: "GitHub Secrets → compose env",
		rotation: "/docs/operate/session-signing-key-rotation",
		critical: true,
	},
	{
		slug: "ciam-reload-api-key",
		name: "CIAM_RELOAD_API_KEY",
		purpose: "Auth for CIAM Kratos schema reload sidecar.",
		source: "GitHub Secrets",
		rotation: "/docs/operate/reload-api-key-rotation",
	},
	{
		slug: "iam-reload-api-key",
		name: "IAM_RELOAD_API_KEY",
		purpose: "Auth for IAM Kratos schema reload sidecar.",
		source: "GitHub Secrets",
		rotation: "/docs/operate/reload-api-key-rotation",
	},
	{
		slug: "kratos-cookie-secret-ciam",
		name: "CIAM_KRATOS_COOKIE_SECRET",
		purpose: "Kratos session cookie HMAC.",
		source: "GitHub Secrets",
		rotation: "/docs/operate/secrets-audit",
	},
	{
		slug: "kratos-cookie-secret-iam",
		name: "IAM_KRATOS_COOKIE_SECRET",
		purpose: "Kratos IAM session cookie HMAC.",
		source: "GitHub Secrets",
		rotation: "/docs/operate/secrets-audit",
	},
	{
		slug: "kratos-cipher-secret-ciam",
		name: "CIAM_KRATOS_CIPHER_SECRET",
		purpose: "Kratos recovery/verification token cipher.",
		source: "GitHub Secrets",
		rotation: "/docs/operate/secrets-audit",
	},
	{
		slug: "kratos-cipher-secret-iam",
		name: "IAM_KRATOS_CIPHER_SECRET",
		purpose: "Kratos IAM cipher.",
		source: "GitHub Secrets",
		rotation: "/docs/operate/secrets-audit",
	},
	{
		slug: "hydra-system-secret-ciam",
		name: "CIAM_HYDRA_SYSTEM_SECRET",
		purpose: "Hydra encrypts client secrets and JWKs with this.",
		source: "GitHub Secrets",
		rotation: "/docs/operate/secrets-audit",
		critical: true,
	},
	{
		slug: "hydra-system-secret-iam",
		name: "IAM_HYDRA_SYSTEM_SECRET",
		purpose: "Hydra IAM system secret.",
		source: "GitHub Secrets",
		rotation: "/docs/operate/secrets-audit",
		critical: true,
	},
	{
		slug: "smtp-credentials",
		name: "SMTP_USER / SMTP_PASSWORD",
		purpose: "Email provider credentials.",
		source: "GitHub Secrets → Kratos courier",
		rotation: "provider dashboard",
	},
	{
		slug: "turnstile-secret-key",
		name: "TURNSTILE_SECRET_KEY",
		purpose: "Cloudflare Turnstile verification.",
		source: "GitHub Secrets → Hera env",
		rotation: "Cloudflare dashboard",
	},
	{
		slug: "database-url",
		name: "DATABASE_URL",
		purpose: "Postgres connection string with password.",
		source: "GitHub Secrets",
		rotation: "Postgres admin",
	},
	{
		slug: "postgres-ca-cert",
		name: "Postgres CA certificate",
		purpose: "TLS verify-full root cert.",
		source: "Static file or build artifact",
		rotation: "/docs/operate/cert-rotation",
	},
	{
		slug: "ssh-deploy-key",
		name: "DEPLOY_SSH_KEY",
		purpose: "GitHub Actions deploy SSH key for the VPS.",
		source: "GitHub Secrets",
		rotation: "regenerate via Daedalus / ssh-keygen",
	},
	{ slug: "ghcr-pull-token", name: "GHCR pull token", purpose: "Pull private images from GHCR.", source: "GitHub PAT", rotation: "GitHub" },
	{
		slug: "daedalus-provider-tokens",
		name: "Daedalus provider tokens",
		purpose: "DigitalOcean / Hostinger / Neon API keys.",
		source: "Local daedalus.json + GitHub Secrets",
		rotation: "per provider",
	},
];

for (const s of SECRETS) {
	const body = `---\ntitle: ${JSON.stringify(s.name)}\ndescription: ${JSON.stringify(s.purpose)}\n---\n\n# Secret: \`${s.name}\`\n\n**Purpose:** ${s.purpose}\n\n**Source:** ${s.source}\n\n**Rotation runbook:** [${s.rotation}](${s.rotation})\n\n${s.critical ? "## ⚠️ Critical\n\nThis secret is operationally critical. Loss or compromise has significant impact:\n- If lost: data may be unrecoverable (encryption case).\n- If compromised: rotate immediately and audit access.\n\n" : ""}## How it's used\n\nLoaded at container startup. Failure to read the secret usually causes a fatal startup error.\n\n## How to rotate\n\nSee the linked runbook above. Most secrets have a documented zero-downtime rotation procedure.\n\n## Related\n\n- [Security — Secrets management](/docs/security/secrets-management) — full inventory.\n- [Operate — Secrets audit](/docs/operate/secrets-audit) — quarterly cadence.\n`;
	writeFileSync(join(OUT_DIR, `${s.slug}.mdx`), body);
}

let overview = `---\ntitle: Secrets catalog\ndescription: ${JSON.stringify(`${SECRETS.length} cryptographic secrets in Olympus`)}\n---\n\nEvery secret material in an Olympus deployment, with its purpose and rotation path.\n\n| Secret | Purpose | Critical |\n|--------|---------|----------|\n`;
for (const s of SECRETS) {
	overview += `| [\`${s.name}\`](./${s.slug}) | ${s.purpose} | ${s.critical ? "**yes**" : "—"} |\n`;
}
overview += `\nSee [Security — Secrets management](/docs/security/secrets-management) for the architectural overview.\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(join(OUT_DIR, "meta.json"), JSON.stringify({ title: "Secrets", pages: ["overview", ...SECRETS.map((s) => s.slug)] }, null, 2));

console.log(`Generated ${SECRETS.length + 1} secret pages in ${OUT_DIR}`);
