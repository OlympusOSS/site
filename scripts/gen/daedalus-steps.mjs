#!/usr/bin/env bun
/**
 * Per-Daedalus-wizard-step pages — one per the 13 wizard steps.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "content/docs/deploy/wizard-steps";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const STEPS = [
	{ n: 1, slug: "repository", title: "Repository", purpose: "Fork OlympusOSS/platform and clone locally.", inputs: ["GitHub PAT with `repo` + `workflow` scopes"], outputs: ["Local clone at ~/code/<your-org>-platform/", "Recorded fork URL in daedalus.json"] },
	{ n: 2, slug: "domain", title: "Domain", purpose: "Configure apex + 3 subdomains (CIAM, IAM, Site).", inputs: ["Apex domain", "Subdomain names (defaults: ciam, iam, www)"], outputs: ["Edited prod kratos.yml, hydra.yml, Caddyfile with chosen domains"] },
	{ n: 3, slug: "provider", title: "Provider", purpose: "Choose VPS provider.", inputs: ["Provider (DigitalOcean / Hostinger / Direct SSH)", "Provider API token"], outputs: ["Recorded provider config"] },
	{ n: 4, slug: "email", title: "Email", purpose: "Configure outbound email for verification/recovery.", inputs: ["Provider (Resend / Postmark / Brevo / SMTP2GO / AWS SES / Custom SMTP)", "API key or SMTP credentials", "Sender address"], outputs: ["SMTP settings in both Kratos configs"] },
	{ n: 5, slug: "database", title: "Database", purpose: "Provision Postgres.", inputs: ["Managed (Neon API key) or self-hosted toggle"], outputs: ["5 DATABASE_URLs generated for the Olympus databases"] },
	{ n: 6, slug: "compute", title: "Compute", purpose: "Create the VPS.", inputs: ["Plan/size", "Region"], outputs: ["VPS provisioned, firewall set, SSH key uploaded"] },
	{ n: 7, slug: "secrets", title: "Secrets", purpose: "Generate cryptographic secrets.", inputs: ["None — auto-generated"], outputs: ["10+ secrets generated, stored locally and pushed to GitHub Actions Secrets"] },
	{ n: 8, slug: "oauth", title: "OAuth", purpose: "Register OAuth2 clients in Hydra.", inputs: ["None — auto-generated"], outputs: ["OAuth2 clients registered post-deploy via Hydra admin API"] },
	{ n: 9, slug: "deploy", title: "Deploy", purpose: "First production deploy.", inputs: ["None — runs based on prior steps"], outputs: ["GitHub Actions workflow triggered; containers running on VPS"] },
	{ n: 10, slug: "health", title: "Health", purpose: "Verify every service is responsive.", inputs: ["None"], outputs: ["Pass/fail per service health endpoint"] },
	{ n: 11, slug: "accounts", title: "Accounts", purpose: "Seed the first IAM admin.", inputs: ["Admin email", "Admin password"], outputs: ["IAM admin identity created in Kratos"] },
	{ n: 12, slug: "applications", title: "Applications", purpose: "Register Athena, Hera, Site as managed apps.", inputs: ["None — Daedalus knows"], outputs: ["Stamped into Athena's apps settings"] },
	{ n: 13, slug: "destroy", title: "Destroy", purpose: "Full teardown (one-way).", inputs: ["Confirmation"], outputs: ["VPS deleted, DNS removed, Postgres dropped (managed), local context wiped"] },
];

for (const s of STEPS) {
	let body = `---\ntitle: ${JSON.stringify(`${s.n}. ${s.title}`)}\ndescription: ${JSON.stringify(s.purpose)}\n---\n\n# Wizard step ${s.n}: ${s.title}\n\n**Purpose:** ${s.purpose}\n\n## Inputs\n\n${s.inputs.map(i => `- ${i}`).join("\n")}\n\n## Outputs\n\n${s.outputs.map(o => `- ${o}`).join("\n")}\n\n## What it does internally\n\nDaedalus reads its current context from \`daedalus.json\`, performs the action, then updates the context with the results. If the action fails (network error, API rejection), the operator stays on this step and can retry.\n\nFor agent-driven flows, Claude can call \`navigate({path: "/${s.slug}"})\`, then \`form_input\` / \`click\` to drive this step.\n\n## Related\n\n- [Deploy — With Daedalus wizard](/docs/deploy/with-daedalus-wizard) — full overview.\n- [Internals — Daedalus wizard state machine](/docs/internals/daedalus-wizard-state-machine)\n${s.n > 1 ? `- [← Step ${s.n - 1}](./${STEPS[s.n - 2].slug})\n` : ""}${s.n < STEPS.length ? `- [Step ${s.n + 1} →](./${STEPS[s.n].slug})\n` : ""}`;
	writeFileSync(join(OUT_DIR, `${s.slug}.mdx`), body);
}

let overview = `---\ntitle: Wizard steps\ndescription: ${JSON.stringify("All 13 Daedalus wizard steps")}\n---\n\nDaedalus walks operators through 13 ordered steps. Each has its own page.\n\n| # | Step | Purpose |\n|---|------|---------|\n`;
for (const s of STEPS) {
	overview += `| ${s.n} | [${s.title}](./${s.slug}) | ${s.purpose} |\n`;
}
overview += `\nSee [Deploy — With Daedalus wizard](/docs/deploy/with-daedalus-wizard) for the consolidated overview.\n`;
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(
	join(OUT_DIR, "meta.json"),
	JSON.stringify({ title: "Wizard steps", pages: ["overview", ...STEPS.map(s => s.slug)] }, null, 2),
);

console.log(`Generated ${STEPS.length + 1} Daedalus wizard step pages in ${OUT_DIR}`);
