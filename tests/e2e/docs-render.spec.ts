import { expect, test } from "@playwright/test";

// Smoke tests for the Fumadocs docs site. These don't depend on any backend —
// they just verify that the doc pages render, have navigation, and that at
// least one nested page loads successfully.

test.describe("Docs pages render", () => {
	test("top-level /docs loads with content", async ({ page }) => {
		const response = await page.goto("/docs");
		expect(response?.ok()).toBeTruthy();

		// Docs should have a primary heading
		const h1 = page.locator("h1").first();
		await expect(h1).toBeVisible();
	});

	test("/docs has a sidebar or nav with at least one link", async ({ page }) => {
		await page.goto("/docs");
		// Fumadocs renders nav links; at least one internal /docs/* link should exist
		const docsLinks = page.locator("a[href^='/docs/']");
		const count = await docsLinks.count();
		expect(count).toBeGreaterThan(0);
	});

	test("clicking first nested doc link navigates successfully", async ({ page }) => {
		await page.goto("/docs");
		const firstDocLink = page.locator("a[href^='/docs/']").first();
		const href = await firstDocLink.getAttribute("href");
		if (!href || href === "/docs") {
			test.skip();
			return;
		}
		const response = await page.goto(href);
		expect(response?.ok()).toBeTruthy();
		await expect(page.locator("h1").first()).toBeVisible();
	});
});
