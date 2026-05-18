#!/usr/bin/env node
//
// Snapshot-coverage gate for site's brochure components.
//
// Scans the hardcoded list of brochure components under
// src/components/site/ and verifies that a matching snapshot file
// exists at test/__snapshots__/<basename>.test.tsx.snap.
//
// Mirrors the hera/athena snapshot-coverage gate. Brochure pages
// (src/app pages) are out of scope: visual coverage there is via
// Playwright E2E in tests/e2e/. Route handlers (src/app route.ts
// files) are non-visual logic and out of scope. The mermaid client
// is a render-via-effect component whose first paint is a
// placeholder; its snapshot would be brittle, so it stays excluded.
//
// Exits non-zero if coverage falls below the threshold.
//
// Threshold can be overridden via:
//   SNAPSHOT_COVERAGE_THRESHOLD=90   (percentage 0-100; default 100)
//

import { existsSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SNAPSHOT_DIR = join(ROOT, "test", "__snapshots__");

// Hardcoded list of components in scope for the snapshot-coverage gate.
// Paths are relative to the repo root.
const COMPONENTS = [
	"src/components/site/architecture-section.tsx",
	"src/components/site/code-sample.tsx",
	"src/components/site/features-section.tsx",
	"src/components/site/getting-started-section.tsx",
	"src/components/site/hero-section.tsx",
	"src/components/site/login-button.tsx",
	"src/components/site/nav-bar.tsx",
	"src/components/site/playground-grid.tsx",
	"src/components/site/playground-section.tsx",
	"src/components/site/session-display.tsx",
	"src/components/site/site-footer.tsx",
	"src/components/site/status-badge.tsx",
	"src/components/site/theme-toggle.tsx",
];

const threshold = Number(process.env.SNAPSHOT_COVERAGE_THRESHOLD ?? 100);

function hasSnapshot(componentBasename) {
	const snap = join(SNAPSHOT_DIR, `${componentBasename}.test.tsx.snap`);
	return existsSync(snap);
}

function run() {
	const covered = [];
	const uncovered = [];

	for (const relPath of COMPONENTS) {
		const base = basename(relPath, ".tsx");
		if (hasSnapshot(base)) covered.push(relPath);
		else uncovered.push(relPath);
	}

	const total = COMPONENTS.length;
	const pct = total === 0 ? 100 : (covered.length / total) * 100;

	console.log(`Snapshot coverage: ${pct.toFixed(1)}% (${covered.length}/${total})`);

	if (uncovered.length) {
		console.log("\nComponents without a snapshot:");
		for (const p of uncovered) {
			console.log(`  - ${p}`);
		}
	}

	if (pct < threshold) {
		console.error(`\n✖ Snapshot coverage ${pct.toFixed(1)}% is below threshold ${threshold}%.`);
		console.error(`  Add snapshot tests for the components listed above, or set`);
		console.error(`  SNAPSHOT_COVERAGE_THRESHOLD to the current floor to lock it in.`);
		process.exit(1);
	}
	console.log(`\n✓ Snapshot coverage is at or above threshold (${threshold}%).`);
}

run();
