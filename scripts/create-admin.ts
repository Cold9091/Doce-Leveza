import "dotenv/config";
import { db } from "../server/db.js";
import { admins } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || "doceleveza@admin.ao";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error("❌ ADMIN_PASSWORD env var is required");
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const existing = await db.select().from(admins).where(eq(admins.email, email));

    if (existing.length > 0) {
      await db.update(admins)
        .set({ password: hashedPassword })
        .where(eq(admins.email, email));
      console.log("✅ Admin actualizado com sucesso.");
    } else {
      const [admin] = await db.insert(admins).values({
        name: "Administrador",
        email,
        password: hashedPassword,
        role: "admin",
      }).returning();
      console.log("✅ Admin criado:", admin.email);
    }
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
