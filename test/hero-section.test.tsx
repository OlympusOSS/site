import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@olympusoss/canvas", async () => {
	const actual = await vi.importActual<Record<string, unknown>>("@olympusoss/canvas");
	return {
		...actual,
		Terminal: ({ children, title }: { children: React.ReactNode; title: string }) => (
			<div data-testid="terminal" data-title={title}>
				{children}
			</div>
		),
	};
});

import { HeroSection } from "@/components/site/hero-section";

describe("HeroSection", () => {
	it("renders the canvas-version badge label when a version is supplied", () => {
		render(<HeroSection canvasVersion="2.10.0" />);
		expect(screen.getByText(/v2\.10\.0 · canvas design system/i)).toBeInTheDocument();
		expect(screen.getByText(/identity and oauth2, on your terms/i)).toBeInTheDocument();
		expect(screen.getByText("Open the playground")).toBeInTheDocument();
		expect(screen.getByText("Read the docs")).toBeInTheDocument();
	});

	it("falls back to the plain badge label when no version is provided", () => {
		render(<HeroSection />);
		// Match the badge text exactly to verify the fallback branch.
		expect(screen.getByText(/^canvas design system$/i)).toBeInTheDocument();
	});

	it("renders the terminal block via the canvas Terminal stub", () => {
		render(<HeroSection canvasVersion="2.0.0" />);
		const term = screen.getByTestId("terminal");
		expect(term).toHaveAttribute("data-title", "~/Olympus · octl");
		expect(term.textContent).toContain("octl");
	});
});

describe("HeroSection (snapshot)", () => {
	it("matches snapshot with canvasVersion provided", () => {
		const { container } = render(<HeroSection canvasVersion="2.10.0" />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot without canvasVersion", () => {
		const { container } = render(<HeroSection />);
		expect(container).toMatchSnapshot();
	});
});
