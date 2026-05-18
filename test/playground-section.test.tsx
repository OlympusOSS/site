import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlaygroundSection } from "@/components/site/playground-section";

describe("PlaygroundSection", () => {
	it("renders the headline, try-it-out badge, and children", () => {
		render(
			<PlaygroundSection>
				<div data-testid="playground-children">inner</div>
			</PlaygroundSection>,
		);
		expect(screen.getByText(/live olympus, two domains/i)).toBeInTheDocument();
		expect(screen.getByText(/try it out/i)).toBeInTheDocument();
		expect(screen.getByTestId("playground-children")).toBeInTheDocument();
		expect(screen.getByText(/ory hydra/i)).toBeInTheDocument();
	});
});

describe("PlaygroundSection (snapshot)", () => {
	it("matches default snapshot", () => {
		const { container } = render(
			<PlaygroundSection>
				<div data-testid="playground-children">inner</div>
			</PlaygroundSection>,
		);
		expect(container).toMatchSnapshot();
	});
});
