import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../server/db.js";

async function runMigration() {
    console.log("🚀 Starting database migration for Supabase PostgreSQL...");

    try {
        await migrate(db, { migrationsFolder: "./migrations" });
        console.log("✅ Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

runMigration();