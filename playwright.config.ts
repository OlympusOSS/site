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
				// Use `next dev` for E2E rather than `next start`. next.config
				// sets `output: "standalone"` (so the Containerfile can copy a
				// self-contained server bundle), and Next refuses `next start`
				// against a standalone build — it warns and exits without
				// binding the port, so Playwright times out with
				// ERR_CONNECTION_REFUSED. The standalone server (`node
				// .next/standalone/server.js`) works but needs `public/` and
				// `.next/static/` copied next to it first; dev mode does not,
				// and the suite is just redirect/cookie checks that don't
				// depend on prod optimisations.
				command: "PORT=2000 bun run dev",
				url: baseURL,
				reuseExistingServer: false,
				timeout: 180_000,
			}
		: undefined,
});
