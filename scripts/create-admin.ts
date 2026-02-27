import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

async function createAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query(
      `INSERT INTO admins (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password = $3
       RETURNING id, name, email, role`,
      ["Administrador", "doceleveza@admin.ao", "doceleveza909192", "admin"]
    );

    console.log("✅ Admin criado com sucesso:", result.rows[0]);
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
  } finally {
    await pool.end();
  }
}

createAdmin();