#!/usr/bin/env bun
/**
 * Per-port reference pages.
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "content/docs/reference/ports-detail";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const PORTS = [
	{ port: 80, service: "Caddy", role: "HTTP ingress", scope: "internet", purpose: "Redirects to HTTPS (port 443)." },
	{
		port: 443,
		service: "Caddy",
		role: "HTTPS ingress",
		scope: "internet",
		purpose: "TLS termination. The only port your users hit. Caddy reverse-proxies to internal services based on host header.",
	},
	{
		port: 2000,
		service: "Site",
		role: "Brochure, playground, docs",
		scope: "intranet via Caddy",
		purpose: "Dev: directly accessible at localhost:2000. Prod: behind Caddy as the apex domain.",
	},
	{
		port: 3000,
		service: "Hera CIAM",
		role: "Login UI",
		scope: "intranet only",
		purpose: "Customer-facing login pages. Must NOT be exposed to host interface in prod.",
	},
	{
		port: 3001,
		service: "Athena CIAM",
		role: "Admin dashboard",
		scope: "intranet via Caddy",
		purpose: "Manages CIAM identities. Accessed via Caddy proxy.",
	},
	{
		port: 3100,
		service: "Kratos CIAM (public)",
		role: "Self-service API",
		scope: "host-bound (firewall to localhost in prod)",
		purpose: "Browser-facing self-service flows. Restrict in prod firewall.",
	},
	{
		port: 3101,
		service: "Kratos CIAM (admin)",
		role: "Admin API",
		scope: "host-bound (firewall to localhost)",
		purpose: "Identity CRUD. MUST be firewalled from the internet.",
	},
	{
		port: 3102,
		service: "Hydra CIAM (public)",
		role: "OAuth2 endpoint",
		scope: "host-bound (Caddy proxies)",
		purpose: "/oauth2/auth, /oauth2/token, /.well-known/openid-configuration.",
	},
	{
		port: 3103,
		service: "Hydra CIAM (admin)",
		role: "OAuth2 admin",
		scope: "host-bound (firewall to localhost)",
		purpose: "OAuth2 client management, introspect. MUST be firewalled.",
	},
	{
		port: 4000,
		service: "Hera IAM",
		role: "Employee login UI",
		scope: "intranet only",
		purpose: "Internal employee login. Same constraints as Hera CIAM.",
	},
	{
		port: 4001,
		service: "Athena IAM",
		role: "Admin dashboard",
		scope: "intranet via Caddy",
		purpose: "Employee admin. Default operator entry point.",
	},
	{ port: 4100, service: "Kratos IAM (public)", role: "Self-service API", scope: "host-bound", purpose: "Employee self-service flows." },
	{ port: 4101, service: "Kratos IAM (admin)", role: "Admin API", scope: "host-bound (firewall to localhost)", purpose: "Employee identity CRUD." },
	{ port: 4102, service: "Hydra IAM (public)", role: "OAuth2 endpoint", scope: "host-bound", purpose: "Employee-facing OAuth2." },
	{
		port: 4103,
		service: "Hydra IAM (admin)",
		role: "OAuth2 admin",
		scope: "host-bound (firewall to localhost)",
		purpose: "Employee OAuth2 client management.",
	},
	{
		port: 5432,
		service: "PostgreSQL",
		role: "Database",
		scope: "host-bound (firewall mandatory)",
		purpose: "Five Olympus databases. MUST be firewalled from internet. In prod, prefer managed Postgres.",
	},
	{
		port: 5433,
		service: "pgAdmin",
		role: "DB admin UI",
		scope: "intranet via Caddy + OIDC SSO",
		purpose: "DB admin tool. Authenticates via IAM Hydra OIDC.",
	},
	{
		port: 5434,
		service: "MailSlurper",
		role: "Email capture (dev only)",
		scope: "dev only",
		purpose: "Captures outbound email in dev. Not in prod.",
	},
];

for (const p of PORTS) {
	const body = `---\ntitle: ${JSON.stringify(`Port ${p.port}`)}\ndescription: ${JSON.stringify(`${p.service} — ${p.role}`)}\n---\n\n# Port \`${p.port}\` — ${p.service}\n\n**Role:** ${p.role}\n\n**Exposure:** ${p.scope}\n\n## Purpose\n\n${p.purpose}\n\n## Security\n\n${p.scope.includes("firewall") ? "**This port must be blocked at the host firewall** from the internet. Only Caddy (ports 80/443) is publicly reachable." : p.scope === "intranet only" ? "Internal-only. No host binding in prod." : "Public exposure is expected, but defense-in-depth via Caddy."}\n\n## Verify exposure\n\n\`\`\`bash\n# From outside the VPS\nnmap -p ${p.port} <vps-ip>\n${p.scope.includes("firewall") ? `# Expected: filtered / closed` : `# Expected: ${p.port === 80 || p.port === 443 ? "open" : "depends on your firewall config"}`}\n\`\`\`\n\n## Related\n\n- [Operate — Network topology](/docs/operate/network-topology)\n- [Reference — Ports](/docs/reference/ports)\n`;
	writeFileSync(join(OUT_DIR, `${p.port}.mdx`), body);
}

let overview = `---\ntitle: Per-port reference\ndescription: ${JSON.stringify("Every port across the Olympus Compose stack")}\n---\n\nOlympus binds 18 ports in the dev stack. Each has its own page with role and exposure recommendation.\n\n## All ports\n\n| Port | Service | Scope |\n|------|---------|-------|\n`;
for (const p of PORTS.sort((a, b) => a.port - b.port)) {
	overview += `| [\`${p.port}\`](./${p.port}) | ${p.service} | ${p.scope} |\n`;
}
overview += `\nSee [Operate — Network topology](/docs/operate/network-topology) for the canonical reference.\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify({ title: "Ports", pages: ["overview", ...PORTS.sort((a, b) => a.port - b.port).map((p) => String(p.port))] }, null, 2),
);

console.log(`Generated ${PORTS.length + 1} per-port pages in ${OUT_DIR}`);
