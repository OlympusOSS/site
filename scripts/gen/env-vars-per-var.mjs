#!/usr/bin/env bun
/**
 * Generate per-environment-variable detail pages.
 * Walks every repo, finds process.env.X / std::env::var, and emits one
 * page per env var with detailed metadata.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const REPOS = [
	{ name: "athena", path: "../athena/src", pat: /process\.env\.([A-Z][A-Z0-9_]+)/g },
	{ name: "hera", path: "../hera/src", pat: /process\.env\.([A-Z][A-Z0-9_]+)/g },
	{ name: "sdk", path: "../sdk/src", pat: /process\.env\.([A-Z][A-Z0-9_]+)/g },
	{ name: "site", path: "../site/src", pat: /process\.env\.([A-Z][A-Z0-9_]+)/g },
	{ name: "octl", path: "../octl/src", pat: /process\.env\.([A-Z][A-Z0-9_]+)/g },
	{ name: "daedalus", path: "../daedalus/src-tauri/src", pat: /std::env::var\("([A-Z][A-Z0-9_]+)"\)/g },
];

const OUT_DIR = "content/docs/reference/env";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

function walk(dir) {
	const out = [];
	try {
		for (const e of readdirSync(dir)) {
			if (e === "node_modules" || e.startsWith(".")) continue;
			const p = join(dir, e);
			const st = statSync(p);
			if (st.isDirectory()) out.push(...walk(p));
			else if (st.isFile() && /\.(ts|tsx|js|mjs|cjs|rs)$/.test(e)) out.push(p);
		}
	} catch {
		// path may not exist
	}
	return out;
}

const byVar = {}; // VAR_NAME -> Set<repo>

for (const r of REPOS) {
	const files = walk(resolve(r.path));
	for (const f of files) {
		const content = readFileSync(f, "utf-8");
		const m = content.matchAll(r.pat);
		for (const match of m) {
			const v = match[1];
			(byVar[v] ||= new Set()).add(r.name);
		}
	}
}

// Hand-curated overlay for known env vars
const OVERLAY = {
	ENCRYPTION_KEY: {
		secret: true,
		required: true,
		purpose: "Master key for AES-256-GCM encryption of sensitive settings in the SDK settings vault.",
		generation: "openssl rand -base64 32",
		rotation: "/docs/operate/encryption-key-rotation",
		blocklist: true,
	},
	SESSION_SIGNING_KEY: {
		secret: true,
		required: true,
		purpose: "HMAC-SHA256 key for signing Athena session cookies.",
		generation: "openssl rand -base64 32",
		rotation: "/docs/operate/session-signing-key-rotation",
	},
	DATABASE_URL: {
		secret: true,
		required: true,
		purpose: "PostgreSQL connection string. Must include `sslmode=verify-full` in production.",
	},
	CIAM_RELOAD_API_KEY: {
		secret: true,
		required: true,
		purpose: "Shared secret between Athena and the CIAM Kratos reload sidecar. Authorizes schema reload requests.",
		rotation: "/docs/operate/reload-api-key-rotation",
	},
	IAM_RELOAD_API_KEY: {
		secret: true,
		required: true,
		purpose: "Shared secret for the IAM Kratos reload sidecar.",
		rotation: "/docs/operate/reload-api-key-rotation",
	},
	HYDRA_ADMIN_URL: {
		secret: false,
		required: true,
		purpose: "Internal URL for the Hydra admin API. Network-restricted; not publicly exposed.",
	},
	KRATOS_PUBLIC_URL: {
		secret: false,
		required: true,
		purpose: "Browser-facing URL for the Kratos public API.",
	},
	KRATOS_ADMIN_URL: {
		secret: false,
		required: true,
		purpose: "Internal URL for the Kratos admin API.",
	},
	TURNSTILE_SITE_KEY: {
		secret: false,
		required: false,
		purpose: "Cloudflare Turnstile public site key. If set, enables captcha; if unset, captcha disabled.",
	},
	TURNSTILE_SECRET_KEY: {
		secret: true,
		required: false,
		purpose: "Cloudflare Turnstile secret key. Required if `TURNSTILE_SITE_KEY` is set.",
	},
	NODE_ENV: {
		secret: false,
		required: true,
		purpose: "Standard Node.js environment indicator. Set to `production` in prod.",
	},
	APP_VERSION: {
		secret: false,
		required: false,
		purpose: "App version string. Injected at build time from `package.json`.",
	},
	NEXT_PUBLIC_APP_URL: {
		secret: false,
		required: true,
		purpose: "Public base URL of the application. Exposed to client-side code via Next.js.",
	},
	SMTP_HOST: {
		secret: false,
		required: false,
		purpose: "Email courier SMTP host. Set via Kratos config, not directly in app env.",
	},
	SMTP_PASSWORD: {
		secret: true,
		required: false,
		purpose: "Email provider SMTP password / API key. Stored in GitHub Secrets; injected at deploy time.",
	},
};

const vars = Object.keys(byVar).sort();

function slugify(s) {
	return s.toLowerCase().replace(/_/g, "-");
}

// Per-var pages
for (const v of vars) {
	const repos = [...byVar[v]].sort();
	const overlay = OVERLAY[v] || {};

	let body = `---\ntitle: ${JSON.stringify(v)}\ndescription: ${JSON.stringify(overlay.purpose || `Environment variable used by: ${repos.join(", ")}`)}\n---\n\n# \`${v}\`\n\n`;
	body += `**Read by:** ${repos.map((r) => `\`${r}\``).join(", ")}\n\n`;
	body += `**Sensitive:** ${overlay.secret ? "**Yes** — treat as a secret. Store in GitHub Secrets / your vault." : "No — safe to log / share."}\n\n`;
	body += `**Required:** ${overlay.required ? "yes" : overlay.required === false ? "no" : "unspecified"}\n\n`;

	if (overlay.purpose) {
		body += `## Purpose\n\n${overlay.purpose}\n\n`;
	}

	if (overlay.generation) {
		body += `## Generation\n\nGenerate a fresh value:\n\n\`\`\`bash\n${overlay.generation}\n\`\`\`\n\n`;
	}

	if (overlay.blocklist) {
		body += `## Blocklist\n\nThe SDK refuses to start if this value is on the [encryption-key blocklist](/docs/security/encryption-key-blocklist) — known-weak / known-public values.\n\n`;
	}

	if (overlay.rotation) {
		body += `## Rotation\n\nSee the rotation runbook: [${overlay.rotation}](${overlay.rotation}).\n\n`;
	}

	body += `## Where it's read\n\n${repos.map((r) => `- **${r}** — \`grep -r "${v}" ../${r}/src\` for code locations`).join("\n")}\n\n`;

	body += `## Setting it\n\n### Dev\n\nSet in your local \`.env.dev\` file (managed by \`octl deploy\`).\n\n### Prod\n\n\`\`\`bash\ngh secret set ${v} --body "<value>" -R OlympusOSS/platform\ngh workflow run deploy.yml\n\`\`\`\n\n`;

	body += `\n---\n\n*Generated from source by \`scripts/gen/env-vars-per-var.mjs\`.*\n`;
	writeFileSync(join(OUT_DIR, `${slugify(v)}.mdx`), body);
}

// Overview
let overview = `---\ntitle: Environment variables\ndescription: ${JSON.stringify(`${vars.length} environment variables referenced across Olympus`)}\n---\n\nThis section lists every environment variable read by any Olympus service. Each variable has its own page with purpose, sensitivity, and rotation guidance.\n\n## Catalog\n\n| Variable | athena | hera | sdk | site | octl | daedalus | Secret |\n|----------|:------:|:----:|:---:|:----:|:----:|:--------:|:------:|\n`;
for (const v of vars) {
	const s = byVar[v];
	const isSecret = OVERLAY[v]?.secret ? "yes" : "—";
	overview += `| [\`${v}\`](./${slugify(v)}) | ${s.has("athena") ? "✓" : ""} | ${s.has("hera") ? "✓" : ""} | ${s.has("sdk") ? "✓" : ""} | ${s.has("site") ? "✓" : ""} | ${s.has("octl") ? "✓" : ""} | ${s.has("daedalus") ? "✓" : ""} | ${isSecret} |\n`;
}
overview += `\n## Total: ${vars.length} variables.\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify({ title: "Environment variables", pages: ["overview", ...vars.map(slugify).sort()] }, null, 2),
);

console.log(`Generated ${vars.length + 1} env-var pages in ${OUT_DIR}`);
