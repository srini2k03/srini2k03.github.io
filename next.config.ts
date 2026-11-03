import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages.
 * PAGES_BASE_PATH is injected by the deploy workflow (actions/configure-pages),
 * so the same build works at /Resume- or at the root of a user site.
 */
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
