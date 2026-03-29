import "dotenv/config";
import { db } from "../server/db.js";
import { admins } from "../shared/schema.js";
import { eq } from "drizzle-orm";

async function createAdmin() {
  try {
    const existing = await db.select().from(admins).where(eq(admins.email, "doceleveza@admin.ao"));

    if (existing.length > 0) {
      await db.update(admins)
        .set({ password: "doceleveza909192" })
        .where(eq(admins.email, "doceleveza@admin.ao"));
      console.log("✅ Admin atualizado com sucesso.");
    } else {
      const [admin] = await db.insert(admins).values({
        name: "Administrador",
        email: "doceleveza@admin.ao",
        password: "doceleveza909192",
        role: "admin",
      }).returning();
      console.log("✅ Admin criado com sucesso:", admin);
    }
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
