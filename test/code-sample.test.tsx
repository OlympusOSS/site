import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Canvas's CodeBlock relies on syntax-highlighting libs that aren't worth booting
// in jsdom; replace it with a plain <pre> that surfaces the code prop.
vi.mock("@olympusoss/canvas", async () => {
	const actual = await vi.importActual<Record<string, unknown>>("@olympusoss/canvas");
	return {
		...actual,
		CodeBlock: ({ code, language }: { code: string; language?: string }) => (
			<pre data-testid="code-block" data-language={language}>
				{code}
			</pre>
		),
	};
});

import { CodeSample } from "@/components/site/code-sample";

describe("CodeSample", () => {
	it("renders the SDK headline and the embedded code sample", () => {
		render(<CodeSample />);
		expect(screen.getByText(/three lines to your first session/i)).toBeInTheDocument();
		const block = screen.getByTestId("code-block");
		expect(block).toHaveAttribute("data-language", "app/auth.ts");
		expect(block.textContent).toContain("OlympusClient");
	});
});

describe("CodeSample (snapshot)", () => {
	it("matches default snapshot", () => {
		const { container } = render(<CodeSample />);
		expect(container).toMatchSnapshot();
	});
});
