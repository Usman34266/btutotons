import type { NextConfig } from "next";

// Static export only (deployed to Cloudflare as static assets).
// No redirects/headers/rewrites here: they live in public/_redirects and
// public/_headers, generated from the registry by scripts/ at prebuild.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
