import "dotenv/config";
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
    console.log("🚀 Starting direct SQL migration...");

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL não está configurada no arquivo .env");
        console.error("   Por favor, adicione suas credenciais do Turso:");
        console.error("   DATABASE_URL=libsql://your-database.turso.io");
        console.error("   DATABASE_AUTH_TOKEN=your-token");
        process.exit(1);
    }

    const client = createClient({
        url: process.env.DATABASE_URL.replace("libsql://", "https://"),
        authToken: process.env.DATABASE_AUTH_TOKEN,
    });

    try {
        // Read the generated SQL migration file
        const sqlFile = join(__dirname, "../migrations/0000_new_black_panther.sql");
        const sqlContent = readFileSync(sqlFile, "utf-8");

        // Split by semicolon and execute each statement
        const statements = sqlContent
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        console.log(`📋 Found ${statements.length} SQL statements to execute`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`   [${i + 1}/${statements.length}] Executing...`);

            try {
                await client.execute(statement);
                console.log(`   ✅ Statement ${i + 1} executed successfully`);
            } catch (err: any) {
                if (err.message?.includes("already exists")) {
                    console.log(`   ℹ️  Statement ${i + 1} skipped (already exists)`);
                } else {
                    console.error(`   ❌ Statement ${i + 1} failed:`, err.message);
                    throw err;
                }
            }
        }

        console.log("\n✅ Migration completed successfully!");
        console.log("📊 Database tables created:");
        console.log("   - users, admins, pathologies");
        console.log("   - videos, ebooks, consultations");
        console.log("   - subscriptions, user_access");
        console.log("   - leads, notifications, admin_notifications");
        console.log("   - system_settings");

    } catch (error: any) {
        console.error("\n❌ Migration failed:", error.message);
        console.error("\nPossíveis causas:");
        console.error("1. Credenciais do Turso inválidas no arquivo .env");
        console.error("2. Banco de dados não acessível");
        console.error("3. Problema de rede ou permissões");
        process.exit(1);
    } finally {
        client.close();
    }
}

runMigration();
