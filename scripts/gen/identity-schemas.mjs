#!/usr/bin/env bun
/**
 * Generate identity schema reference pages from the JSON Schema files.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";

const OUT_DIR = "content/docs/reference/schemas";
const SCHEMAS = [
	{ slug: "ciam-default", path: "../platform/dev/ciam-kratos/identity.schema.json", title: "CIAM Default Identity Schema" },
	{ slug: "ciam-customer", path: "../platform/dev/ciam-kratos/customer.schema.json", title: "CIAM Customer Identity Schema" },
	{ slug: "ciam-company", path: "../platform/dev/ciam-kratos/company-identity.schema.json", title: "CIAM Company Identity Schema" },
	{ slug: "iam-admin", path: "../platform/dev/iam-kratos/admin-identity.schema.json", title: "IAM Admin Identity Schema" },
];

mkdirSync(OUT_DIR, { recursive: true });

function walkSchema(node, path = "") {
	const rows = [];
	if (!node) return rows;

	if (node.properties) {
		for (const [key, val] of Object.entries(node.properties)) {
			const full = path ? `${path}.${key}` : key;
			const required = (node.required || []).includes(key);
			const type = val.type || (val.$ref ? "ref" : "any");
			const format = val.format || "";
			const description = (val.description || val.title || "").replace(/\|/g, "\\|");
			const credentialBindings = [];
			const oryExt = val["ory.sh/kratos"];
			if (oryExt?.credentials) {
				if (oryExt.credentials.password?.identifier) credentialBindings.push("password identifier");
				if (oryExt.credentials.webauthn?.identifier) credentialBindings.push("webauthn identifier");
				if (oryExt.credentials.totp?.account_name) credentialBindings.push("totp account_name");
			}
			if (oryExt?.verification?.via) credentialBindings.push(`verifiable (${oryExt.verification.via})`);
			if (oryExt?.recovery?.via) credentialBindings.push(`recovery (${oryExt.recovery.via})`);

			rows.push({
				path: full,
				type,
				format,
				required,
				description,
				oryBindings: credentialBindings.join(", "),
			});

			if (val.type === "object" && val.properties) {
				rows.push(...walkSchema(val, full));
			}
		}
	}
	return rows;
}

let generated = 0;
for (const s of SCHEMAS) {
	let schema;
	try {
		schema = JSON.parse(readFileSync(resolve(s.path), "utf-8"));
	} catch (e) {
		console.warn(`Skipping ${s.slug}: ${e.message}`);
		continue;
	}

	const id = schema["$id"] || s.slug;
	const title = schema.title || s.title;
	const rows = walkSchema(schema);

	let body = `---\ntitle: ${s.title}\ndescription: JSON Schema reference for the ${title} identity model\n---\n\n`;
	body += `**Source:** \`${s.path.replace("../", "")}\`\n\n`;
	body += `**Schema \`$id\`:** \`${id}\`\n\n`;
	if (schema.description) body += `${schema.description}\n\n`;

	body += `## Fields\n\n`;
	if (rows.length === 0) {
		body += `*This schema has no leaf properties (or uses an unsupported pattern).*\n\n`;
	} else {
		body += `| Field | Type | Format | Required | Ory bindings | Description |\n`;
		body += `|-------|------|--------|----------|--------------|-------------|\n`;
		for (const r of rows) {
			body += `| \`${r.path}\` | ${r.type} | ${r.format || "—"} | ${r.required ? "yes" : "no"} | ${r.oryBindings || "—"} | ${r.description || "—"} |\n`;
		}
	}

	body += `\n## Raw schema\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n`;
	body += `\n---\n\n*Generated from \`${s.path}\` at build time.*\n`;
	writeFileSync(join(OUT_DIR, `${s.slug}.mdx`), body);
	generated++;
}

// Index page
let overview = `---\ntitle: Identity Schemas\ndescription: All Kratos identity schemas in use across Olympus\n---\n\nOlympus runs four distinct identity schemas — three in the CIAM domain and one in the IAM domain.\n\n| Slug | Domain | Title |\n|------|--------|-------|\n`;
for (const s of SCHEMAS) {
	overview += `| [${s.slug}](./${s.slug}) | ${s.slug.startsWith("ciam") ? "CIAM" : "IAM"} | ${s.title} |\n`;
}
writeFileSync(join(OUT_DIR, "identity-schemas.mdx"), overview);

console.log(`Generated ${generated} identity schema pages in ${OUT_DIR}`);
