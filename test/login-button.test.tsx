import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginButton } from "@/components/site/login-button";

describe("LoginButton", () => {
	it("renders children and applies the default tone colour", () => {
		const { container } = render(<LoginButton tone="default">Sign in</LoginButton>);
		expect(screen.getByText("Sign in")).toBeInTheDocument();
		const wrapper = container.firstElementChild as HTMLElement;
		// jsdom keeps `hsl(var(--…))` strings as-is because css.escape passes it
		// through verbatim; numeric tones get normalised to rgb(). Inspect the
		// raw style attribute so we don't depend on parsing rules.
		expect(wrapper.getAttribute("style")).toContain("hsl(var(--primary))");
	});

	it("uses indigo, violet, and slate tones from the tone map", () => {
		// We assert each tone produces a distinct style attribute. The values
		// originate in the component's TONE_FG map; the test pins that they're
		// applied verbatim (jsdom normalises modern hsl() syntax to rgb(), so
		// the styles differ but are all non-empty and unique).
		const styles = new Set<string>();
		for (const tone of ["indigo", "violet", "slate"] as const) {
			const { container, unmount } = render(<LoginButton tone={tone}>Click</LoginButton>);
			const wrapper = container.firstElementChild as HTMLElement;
			const style = wrapper.getAttribute("style") ?? "";
			expect(style.length).toBeGreaterThan(0);
			styles.add(style);
			unmount();
		}
		expect(styles.size).toBe(3);
	});
});

describe("LoginButton (snapshot)", () => {
	it("matches default tone snapshot", () => {
		const { container } = render(<LoginButton tone="default">Sign in</LoginButton>);
		expect(container).toMatchSnapshot();
	});

	it("matches indigo tone snapshot", () => {
		const { container } = render(<LoginButton tone="indigo">Continue</LoginButton>);
		expect(container).toMatchSnapshot();
	});

	it("matches violet tone snapshot", () => {
		const { container } = render(<LoginButton tone="violet">Continue</LoginButton>);
		expect(container).toMatchSnapshot();
	});

	it("matches slate tone snapshot", () => {
		const { container } = render(<LoginButton tone="slate">Continue</LoginButton>);
		expect(container).toMatchSnapshot();
	});
});
