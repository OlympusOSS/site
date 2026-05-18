import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Hoist the mutable theme state + setter spy so each test can drive useTheme.
const { themeState } = vi.hoisted(() => ({
	themeState: {
		resolvedTheme: "light" as "light" | "dark" | undefined,
		setTheme: vi.fn(),
	},
}));

vi.mock("next-themes", () => ({
	useTheme: () => themeState,
}));

import { ThemeToggle } from "@/components/site/theme-toggle";

describe("ThemeToggle", () => {
	it("renders the dimension-reserving placeholder before mount, then the toggle button", () => {
		// Pre-mount, the hook returns the placeholder; after the effect runs the
		// real toggle replaces it. React Testing Library flushes effects on render
		// so we should see the rendered button.
		themeState.resolvedTheme = "light";
		themeState.setTheme.mockClear();
		render(<ThemeToggle />);
		const button = screen.getByRole("button", { name: /switch to dark theme/i });
		expect(button).toBeInTheDocument();
	});

	it("toggles from light → dark", () => {
		themeState.resolvedTheme = "light";
		themeState.setTheme.mockClear();
		render(<ThemeToggle />);
		fireEvent.click(screen.getByRole("button", { name: /switch to dark theme/i }));
		expect(themeState.setTheme).toHaveBeenCalledWith("dark");
	});

	it("toggles from dark → light", () => {
		themeState.resolvedTheme = "dark";
		themeState.setTheme.mockClear();
		render(<ThemeToggle />);
		fireEvent.click(screen.getByRole("button", { name: /switch to light theme/i }));
		expect(themeState.setTheme).toHaveBeenCalledWith("light");
	});
});

describe("ThemeToggle (snapshot)", () => {
	it("matches snapshot in light mode", () => {
		themeState.resolvedTheme = "light";
		themeState.setTheme.mockClear();
		const { container } = render(<ThemeToggle />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot in dark mode", () => {
		themeState.resolvedTheme = "dark";
		themeState.setTheme.mockClear();
		const { container } = render(<ThemeToggle />);
		expect(container).toMatchSnapshot();
	});
});
