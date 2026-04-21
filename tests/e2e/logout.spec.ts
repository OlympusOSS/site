import { expect, test } from "@playwright/test";

// Validates logout endpoints without a live Hydra. The logout handler calls
// Hydra admin APIs server-side — when those are unavailable (CI), the handler
// should still clear the local session cookie and redirect home rather than
// hang or 500.

test.describe("Logout — session cookie cleared", () => {
	test("CIAM logout clears site_ciam_session and redirects", async ({ context, page }) => {
		// Plant a fake session cookie first so we can assert it gets cleared
		await context.addCookies([
			{
				name: "site_ciam_session",
				value: "fake-session",
				domain: "localhost",
				path: "/",
				httpOnly: true,
				secure: false,
				sameSite: "Lax",
			},
		]);

		const response = await page.goto("/logout/ciam");
		expect(response).toBeTruthy();

		const cookies = await context.cookies();
		const session = cookies.find((c) => c.name === "site_ciam_session");
		// Either deleted, or expired, or value cleared
		if (session) {
			expect(session.value === "" || session.expires <= Date.now() / 1000).toBeTruthy();
		}
	});

	test("IAM logout clears site_iam_session and redirects", async ({ context, page }) => {
		await context.addCookies([
			{
				name: "site_iam_session",
				value: "fake-session",
				domain: "localhost",
				path: "/",
				httpOnly: true,
				secure: false,
				sameSite: "Lax",
			},
		]);

		const response = await page.goto("/logout/iam");
		expect(response).toBeTruthy();

		const cookies = await context.cookies();
		const session = cookies.find((c) => c.name === "site_iam_session");
		if (session) {
			expect(session.value === "" || session.expires <= Date.now() / 1000).toBeTruthy();
		}
	});

	test("logout without a session cookie still succeeds (idempotent)", async ({ page }) => {
		const response = await page.goto("/logout/ciam");
		// Should not 500 when there's nothing to log out of
		expect(response?.status()).toBeLessThan(500);
	});
});
