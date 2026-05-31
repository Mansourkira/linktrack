import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  experimental: {
    serverMinification: true,
  },
  // Keep build-only / Node-only packages out of the Cloudflare Worker bundle.
  serverExternalPackages: [
    "pg",
    "pg-native",
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
      "node_modules/pg-native/**/*",
      "node_modules/drizzle-kit/**/*",
      "node_modules/vitest/**/*",
      "node_modules/@esbuild/**/*",
      "node_modules/esbuild/**/*",
      "node_modules/lightningcss/**/*",
      "node_modules/@tailwindcss/**/*",
      "node_modules/webpack/**/*",
      "node_modules/terser/**/*",
      "scripts/**/*",
      "**/*.md",
      "**/*.map",
    ],
  },
  // Do NOT use splitChunks on the server bundle — OpenNext resolves chunks by ID
  // at build time; custom splitting causes "Unknown chunk N" runtime errors on Workers.
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = config.externals ?? [];
      config.externals = [
        ...(Array.isArray(externals) ? externals : [externals]),
        "pg",
        "pg-native",
        "drizzle-orm/node-postgres",
      ];
    }

    return config;
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
