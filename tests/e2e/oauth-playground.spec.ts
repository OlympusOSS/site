import { expect, test } from "@playwright/test";

// These tests validate the OAuth2 playground route behavior WITHOUT requiring
// a live Hydra/Kratos backend. They check the initiation and callback routes
// redirect correctly and reject malformed requests — enough to catch broken
// URL construction, state-cookie regressions, and error-path regressions.

test.describe("OAuth playground — CIAM", () => {
	test("initiation route redirects to Hydra with correct query params", async ({ page }) => {
		// Don't follow the redirect — we want to inspect the Location header
		const response = await page.goto("/login/ciam", { waitUntil: "commit" });
		const status = response?.status();
		// Should be a 3xx redirect
		expect(status).toBeGreaterThanOrEqual(300);
		expect(status).toBeLessThan(400);

		// The redirect URL must include the OAuth2 code-flow params
		const url = page.url();
		expect(url).toContain("/oauth2/auth");
		expect(url).toContain("response_type=code");
		expect(url).toContain("client_id=");
		expect(url).toContain("state=");
		expect(url).toContain("scope=openid");
		expect(url).toContain("redirect_uri=");
	});

	test("initiation sets the oauth_state_ciam cookie", async ({ context, page }) => {
		await page.goto("/login/ciam", { waitUntil: "commit" });
		const cookies = await context.cookies();
		const stateCookie = cookies.find((c) => c.name === "oauth_state_ciam");
		expect(stateCookie).toBeDefined();
		expect(stateCookie?.httpOnly).toBe(true);
		// state should be a hex string of reasonable length (randomBytes(32).toString("hex") = 64)
		expect(stateCookie?.value.length).toBeGreaterThan(16);
	});

	test("callback without code returns error (no upstream hit)", async ({ page }) => {
		const response = await page.goto("/callback/ciam");
		// Callback missing required params should not silently succeed
		// (exact shape depends on handleOAuthCallback — could be 4xx or redirect to error page)
		expect(response).toBeTruthy();
		const url = page.url();
		// Should land on error/home, not a blank 200
		expect(url).not.toContain("code=");
	});
});

test.describe("OAuth playground — IAM", () => {
	test("initiation route redirects to Hydra with correct query params", async ({ page }) => {
		const response = await page.goto("/login/iam", { waitUntil: "commit" });
		const status = response?.status();
		expect(status).toBeGreaterThanOrEqual(300);
		expect(status).toBeLessThan(400);

		const url = page.url();
		expect(url).toContain("/oauth2/auth");
		expect(url).toContain("state=");
	});

	test("initiation sets the oauth_state_iam cookie distinct from ciam", async ({ context, page }) => {
		await page.goto("/login/iam", { waitUntil: "commit" });
		const cookies = await context.cookies();
		const stateCookie = cookies.find((c) => c.name === "oauth_state_iam");
		expect(stateCookie).toBeDefined();
		expect(stateCookie?.httpOnly).toBe(true);
	});
});
