#!/usr/bin/env bun
/**
 * Generate one MDX page per Compose service.
 *
 * Reads platform/dev/compose.dev.yml and platform/prod/compose.prod.yml and
 * emits a page per service with image, ports, env, volumes, depends_on, healthcheck.
 *
 * Also emits a "dev vs prod" diff page.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

const DEV_PATH = "../platform/dev/compose.dev.yml";
const PROD_PATH = "../platform/prod/compose.prod.yml";
const OUT_DIR = "content/docs/reference/config/compose";

const dev = parseYaml(readFileSync(resolve(DEV_PATH), "utf-8"));
const prod = parseYaml(readFileSync(resolve(PROD_PATH), "utf-8"));

function describeService(name, def, env) {
	let out = `\n### ${env}\n\n`;
	if (def.image) out += `**Image:** \`${def.image}\`\n\n`;
	if (def.build) out += `**Build:** \`${typeof def.build === "string" ? def.build : JSON.stringify(def.build)}\`\n\n`;
	if (def.command) out += `**Command:** \`${Array.isArray(def.command) ? def.command.join(" ") : def.command}\`\n\n`;

	if (def.ports?.length) {
		out += `**Ports:**\n`;
		for (const p of def.ports) {
			out += `- \`${typeof p === "string" ? p : JSON.stringify(p)}\`\n`;
		}
		out += "\n";
	} else {
		out += `**Ports:** none (internal only)\n\n`;
	}

	if (def.environment) {
		out += `**Environment variables:**\n\n`;
		out += `| Variable | Source |\n|----------|--------|\n`;
		const entries = Array.isArray(def.environment)
			? def.environment.map((e) => {
					const [k, v] = e.split("=");
					return [k, v];
				})
			: Object.entries(def.environment);
		for (const [k, v] of entries) {
			const display = v === undefined ? "(from host env)" : `\`${v}\``;
			out += `| \`${k}\` | ${display} |\n`;
		}
		out += "\n";
	}

	if (def.volumes?.length) {
		out += `**Volumes:**\n`;
		for (const v of def.volumes) {
			out += `- \`${typeof v === "string" ? v : JSON.stringify(v)}\`\n`;
		}
		out += "\n";
	}

	if (def.depends_on) {
		const deps = Array.isArray(def.depends_on) ? def.depends_on : Object.keys(def.depends_on);
		out += `**Depends on:** ${deps.map((d) => `\`${d}\``).join(", ")}\n\n`;
	}

	if (def.healthcheck) {
		out += `**Healthcheck:**\n\n\`\`\`yaml\n${JSON.stringify(def.healthcheck, null, 2)}\n\`\`\`\n\n`;
	}

	if (def.restart) out += `**Restart policy:** \`${def.restart}\`\n\n`;
	if (def.user) out += `**User:** \`${def.user}\`\n\n`;
	if (def.networks) {
		const nets = Array.isArray(def.networks) ? def.networks : Object.keys(def.networks);
		out += `**Networks:** ${nets.map((n) => `\`${n}\``).join(", ")}\n\n`;
	}
	if (def.profiles) {
		out += `**Profiles:** ${def.profiles.map((p) => `\`${p}\``).join(", ")}\n\n`;
	}

	return out;
}

const allServices = new Set([...Object.keys(dev.services || {}), ...Object.keys(prod.services || {})]);

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const sortedServices = [...allServices].sort();

for (const name of sortedServices) {
	const dDef = dev.services?.[name];
	const pDef = prod.services?.[name];

	let body = `---\ntitle: ${name}\ndescription: Compose service \`${name}\` — runtime configuration across dev and prod\n---\n\n`;
	body += `Compose service **\`${name}\`**.\n\n`;
	if (dDef && !pDef) body += `*Defined in **dev** only — not present in production.*\n\n`;
	if (pDef && !dDef) body += `*Defined in **prod** only — not present in dev.*\n\n`;

	if (dDef) body += describeService(name, dDef, "Dev (`compose.dev.yml`)");
	if (pDef) body += describeService(name, pDef, "Prod (`compose.prod.yml`)");

	body += `\n---\n\n*Generated from \`platform/dev/compose.dev.yml\` and \`platform/prod/compose.prod.yml\` at build time.*\n`;
	writeFileSync(join(OUT_DIR, `${name}.mdx`), body);
}

// Overview page
let overview = `---\ntitle: Compose Services\ndescription: Every Compose service across dev and prod\n---\n\nThe Olympus Compose stack defines services in two files: \`platform/dev/compose.dev.yml\` and \`platform/prod/compose.prod.yml\`. The two have different goals — dev mounts source for live reload; prod pulls pinned images.\n\n## Service inventory\n\n| Service | Dev | Prod |\n|---------|-----|------|\n`;
for (const name of sortedServices) {
	const inDev = dev.services?.[name] ? "✓" : "—";
	const inProd = prod.services?.[name] ? "✓" : "—";
	overview += `| [${name}](./${name}) | ${inDev} | ${inProd} |\n`;
}
writeFileSync(join(OUT_DIR, "overview.mdx"), overview);

writeFileSync(join(OUT_DIR, "meta.json"), JSON.stringify({ title: "Compose Services", pages: ["overview", ...sortedServices] }, null, 2));

console.log(`Generated ${sortedServices.length} compose service pages in ${OUT_DIR}`);
