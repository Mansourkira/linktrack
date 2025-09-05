import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas/schema';

// Database connection
const connectionString = process.env.DATABASE_URL!;

// Create postgres pool
const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Export the pool for migrations
export { pool };

// Close connection function (useful for scripts)
export const closeConnection = async () => {
    await pool.end();
};
