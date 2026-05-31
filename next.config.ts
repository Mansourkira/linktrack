import type { NextConfig } from "next";
import path from "path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const emptyModule = path.join(process.cwd(), "src/lib/stubs/empty-module.ts");

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
      "@tanstack/react-table",
    ],
  },
  serverExternalPackages: [
    "bcryptjs",
    "vitest",
    "lightningcss",
    "tailwindcss",
    "@tailwindcss/postcss",
    "esbuild",
    "drizzle-orm",
    "drizzle-kit",
    "pg",
  ],
  outputFileTracingExcludes: {
    "*": [
      "node_modules/drizzle-kit/**/*",
      "node_modules/drizzle-orm/**/*",
      "node_modules/pg/**/*",
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
  webpack: (config, { isServer }) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "next/og": false,
      "@vercel/og": false,
      "next/dist/compiled/@vercel/og": false,
      "next/dist/compiled/@vercel/og/index.edge.js": false,
    };

    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        recharts: emptyModule,
        "framer-motion": emptyModule,
      };
    }

    return config;
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
