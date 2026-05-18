import { readFileSync } from "node:fs";
import { createMDX } from "fumadocs-mdx/next";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	transpilePackages: ["@olympusoss/canvas"],
	env: {
		APP_VERSION: version,
	},
};

export default withMDX(nextConfig);
