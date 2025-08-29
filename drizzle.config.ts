import { defineConfig } from "drizzle-kit";

import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Migration configuration
  migrations: {
    table: "drizzle_migrations",
    schema: "public",
  },
  // Verbose logging for development
  verbose: true,
  // Strict mode for better type safety
  strict: true,
});
