import "dotenv/config";
import { db, client } from "./db";
import { admins, systemSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("Seeding database...");

    // Seed System Settings
    const existingSettings = await db.select().from(systemSettings).limit(1);
    if (existingSettings.length === 0) {
        console.log("Creating default system settings...");
        await db.insert(systemSettings).values({
            siteName: "Doce Leveza",
            supportEmail: "suporte@doceleveza.com",
            supportPhone: "(11) 99999-9999",
            maintenanceMode: 0,
            enableSignup: 1
        });
    }

    // Seed Admin
    const adminEmail = "admin@doceleveza.com";
    const existingAdmin = await db.select().from(admins).where(eq(admins.email, adminEmail));

    if (existingAdmin.length === 0) {
        console.log("Creating default admin user...");
        await db.insert(admins).values({
            name: "Admin",
            email: adminEmail,
            password: "admin123", // In production, this should be hashed!
            role: "super_admin",
            createdAt: new Date().toISOString(),
        });
        console.log("Admin created: admin@doceleveza.com / admin123");
    } else {
        console.log("Admin already exists.");
    }

    console.log("Seeding completed.");
}

seed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
