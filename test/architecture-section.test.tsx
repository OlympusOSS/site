import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArchitectureSection } from "@/components/site/architecture-section";

describe("ArchitectureSection", () => {
	it("renders the headline and both CIAM and IAM domains", () => {
		render(<ArchitectureSection />);
		expect(screen.getByText(/dual-domain architecture/i)).toBeInTheDocument();
		expect(screen.getByText("CIAM")).toBeInTheDocument();
		expect(screen.getByText("IAM")).toBeInTheDocument();
		// Each domain renders the four Ory services. They appear twice each
		// (once per domain) so use getAllByText.
		expect(screen.getAllByText("Hera").length).toBeGreaterThanOrEqual(2);
		expect(screen.getAllByText("Athena").length).toBeGreaterThanOrEqual(2);
		expect(screen.getAllByText("Hydra").length).toBeGreaterThanOrEqual(2);
		expect(screen.getAllByText("Kratos").length).toBeGreaterThanOrEqual(2);
		// Platform badges render under Hera (3) + Athena (1) per domain × 2 = 8 entries.
		expect(screen.getAllByText("iOS").length).toBe(2);
		expect(screen.getAllByText("Android").length).toBe(2);
		expect(screen.getAllByText("Web").length).toBe(4);
		// Shared bar shows PostgreSQL and pgAdmin.
		expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
		expect(screen.getByText("pgAdmin")).toBeInTheDocument();
		// Flow description footer.
		expect(screen.getByText(/oauth2 flow/i)).toBeInTheDocument();
	});
});

describe("ArchitectureSection (snapshot)", () => {
	it("matches default snapshot", () => {
		const { container } = render(<ArchitectureSection />);
		expect(container).toMatchSnapshot();
	});
});
