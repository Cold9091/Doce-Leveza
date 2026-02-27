import { defineConfig } from "drizzle-kit";

// 🔄 PENDING: Database configuration will be updated to Supabase PostgreSQL
// Previously used: SQLite/Turso dialect
// Was configured with: @libsql/client and libsql:// URLs

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure it is set in the .env file");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  // TODO: Change dialect from 'sqlite' to 'postgresql'
  dialect: "sqlite",
  dbCredentials: {
    // TODO: Update to use PostgreSQL connection string (no authToken needed for Supabase)
    url: process.env.DATABASE_URL,
  },
});
