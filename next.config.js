/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@olympusoss/canvas"],
};

module.exports = nextConfig;
