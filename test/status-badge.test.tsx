import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "@/components/site/status-badge";

describe("StatusBadge", () => {
	it("renders the supplied label", () => {
		render(<StatusBadge label="Authenticated" bg="#22c55e" />);
		expect(screen.getByText("Authenticated")).toBeInTheDocument();
	});

	it("applies the supplied background colour as an inline style", () => {
		render(<StatusBadge label="Idle" bg="rgb(0, 0, 0)" />);
		const badge = screen.getByText("Idle");
		expect(badge).toHaveStyle({ background: "rgb(0, 0, 0)" });
	});
});

describe("StatusBadge (snapshot)", () => {
	it("matches authenticated snapshot", () => {
		const { container } = render(<StatusBadge label="Authenticated" bg="#22c55e" />);
		expect(container).toMatchSnapshot();
	});

	it("matches anonymous snapshot", () => {
		const { container } = render(<StatusBadge label="Anonymous" bg="#94a3b8" />);
		expect(container).toMatchSnapshot();
	});

	it("matches error snapshot", () => {
		const { container } = render(<StatusBadge label="Error" bg="#ef4444" />);
		expect(container).toMatchSnapshot();
	});
});
