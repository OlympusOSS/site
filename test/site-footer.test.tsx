import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
	default: (props: Record<string, unknown>) => {
		// Forward the props onto a plain <img> so the test can assert on src.
		// biome-ignore lint/a11y/useAltText: shim mirrors the next/image API.
		// biome-ignore lint/performance/noImgElement: test shim — we don't want next/image optimisation here.
		return <img {...(props as Record<string, string>)} />;
	},
}));

import { SiteFooter } from "@/components/site/site-footer";

describe("SiteFooter", () => {
	it("renders all link columns and the current year in the copyright string", () => {
		render(<SiteFooter />);
		const year = new Date().getFullYear();
		expect(screen.getByText(new RegExp(`© ${year} olympus`, "i"))).toBeInTheDocument();
		// One link per column should appear.
		expect(screen.getByRole("link", { name: /hera \(auth ui\)/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /getting started/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /^github$/i })).toBeInTheDocument();
	});

	it("renders an image when a logoSrc is supplied", () => {
		const { container } = render(<SiteFooter logoSrc="/logo.svg" />);
		const img = container.querySelector('img[alt="Olympus"]');
		expect(img).not.toBeNull();
		expect(img).toHaveAttribute("src", "/logo.svg");
	});
});

describe("SiteFooter (snapshot)", () => {
	it("matches snapshot without logoSrc", () => {
		const { container } = render(<SiteFooter />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with logoSrc", () => {
		const { container } = render(<SiteFooter logoSrc="/logo.svg" />);
		expect(container).toMatchSnapshot();
	});
});
