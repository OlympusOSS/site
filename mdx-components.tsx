import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Mermaid } from "@/components/site/mermaid";

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		Mermaid,
		...components,
	};
}
