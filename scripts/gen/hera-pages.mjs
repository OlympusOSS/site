#!/usr/bin/env bun
/**
 * Per-Hera-page reference. Walks hera/src/app and emits one page per route.
 */

import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const HERA_APP = "../hera/src/app";
const OUT_DIR = "content/docs/reference/api/hera";

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

function findPages(dir, base = "") {
	const out = [];
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return out;
	}
	for (const e of entries) {
		const p = join(dir, e);
		const st = statSync(p);
		if (st.isDirectory()) {
			out.push(...findPages(p, `${base}/${e}`));
		} else if (e === "page.tsx") {
			out.push({ urlPath: base || "/", file: p });
		}
	}
	return out;
}

const pageDescriptions = {
	"/": "Site root — typically redirects to /login or shows a landing.",
	"/login": "Renders the Kratos login flow + Hydra login challenge handler.",
	"/registration": "Renders the Kratos registration flow.",
	"/recovery": "Renders the Kratos recovery (password-reset) flow.",
	"/verification": "Renders the Kratos verification (email-confirm) flow.",
	"/settings": "User settings — password, MFA, profile, social IdP linking.",
	"/consent": "Renders or auto-grants the Hydra OAuth2 consent challenge.",
	"/logout": "Renders or auto-confirms the Hydra logout challenge.",
	"/oidc-callback": "Return point from an upstream OIDC provider (Google, GitHub, etc.).",
	"/account-linking": "Confirmation screen when linking a social IdP to an existing password identity.",
	"/error": "Generic error display for Kratos/Hydra failures.",
};

const pages = findPages(resolve(HERA_APP));

function slugify(p) {
	return (
		p
			.replace(/^\//, "")
			.replace(/\//g, "-")
			.replace(/[^a-z0-9-]/g, "") || "root"
	);
}

for (const pg of pages) {
	const slug = slugify(pg.urlPath);
	const desc = pageDescriptions[pg.urlPath] || `Hera page at ${pg.urlPath}`;
	const body = `---\ntitle: ${JSON.stringify(pg.urlPath)}\ndescription: ${JSON.stringify(desc)}\n---\n\n# Hera page \`${pg.urlPath}\`\n\n${desc}\n\n**Source:** [\`hera/src/app${pg.urlPath}/page.tsx\`](https://github.com/OlympusOSS/hera/blob/main/src/app${pg.urlPath}/page.tsx)\n\n## What it does\n\nHera pages render Kratos self-service flows or handle Hydra challenges. Most of the logic comes from upstream Kratos/Hydra; Hera is the thin presentation layer.\n\nThe pages typically:\n1. Read a flow ID or challenge from the URL.\n2. Fetch the current state from Kratos/Hydra.\n3. Render \`ui.nodes\` via Canvas's \`SchemaForm\` component.\n4. POST submission back to the Kratos/Hydra endpoint.\n\n## Olympus additions\n\nDepending on the flow, Hera also:\n- Validates Cloudflare Turnstile tokens server-side ([Security — Captcha](/docs/security/captcha-turnstile)).\n- Runs the HIBP breached-password check ([Security — Breached password](/docs/security/breached-password)).\n- Records login attempts in the SDK's brute-force tracker.\n- Emits audit events to stdout.\n\n## Related\n\n- [Internals — Hera route map](/docs/internals/hera-route-map)\n- [Internals — Hera Kratos integration](/docs/internals/hera-kratos-integration)\n- [Identity — Flow login](/docs/identity/flow-login)\n`;
	writeFileSync(join(OUT_DIR, `${slug}.mdx`), body);
}

let overview = `---\ntitle: Hera pages\ndescription: ${JSON.stringify(`${pages.length} Hera page routes`)}\n---\n\nHera (the login/consent UI) has ${pages.length} page routes. Each renders Kratos self-service flows or handles Hydra challenges.\n\n## Routes\n\n| Path | Description |\n|------|-------------|\n`;
for (const pg of pages) {
	overview += `| [\`${pg.urlPath}\`](./${slugify(pg.urlPath)}) | ${pageDescriptions[pg.urlPath] || "—"} |\n`;
}
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(join(OUT_DIR, "meta.json"), JSON.stringify({ title: "Hera", pages: ["overview", ...pages.map((p) => slugify(p.urlPath))] }, null, 2));

console.log(`Generated ${pages.length + 1} Hera page references in ${OUT_DIR}`);
