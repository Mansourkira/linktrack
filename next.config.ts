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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: "all",
          maxInitialRequests: 25,
          minSize: 20000,
        },
      };

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
