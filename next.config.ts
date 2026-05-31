import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    serverMinification: true,
    serverSourceMaps: false,
    optimizePackageImports: [
      "lucide-react",
      "@tabler/icons-react",
      "recharts",
      "@radix-ui/react-icons",
    ],
  },
  serverExternalPackages: [
    "vitest",
    "lightningcss",
    "tailwindcss",
    "@tailwindcss/postcss",
    "esbuild",
  ],
  outputFileTracingExcludes: {
    "*": [
      "node_modules/drizzle-kit/**/*",
      "node_modules/vitest/**/*",
      "@vercel/og/**/*",
      "node_modules/next/dist/compiled/@vercel/og/**/*",
      "node_modules/@esbuild/**/*",
      "node_modules/esbuild/**/*",
      "node_modules/lightningcss/**/*",
      "node_modules/@tailwindcss/**/*",
      "node_modules/webpack/**/*",
      "node_modules/terser/**/*",
      "node_modules/typescript/**/*",
      "scripts/**/*",
      "**/*.md",
      "**/*.map",
    ],
  },
  // Do NOT use splitChunks on the server — OpenNext resolves chunks by ID at build time.
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "next/og": false,
      "@vercel/og": false,
      "next/dist/compiled/@vercel/og": false,
      "next/dist/compiled/@vercel/og/index.edge.js": false,
    };

    return config;
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
