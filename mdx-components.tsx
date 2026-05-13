import defaultMdxComponents from "fumadocs-ui/mdx";
import { Mermaid } from "@/components/site/mermaid";
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Mermaid,
    ...components,
  };
}
