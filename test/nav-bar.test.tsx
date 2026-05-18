import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
	default: (props: Record<string, unknown>) => (
		// biome-ignore lint/a11y/useAltText: shim mirrors the next/image API.
		// biome-ignore lint/performance/noImgElement: test shim — we don't want next/image optimisation here.
		<img {...(props as Record<string, string>)} />
	),
}));

vi.mock("next/link", () => ({
	default: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & Record<string, unknown>) => (
		<a href={href} {...(rest as Record<string, string>)}>
			{children}
		</a>
	),
}));

// next-themes is only used transitively via ThemeToggle.
const { themeState } = vi.hoisted(() => ({
	themeState: { resolvedTheme: "light" as "light" | "dark", setTheme: vi.fn() },
}));
vi.mock("next-themes", () => ({ useTheme: () => themeState }));

import { NavBar } from "@/components/site/nav-bar";

describe("NavBar", () => {
	it("renders the canvas Logo branch when no logoSrc is provided", () => {
		const { container } = render(<NavBar />);
		expect(screen.getAllByText("Olympus").length).toBeGreaterThanOrEqual(1);
		// No <img> should be present in the logo branch when logoSrc is absent.
		expect(container.querySelector("img")).toBeNull();
	});

	it("renders the Image branch when logoSrc is supplied", () => {
		const { container } = render(<NavBar logoSrc="/logo.png" />);
		const img = container.querySelector("img");
		expect(img).not.toBeNull();
		expect(img).toHaveAttribute("src", "/logo.png");
	});

	it("renders the GitHub link", () => {
		render(<NavBar />);
		const githubLink = screen.getByRole("link", { name: /github/i });
		expect(githubLink).toHaveAttribute("href", "https://github.com/orgs/OlympusOSS/repositories");
		expect(githubLink).toHaveAttribute("target", "_blank");
	});
});

describe("NavBar (snapshot)", () => {
	it("matches snapshot without logoSrc", () => {
		const { container } = render(<NavBar />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with logoSrc", () => {
		const { container } = render(<NavBar logoSrc="/logo.png" />);
		expect(container).toMatchSnapshot();
	});
});
