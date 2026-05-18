import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

import { GettingStartedSection } from "@/components/site/getting-started-section";

describe("GettingStartedSection", () => {
	it("renders dev and prod column headings with all step numbers", () => {
		render(<GettingStartedSection />);
		expect(screen.getByText(/get started/i)).toBeInTheDocument();
		expect(screen.getByText("Development")).toBeInTheDocument();
		expect(screen.getByText("Production")).toBeInTheDocument();
		// "01", "02", "03" labels appear once per column → twice each.
		expect(screen.getAllByText("01").length).toBe(2);
		expect(screen.getAllByText("02").length).toBe(2);
		expect(screen.getAllByText("03").length).toBe(2);
		// Step titles from both columns.
		expect(screen.getByText("Clone the repos")).toBeInTheDocument();
		expect(screen.getByText("Launch Daedalus")).toBeInTheDocument();
		// CodeBlock stubs render the embedded code per step.
		expect(screen.getAllByTestId("code-block").length).toBe(6);
	});
});

describe("GettingStartedSection (snapshot)", () => {
	it("matches default snapshot", () => {
		const { container } = render(<GettingStartedSection />);
		expect(container).toMatchSnapshot();
	});
});
