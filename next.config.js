const { version } = require("./package.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@olympusoss/canvas"],
  env: {
    APP_VERSION: version,
  },
};

module.exports = nextConfig;
