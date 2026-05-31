/**
 * Node.js-only database client for local CLI scripts (seed, migrations).
 * Production on Cloudflare Workers uses Supabase over HTTP — do not import
 * this module from Next.js app routes, layouts, or server components.
 */
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/lib/schemas/schema";

let pool: Pool | undefined;
let dbInstance: NodePgDatabase<typeof schema> | undefined;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required for local database scripts.");
    }

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
    });
  }

  return pool;
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance;
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
    dbInstance = undefined;
  }
}
