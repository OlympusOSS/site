import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { remarkMermaid } from "./lib/remark-mermaid.mjs";

export const { docs, meta } = defineDocs({
	dir: "content/docs",
});

export default defineConfig({
	mdxOptions: {
		remarkPlugins: [remarkMermaid],
		rehypeCodeOptions: {
			// Default theme set required by fumadocs's typings since v14.x.
			themes: {
				light: "github-light",
				dark: "github-dark",
			},
			// Shiki doesn't bundle a `caddy` (or `caddyfile`) grammar, fall back to
			// plaintext instead of throwing `ShikiError: Language X not found`,
			// which otherwise breaks the docs route compile and pushes the dev
			// server toward OOM.
			fallbackLanguage: "plaintext",
		},
	},
});
