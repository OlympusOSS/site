import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeaturesSection } from "@/components/site/features-section";

describe("FeaturesSection", () => {
	it("renders the heading and all six feature cards", () => {
		render(<FeaturesSection />);
		expect(screen.getByText(/everything ory gives you/i)).toBeInTheDocument();
		for (const title of ["Kratos identity", "Hydra OAuth2", "Fine-grained scopes", "Brute-force protection", "JSON Schema profiles", "Observable"]) {
			expect(screen.getByText(title)).toBeInTheDocument();
		}
	});
});

describe("FeaturesSection (snapshot)", () => {
	it("matches default snapshot", () => {
		const { container } = render(<FeaturesSection />);
		expect(container).toMatchSnapshot();
	});
});
