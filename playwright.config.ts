import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://localhost:2000";

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL,
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: process.env.CI
		? {
				// `bun run start` defers to `next start` which defaults to port
				// 3000, but baseURL is :2000 (the canonical site port the prod
				// container exposes via Caddy). Pass PORT explicitly so the
				// running server matches the URL Playwright is polling — without
				// this the webServer step times out after 120s waiting on the
				// wrong port.
				command: "bun run build && PORT=2000 bun run start",
				url: baseURL,
				reuseExistingServer: false,
				timeout: 120_000,
			}
		: undefined,
});
