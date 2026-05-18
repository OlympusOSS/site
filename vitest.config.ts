import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./tests/setup.ts"],
		include: ["test/**/*.test.{ts,tsx}"],
		exclude: ["tests/e2e/**", "node_modules/**", ".next/**", ".source/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "json-summary"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				// Test files
				"src/**/*.test.{ts,tsx}",
				"src/**/__tests__/**",
				"src/**/*.d.ts",
				// Top-level barrels + types
				"src/**/index.ts",
				"src/**/types.ts",
				// Next.js framework scaffold — covered by E2E via tests/e2e/.
				// `next build` + Playwright exercise these end-to-end; unit
				// tests here would duplicate that coverage at higher cost.
				"src/app/**/page.tsx",
				"src/app/**/layout.tsx",
				"src/app/**/loading.tsx",
				"src/app/**/not-found.tsx",
				"src/app/**/error.tsx",
				"src/app/**/opengraph-image.tsx",
			],
			thresholds: {
				// Match hera/athena's 100/100/100/90 floor across the project.
				// Per-glob locks call out where the strictest version applies.
				"src/lib/**": { lines: 100, statements: 100, functions: 100, branches: 90 },
				"src/components/**": { lines: 100, statements: 100, functions: 100, branches: 90 },
				"src/app/**/route.ts": { lines: 100, statements: 100, functions: 100, branches: 90 },
				lines: 100,
				statements: 100,
				functions: 100,
				branches: 90,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
