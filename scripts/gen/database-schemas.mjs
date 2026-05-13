#!/usr/bin/env bun
/**
 * Database schema reference. One page per database; for the `olympus` DB,
 * one page per table.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "content/docs/reference/schemas/databases";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

// The five Olympus databases
const DATABASES = [
	{
		slug: "ciam-kratos",
		name: "ciam_kratos",
		owner: "Ory Kratos (CIAM)",
		description: "Customer identities, sessions, recovery tokens, courier messages.",
		schema_source: "Kratos migrations (upstream Ory)",
		notes: "Schema is owned by Kratos. Migrations run on container startup. See [Ory Kratos persistence docs](https://www.ory.sh/docs/kratos/reference/configuration#dsn).",
	},
	{
		slug: "ciam-hydra",
		name: "ciam_hydra",
		owner: "Ory Hydra (CIAM)",
		description: "Customer OAuth2 clients, tokens, consent sessions, JWKs.",
		schema_source: "Hydra migrations (upstream Ory)",
		notes: "Schema is owned by Hydra. See [Ory Hydra persistence docs](https://www.ory.sh/docs/hydra/reference/configuration#dsn).",
	},
	{
		slug: "iam-kratos",
		name: "iam_kratos",
		owner: "Ory Kratos (IAM)",
		description: "Employee identities, sessions, recovery tokens, courier messages.",
		schema_source: "Kratos migrations (upstream Ory)",
		notes: "Mirrors `ciam_kratos`'s schema; different data set.",
	},
	{
		slug: "iam-hydra",
		name: "iam_hydra",
		owner: "Ory Hydra (IAM)",
		description: "Employee OAuth2 clients, tokens, consent sessions, JWKs.",
		schema_source: "Hydra migrations (upstream Ory)",
		notes: "Mirrors `ciam_hydra`'s schema; different data set.",
	},
	{
		slug: "olympus",
		name: "olympus",
		owner: "Olympus SDK",
		description: "Settings vault, brute-force tracking, session locations, security audit.",
		schema_source: "SDK auto-migration (`sdk/src/db.ts`)",
		notes: "Owned by the Olympus SDK. Tables documented per-table below.",
	},
];

// Per-database page
for (const db of DATABASES) {
	let body = `---\ntitle: ${JSON.stringify(db.name)}\ndescription: ${JSON.stringify(db.description)}\n---\n\n## Database \`${db.name}\`\n\n**Owner:** ${db.owner}\n\n**Schema source:** ${db.schema_source}\n\n${db.description}\n\n${db.notes}\n\n`;

	if (db.slug === "olympus") {
		body += `## Tables\n\n- [\`ciam_settings\`](./ciam-settings) — CIAM-domain settings vault.\n- [\`iam_settings\`](./iam-settings) — IAM-domain settings vault.\n- [\`locations\`](./locations) — Session location history.\n- [\`login_attempts\`](./login-attempts) — Recent login attempts.\n- [\`lockouts\`](./lockouts) — Active and historical brute-force lockouts.\n- [\`security_audit\`](./security-audit) — Audit log.\n\nSee [Internals — SDK Modules](/docs/internals/sdk-modules) for the code that owns these tables.\n`;
	}

	body += `\n---\n\n*Reference for the Olympus database. See [Reference — Schemas overview](/docs/reference/schemas/overview).*\n`;
	writeFileSync(join(OUT_DIR, `${db.slug}.mdx`), body);
}

// Per-table pages for olympus database
const TABLES = [
	{
		slug: "ciam-settings",
		name: "ciam_settings",
		description: "Key-value settings vault for the CIAM domain. Encrypted values use the `v2:` prefix.",
		columns: [
			{ name: "key", type: "TEXT", nullable: "no", description: "Setting key (e.g. `social.google.client_id`)" },
			{ name: "value", type: "TEXT", nullable: "yes", description: "Setting value. May be encrypted (see prefix)." },
			{ name: "encrypted", type: "BOOLEAN", nullable: "no", description: "Whether the value is encrypted." },
			{ name: "created_at", type: "TIMESTAMPTZ", nullable: "no", description: "Row creation time." },
			{ name: "modified_at", type: "TIMESTAMPTZ", nullable: "no", description: "Last modification time." },
		],
		owner: "SDK settings module",
		related: ["/docs/security/encryption-at-rest", "/docs/reference/api/sdk/settings"],
	},
	{
		slug: "iam-settings",
		name: "iam_settings",
		description: "Same schema as `ciam_settings`, but for the IAM domain.",
		columns: [],
		copyColumnsFrom: "ciam-settings",
		owner: "SDK settings module",
		related: ["/docs/security/encryption-at-rest"],
	},
	{
		slug: "locations",
		name: "locations",
		description: "Login location history per session.",
		columns: [
			{ name: "id", type: "UUID", nullable: "no", description: "Primary key." },
			{ name: "domain", type: "TEXT", nullable: "no", description: "`ciam` or `iam`." },
			{ name: "identity_id", type: "UUID", nullable: "no", description: "Kratos identity ID." },
			{ name: "session_id", type: "UUID", nullable: "yes", description: "Kratos session ID." },
			{ name: "ip", type: "INET", nullable: "no", description: "Client IP address (from Caddy's `X-Real-IP`)." },
			{ name: "country", type: "TEXT", nullable: "yes", description: "Geo-IP country code (best-effort)." },
			{ name: "city", type: "TEXT", nullable: "yes", description: "Geo-IP city (best-effort)." },
			{ name: "created_at", type: "TIMESTAMPTZ", nullable: "no", description: "Login time." },
		],
		owner: "SDK locations module",
		related: ["/docs/reference/api/sdk/locations"],
	},
	{
		slug: "login-attempts",
		name: "login_attempts",
		description: "Recent login attempts, used by the brute-force protection logic.",
		columns: [
			{ name: "id", type: "UUID", nullable: "no", description: "Primary key." },
			{ name: "domain", type: "TEXT", nullable: "no", description: "`ciam` or `iam`." },
			{ name: "identifier", type: "TEXT", nullable: "no", description: "Login identifier (typically email)." },
			{ name: "source_ip", type: "INET", nullable: "yes", description: "Client IP." },
			{ name: "success", type: "BOOLEAN", nullable: "no", description: "Whether the attempt succeeded." },
			{ name: "created_at", type: "TIMESTAMPTZ", nullable: "no", description: "Attempt time." },
		],
		owner: "SDK brute-force module",
		related: ["/docs/security/brute-force"],
	},
	{
		slug: "lockouts",
		name: "lockouts",
		description: "Active and historical brute-force lockouts.",
		columns: [
			{ name: "id", type: "UUID", nullable: "no", description: "Primary key." },
			{ name: "domain", type: "TEXT", nullable: "no", description: "`ciam` or `iam`." },
			{ name: "identifier", type: "TEXT", nullable: "no", description: "Locked identifier." },
			{ name: "locked_until", type: "TIMESTAMPTZ", nullable: "no", description: "Lockout expiry. NULL = never expires (manual unlock required)." },
			{ name: "reason", type: "TEXT", nullable: "yes", description: "Lockout reason (`brute_force`, `manual`, etc.)." },
			{ name: "applied_by", type: "UUID", nullable: "yes", description: "Identity who manually applied (if `manual`)." },
			{ name: "created_at", type: "TIMESTAMPTZ", nullable: "no", description: "Lockout start." },
		],
		owner: "SDK brute-force module",
		related: ["/docs/operate/locked-account-unlock", "/docs/security/account-lockout"],
	},
	{
		slug: "security-audit",
		name: "security_audit",
		description: "Audit log of security-relevant events.",
		columns: [
			{ name: "id", type: "UUID", nullable: "no", description: "Primary key." },
			{ name: "domain", type: "TEXT", nullable: "no", description: "`ciam` or `iam`." },
			{ name: "identity_id", type: "UUID", nullable: "yes", description: "Subject identity (NULL for unauth events)." },
			{ name: "event_type", type: "TEXT", nullable: "no", description: "Event type (`login.success`, `lockout.applied`, etc.)." },
			{ name: "source_ip", type: "INET", nullable: "yes", description: "Client IP." },
			{ name: "user_agent", type: "TEXT", nullable: "yes", description: "Browser user agent." },
			{ name: "metadata", type: "JSONB", nullable: "no", description: "Event-specific data." },
			{ name: "created_at", type: "TIMESTAMPTZ", nullable: "no", description: "Event time." },
		],
		owner: "SDK (all modules)",
		related: ["/docs/operate/audit-log-retention", "/docs/security/brute-force"],
	},
];

for (const t of TABLES) {
	let columns = t.columns;
	if (t.copyColumnsFrom) {
		const src = TABLES.find((x) => x.slug === t.copyColumnsFrom);
		columns = src.columns;
	}

	let body = `---\ntitle: ${JSON.stringify(t.name)}\ndescription: ${JSON.stringify(t.description)}\n---\n\n## Table \`${t.name}\`\n\n${t.description}\n\n**Database:** \`olympus\`\n\n**Owner:** ${t.owner}\n\n## Columns\n\n| Column | Type | Nullable | Description |\n|--------|------|----------|-------------|\n`;
	for (const c of columns) {
		body += `| \`${c.name}\` | \`${c.type}\` | ${c.nullable} | ${c.description} |\n`;
	}
	if (t.related && t.related.length) {
		body += `\n## Related\n\n`;
		for (const r of t.related) {
			body += `- [${r}](${r})\n`;
		}
	}
	body += `\n---\n\n*Schema owned by ${t.owner}. Migrations live in \`sdk/src/db.ts\`.*\n`;
	writeFileSync(join(OUT_DIR, `${t.slug}.mdx`), body);
}

// Overview
let overview = `---\ntitle: Database schemas\ndescription: ${JSON.stringify("All five Olympus databases and their tables")}\n---\n\nOlympus uses **five PostgreSQL databases**. Four are owned by Ory (Kratos and Hydra, per-domain); one (\`olympus\`) is owned by the Olympus SDK.\n\n## Databases\n\n| Database | Owner |\n|----------|-------|\n`;
for (const db of DATABASES) {
	overview += `| [\`${db.name}\`](./${db.slug}) | ${db.owner} |\n`;
}
overview += `\n## \`olympus\` tables\n\nThe SDK-owned tables, each documented on its own page:\n\n`;
for (const t of TABLES) {
	overview += `- [\`${t.name}\`](./${t.slug}) — ${t.description}\n`;
}
overview += `\n## Connection\n\nAll connections use \`sslmode=verify-full\` in production. See [Deploy — Database SSL verify-full](/docs/deploy/database-ssl-verify-full).\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify(
		{
			title: "Databases",
			pages: [
				"overview",
				...DATABASES.map((d) => d.slug),
				...TABLES.map((t) => t.slug),
			],
		},
		null,
		2,
	),
);

console.log(`Generated ${DATABASES.length + TABLES.length + 1} database schema pages in ${OUT_DIR}`);
