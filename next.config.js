/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@olympus/canvas"],
};

module.exports = nextConfig;
