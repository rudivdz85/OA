import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create the database connection
const sql = neon(process.env.DATABASE_URL);

// Create and export the drizzle instance
export const db = drizzle(sql);

// Export the sql client for raw queries if needed
export { sql };
