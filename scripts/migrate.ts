import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "../server/db.js";

async function runMigration() {
    console.log("🚀 Starting database migration for Turso...");

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