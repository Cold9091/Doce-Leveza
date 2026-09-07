import "dotenv/config";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("TURSO_DATABASE_URL não está configurado");
}

if (!url.startsWith("libsql://") && !url.startsWith("https://")) {
  throw new Error(
    "TURSO_DATABASE_URL deve apontar para uma base Turso remota (libsql:// ou https://), não para file:local.db",
  );
}

if (!authToken) {
  throw new Error("TURSO_AUTH_TOKEN não está configurado");
}

const client = createClient({ url, authToken });

async function tableExists(table: string): Promise<boolean> {
  const result = await client.execute({
    sql: "SELECT 1 FROM sqlite_master WHERE type = ? AND name = ? LIMIT 1",
    args: ["table", table],
  });
  return result.rows.length > 0;
}

async function ensureColumn(table: string, column: string, definition: string) {
  if (!await tableExists(table)) {
    throw new Error(`A tabela legada obrigatória '${table}' não existe`);
  }

  const columns = await client.execute(`PRAGMA table_info(${table})`);
  if (!columns.rows.some((row) => row.name === column)) {
    await client.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`✅ Coluna adicionada: ${table}.${column}`);
  }
}

async function upgrade() {
  console.log("🚀 A actualizar o schema de planos no Turso...");

  await client.execute(`
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pathology_id INTEGER,
      type TEXT NOT NULL,
      price INTEGER NOT NULL,
      duration_days INTEGER NOT NULL,
      whatsapp_url TEXT,
      bonus_content_url TEXT,
      active INTEGER NOT NULL DEFAULT 1
    )
  `);

  await ensureColumn("subscriptions", "plan_id", "INTEGER");
  await ensureColumn("payment_proofs", "plan_id", "INTEGER");

  await client.execute(`
    INSERT INTO plans (pathology_id, type, price, duration_days, active)
    SELECT p.id, 'mensal', COALESCE(p.price, 0), 30, 1
    FROM pathologies p
    WHERE NOT EXISTS (
      SELECT 1 FROM plans current
      WHERE current.pathology_id = p.id AND current.type = 'mensal'
    )
  `);

  await client.execute(`
    INSERT INTO plans (pathology_id, type, price, duration_days, active)
    SELECT p.id, 'trimestral', COALESCE(p.price, 0) * 3, 90, 1
    FROM pathologies p
    WHERE NOT EXISTS (
      SELECT 1 FROM plans current
      WHERE current.pathology_id = p.id AND current.type = 'trimestral'
    )
  `);

  await client.execute(`
    INSERT INTO plans (pathology_id, type, price, duration_days, active)
    SELECT NULL, 'ilimitado', 7500, 365, 1
    WHERE NOT EXISTS (
      SELECT 1 FROM plans WHERE pathology_id IS NULL AND type = 'ilimitado'
    )
  `);

  const plans = await client.execute("SELECT COUNT(*) AS total FROM plans");
  console.log(`✅ Schema actualizado. Planos disponíveis: ${plans.rows[0]?.total ?? 0}`);
}

upgrade()
  .catch((error) => {
    console.error("❌ Falha ao actualizar o schema de planos:", error);
    process.exitCode = 1;
  })
  .finally(() => client.close());