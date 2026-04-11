import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
	test("homepage renders without errors", async ({ page }) => {
		const response = await page.goto("/");
		expect(response?.ok()).toBeTruthy();
	});

	test("homepage has Olympus branding", async ({ page }) => {
		await page.goto("/");
		// Page should contain Olympus branding (not internal names like Hera/Athena)
		const content = await page.textContent("body");
		expect(content).toContain("Olympus");
	});

	test("health endpoint returns ok", async ({ request }) => {
		const response = await request.get("/health");
		expect(response.ok()).toBeTruthy();
	});
});
