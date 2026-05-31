/**
 * TEMPORARILY DISABLED for Cloudflare Worker bundle-size test.
 * Restore from git history when re-enabling Drizzle Kit.
 */

/*
import { defineConfig } from "drizzle-kit";

import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./src/lib/schemas/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: "drizzle_migrations",
    schema: "public",
  },
  verbose: true,
  strict: true,
});
*/

export default {};
