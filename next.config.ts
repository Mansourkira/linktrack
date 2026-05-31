import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  experimental: {
    serverMinification: true,
  },
  // Keep build-only / Node-only packages out of the Cloudflare Worker bundle.
  serverExternalPackages: [
    "pg",
    "drizzle-orm",
    "drizzle-kit",
    "vitest",
    "lightningcss",
    "tailwindcss",
    "@tailwindcss/postcss",
    "esbuild",
  ],
  outputFileTracingExcludes: {
    "*": [
      "node_modules/pg/**/*",
      "node_modules/drizzle-kit/**/*",
      "node_modules/vitest/**/*",
      "node_modules/@esbuild/**/*",
      "node_modules/esbuild/**/*",
      "node_modules/lightningcss/**/*",
      "node_modules/@tailwindcss/**/*",
      "node_modules/webpack/**/*",
      "node_modules/terser/**/*",
      "**/*.md",
      "**/*.map",
    ],
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
