import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import { remarkMermaid } from "./lib/remark-mermaid.mjs";

export const { docs, meta } = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMermaid],
    rehypeCodeOptions: {
      // Shiki doesn't bundle a `caddy` (or `caddyfile`) grammar — fall back to plain
      // text instead of throwing `ShikiError: Language X not found`, which otherwise
      // breaks the docs route compile and pushes the dev server toward OOM.
      fallbackLanguage: "text",
    },
  },
});
