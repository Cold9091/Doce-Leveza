import * as schema from "@shared/schema";

// 🔄 PENDING: Database configuration will be updated to Supabase PostgreSQL
// Previously used: LibSQL/Turso (@libsql/client)
// To be updated with: drizzle-orm/pg and postgres driver

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// TODO: Replace with Supabase/PostgreSQL client configuration
export const db = null as any;
