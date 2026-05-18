#!/usr/bin/env bun
/**
 * Per-Caddy-directive reference pages for directives Olympus uses.
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "content/docs/reference/caddy-directives";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const DIRECTIVES = [
	{
		slug: "reverse-proxy",
		name: "reverse_proxy",
		purpose: "Proxy requests to upstream services.",
		olympusUse: "Routes ciam.YOUR-DOMAIN traffic to ciam-hera/athena/hydra. Routes iam.YOUR-DOMAIN to the IAM counterparts.",
	},
	{
		slug: "rate-limit",
		name: "rate_limit",
		purpose: "Per-IP request throttling. Requires the caddy-ratelimit module.",
		olympusUse: "Caps login/registration/recovery attempts. See [Security — Rate Limiting](/docs/security/rate-limiting).",
	},
	{
		slug: "tls",
		name: "tls",
		purpose: "TLS termination with automatic Let's Encrypt or DNS-01 ACME.",
		olympusUse: "All ingress is HTTPS. Cert auto-renewal handled by Caddy.",
	},
	{
		slug: "header",
		name: "header",
		purpose: "Set or remove HTTP headers on requests / responses.",
		olympusUse: "Sets HSTS, X-Frame-Options, CSP base, Referrer-Policy. See [Security — Security Headers](/docs/security/security-headers).",
	},
	{
		slug: "respond",
		name: "respond",
		purpose: "Return a static response without proxying.",
		olympusUse: "Returns 200 on /healthz; blocks specific paths early.",
	},
	{ slug: "redir", name: "redir", purpose: "HTTP redirect.", olympusUse: "Force HTTP → HTTPS upgrade. Some legacy path redirects." },
	{
		slug: "encode",
		name: "encode",
		purpose: "Response compression (gzip, zstd, br).",
		olympusUse: "Compresses responses by default for bandwidth savings.",
	},
	{ slug: "log", name: "log", purpose: "Access logging.", olympusUse: "JSON-formatted access log to stdout for log shipping." },
	{
		slug: "handle",
		name: "handle",
		purpose: "Route requests based on matcher; mutually exclusive in a host block.",
		olympusUse: "Per-path routing — `/.well-known/openid-configuration` → Hydra, `/login` → Hera, etc.",
	},
	{
		slug: "matcher",
		name: "@matcher",
		purpose: "Named request matcher referenced by handlers.",
		olympusUse: "Defines reusable matchers like `@login`, `@admin_api` for per-path policies.",
	},
];

for (const d of DIRECTIVES) {
	const body = `---\ntitle: ${JSON.stringify(d.name)}\ndescription: ${JSON.stringify(d.purpose)}\n---\n\n# Caddy directive: \`${d.name}\`\n\n**Purpose:** ${d.purpose}\n\n## Olympus usage\n\n${d.olympusUse}\n\n## Upstream documentation\n\nSee [Caddy directives reference](https://caddyserver.com/docs/caddyfile/directives/${d.slug.replace(/^@.*/, "matchers")}).\n\n## Related\n\n- [Reference — Caddyfile](/docs/reference/config/caddy/overview)\n- [Security — Caddy supply chain](/docs/security/caddy-supply-chain)\n`;
	writeFileSync(join(OUT_DIR, `${d.slug}.mdx`), body);
}

let overview = `---\ntitle: Caddy directives\ndescription: ${JSON.stringify("Caddy directives used in the Olympus Caddyfile")}\n---\n\nOlympus's Caddyfile uses these directives. Each has its own page with the Olympus-specific usage.\n\n| Directive | Purpose |\n|-----------|---------|\n`;
for (const d of DIRECTIVES) {
	overview += `| [\`${d.name}\`](./${d.slug}) | ${d.purpose} |\n`;
}
overview += `\nSee the [full Caddy directives reference](https://caddyserver.com/docs/caddyfile/directives) for everything Caddy can do.\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify({ title: "Caddy directives", pages: ["overview", ...DIRECTIVES.map((d) => d.slug)] }, null, 2),
);

console.log(`Generated ${DIRECTIVES.length + 1} Caddy directive pages in ${OUT_DIR}`);
