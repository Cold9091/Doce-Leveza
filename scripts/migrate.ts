import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db, client } from "../server/db.js";

async function runMigration() {
    console.log("🚀 Starting database migration...");

    try {
        await migrate(db, { migrationsFolder: "./migrations" });
        console.log("✅ Migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    } finally {
        client.close();
    }
}

runMigration();
