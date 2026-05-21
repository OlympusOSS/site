import { readFileSync } from "node:fs";
import { createMDX } from "fumadocs-mdx/next";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	transpilePackages: ["@olympusoss/canvas"],
	// Turbopack uses inotify, which does not fire for Podman bind mounts on
	// macOS. Polling at 500 ms keeps live reload working in the dev stack.
	watchOptions: {
		pollIntervalMs: 500,
	},
	env: {
		APP_VERSION: version,
	},
};

export default withMDX(nextConfig);
