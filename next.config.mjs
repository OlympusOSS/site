import { readFileSync } from "node:fs";
import { createMDX } from "fumadocs-mdx/next";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));

const withMDX = createMDX();

const isDev = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	transpilePackages: ["@olympusoss/canvas"],
	// Turbopack's Rust resolver refuses to follow symlinks that resolve outside
	// the project root. In the dev stack, canvas is bind-mounted at a path
	// outside /app; on the host, postinstall symlinks resolve to sibling repos.
	// Setting root to "/" lets Turbopack resolve across the full tree.
	// Only applied in dev: the standalone build uses the root to compute output
	// paths, producing nested directories (home/runner/...) instead of server.js
	// at the top level.
	...(isDev ? { turbopack: { root: "/" } } : {}),
	// Turbopack uses inotify, which does not fire for Podman bind mounts on
	// macOS. Polling at 500 ms keeps live reload working in the dev stack.
	...(isDev ? { watchOptions: { pollIntervalMs: 500 } } : {}),
	env: {
		APP_VERSION: version,
	},
};

export default withMDX(nextConfig);
