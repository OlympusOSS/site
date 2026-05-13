import { visit } from "unist-util-visit";

export function remarkMermaid() {
	return (tree) => {
		visit(tree, "code", (node, index, parent) => {
			if (node.lang !== "mermaid" || !parent || typeof index !== "number") return;
			parent.children[index] = {
				type: "mdxJsxFlowElement",
				name: "Mermaid",
				attributes: [
					{
						type: "mdxJsxAttribute",
						name: "chart",
						value: node.value,
					},
				],
				children: [],
			};
		});
	};
}
