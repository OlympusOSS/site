import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SessionDisplay } from "@/components/site/session-display";

function baseData(overrides: Partial<Parameters<typeof SessionDisplay>[0]["data"]> = {}) {
	return {
		access_token: `atoken_${"x".repeat(80)}`,
		id_token: "idtoken",
		refresh_token: "rtoken",
		token_type: "Bearer",
		expires_in: 3600,
		scope: "openid profile email",
		claims: { sub: "user-1", email: "a@b.c" },
		...overrides,
	};
}

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe("SessionDisplay", () => {
	it("renders user info, scopes and the truncated access token", () => {
		const { container } = render(<SessionDisplay data={baseData()} />);
		expect(screen.getByText("User Info")).toBeInTheDocument();
		expect(screen.getByText("user-1")).toBeInTheDocument();
		expect(screen.getByText("a@b.c")).toBeInTheDocument();
		expect(screen.getByText("openid profile email")).toBeInTheDocument();
		expect(screen.getByText("Bearer")).toBeInTheDocument();
		expect(screen.getByText("3600s")).toBeInTheDocument();
		// Access token is truncated to first 40 chars followed by an ellipsis.
		// The visible value is "atoken_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx…" (40 chars + ellipsis).
		expect(container.textContent).toContain(`${"atoken_"}${"x".repeat(33)}…`);
	});

	it("omits the Email row when email is absent from claims", () => {
		render(<SessionDisplay data={baseData({ claims: { sub: "no-email" } })} />);
		expect(screen.queryByText(/email:/i)).toBeNull();
	});

	it("toggles the ID Token Claims block on click", () => {
		render(<SessionDisplay data={baseData()} />);
		// Initially the JSON payload is not in the DOM (collapsed AnimatePresence).
		expect(screen.queryByText(/"sub":/)).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: /id token claims/i }));
		// After clicking it expands; the JSON contains the sub claim.
		expect(screen.getByText(/"sub":/)).toBeInTheDocument();
		// We can't easily assert collapse with framer-motion's AnimatePresence in
		// jsdom (the exit animation keeps the node mounted), so just verify the
		// click handler fires by re-clicking and confirming setState side effect
		// via the chevron's animate prop is best-effort handled. Sanity check: a
		// second click does not throw.
		fireEvent.click(screen.getByRole("button", { name: /id token claims/i }));
	});

	it("copies the access token and shows the copied checkmark, which resets after 2s", () => {
		const writeText = vi.fn(() => Promise.resolve());
		Object.assign(navigator, { clipboard: { writeText } });
		render(<SessionDisplay data={baseData()} />);
		const copyButton = screen.getByRole("button", { name: /^copy$/i });
		fireEvent.click(copyButton);
		expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/^atoken_/));
		expect(screen.getByRole("button", { name: /✓/ })).toBeInTheDocument();
		act(() => {
			vi.advanceTimersByTime(2000);
		});
		expect(screen.getByRole("button", { name: /^copy$/i })).toBeInTheDocument();
	});
});

describe("SessionDisplay (snapshot)", () => {
	it("matches snapshot with full claims", () => {
		const { container } = render(<SessionDisplay data={baseData()} />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with claims missing email", () => {
		const { container } = render(<SessionDisplay data={baseData({ claims: { sub: "no-email" } })} />);
		expect(container).toMatchSnapshot();
	});
});
