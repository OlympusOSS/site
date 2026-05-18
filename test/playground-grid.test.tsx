import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthStatusBadgeRow, AuthStatusRow, LogoutLink, PlaygroundAdminSection, PlaygroundGrid } from "@/components/site/playground-grid";

describe("PlaygroundGrid building blocks", () => {
	it("renders PlaygroundGrid children", () => {
		render(
			<PlaygroundGrid>
				<div data-testid="child">hi</div>
			</PlaygroundGrid>,
		);
		expect(screen.getByTestId("child")).toBeInTheDocument();
	});

	it("renders the admin section with its heading", () => {
		render(
			<PlaygroundAdminSection>
				<div data-testid="admin-child">child</div>
			</PlaygroundAdminSection>,
		);
		expect(screen.getByText(/admin panels/i)).toBeInTheDocument();
		expect(screen.getByTestId("admin-child")).toBeInTheDocument();
	});

	it("renders AuthStatusRow children", () => {
		render(
			<AuthStatusRow>
				<span data-testid="status-child">status</span>
			</AuthStatusRow>,
		);
		expect(screen.getByTestId("status-child")).toBeInTheDocument();
	});

	it("renders AuthStatusBadgeRow children", () => {
		render(
			<AuthStatusBadgeRow>
				<span data-testid="badge-child">badge</span>
			</AuthStatusBadgeRow>,
		);
		expect(screen.getByTestId("badge-child")).toBeInTheDocument();
	});

	it("renders LogoutLink with href and children", () => {
		render(<LogoutLink href="/logout/ciam">Sign out</LogoutLink>);
		const link = screen.getByRole("link", { name: "Sign out" });
		expect(link).toHaveAttribute("href", "/logout/ciam");
	});
});

describe("PlaygroundGrid (snapshot)", () => {
	it("matches PlaygroundGrid snapshot", () => {
		const { container } = render(
			<PlaygroundGrid>
				<div data-testid="child">hi</div>
			</PlaygroundGrid>,
		);
		expect(container).toMatchSnapshot();
	});

	it("matches PlaygroundAdminSection snapshot", () => {
		const { container } = render(
			<PlaygroundAdminSection>
				<div data-testid="admin-child">child</div>
			</PlaygroundAdminSection>,
		);
		expect(container).toMatchSnapshot();
	});

	it("matches AuthStatusRow snapshot", () => {
		const { container } = render(
			<AuthStatusRow>
				<span data-testid="status-child">status</span>
			</AuthStatusRow>,
		);
		expect(container).toMatchSnapshot();
	});

	it("matches AuthStatusBadgeRow snapshot", () => {
		const { container } = render(
			<AuthStatusBadgeRow>
				<span data-testid="badge-child">badge</span>
			</AuthStatusBadgeRow>,
		);
		expect(container).toMatchSnapshot();
	});

	it("matches LogoutLink snapshot", () => {
		const { container } = render(<LogoutLink href="/logout/ciam">Sign out</LogoutLink>);
		expect(container).toMatchSnapshot();
	});
});
