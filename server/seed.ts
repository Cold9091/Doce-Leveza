import "dotenv/config";
import { db, client } from "./db";
import { admins, systemSettings, pathologies } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
    console.log("Seeding database...");

    // Seed System Settings
    const existingSettings = await db.select().from(systemSettings).limit(1);
    if (existingSettings.length === 0) {
        console.log("Creating default system settings...");
        await db.insert(systemSettings).values({
            siteName: "Doce Leveza",
            supportEmail: null,
            supportPhone: null,
            maintenanceMode: 0,
            enableSignup: 1
        });
    }

    // Seed Admin (uses ADMIN_PASSWORD env var)
    const adminEmail = process.env.ADMIN_EMAIL || "doceleveza@admin.ao";
    const adminPassword = process.env.ADMIN_PASSWORD;
    const existingAdmin = await db.select().from(admins).where(eq(admins.email, adminEmail));

    if (existingAdmin.length === 0) {
        if (!adminPassword) {
            console.warn("⚠️  ADMIN_PASSWORD not set — skipping admin seed.");
        } else {
            console.log("Creating default admin user...");
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await db.insert(admins).values({
                name: "Administrador",
                email: adminEmail,
                password: hashedPassword,
                role: "super_admin",
                createdAt: new Date().toISOString(),
            });
            console.log(`✅ Admin created: ${adminEmail}`);
        }
    } else {
        console.log("Admin already exists.");
    }

    // Seed Pathologies
    const existingPathologies = await db.select().from(pathologies).limit(1);
    if (existingPathologies.length === 0) {
        console.log("Creating default pathologies (programs)...");
        const defaultPrograms = [
            {
                slug: "programa-perder-peso",
                title: "Programa Perder Peso",
                description: "Um programa completo para perda de peso saudável e sustentável",
                icon: "Activity",
                imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop",
                price: 0,
            },
            {
                slug: "programa-perder-peso-diabetes",
                title: "Perder Peso com Diabetes",
                description: "Programa especializado para pessoas com diabetes tipo 2",
                icon: "Heart",
                imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=450&fit=crop",
                price: 0,
            },
            {
                slug: "programa-perder-peso-hipertensao",
                title: "Perder Peso com Hipertensão",
                description: "Programa para controlar o peso e a pressão arterial",
                icon: "Activity",
                imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=450&fit=crop",
                price: 0,
            },
            {
                slug: "programa-perder-peso-gastrite",
                title: "Perder Peso com Gastrite",
                description: "Programa seguro para quem tem problemas gástricos",
                icon: "Stomach",
                imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop",
                price: 0,
            },
            {
                slug: "programa-perder-peso-amamentacao",
                title: "Perder Peso Amamentando",
                description: "Programa seguro para mães que amamentam",
                icon: "Users",
                imageUrl: "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?w=800&h=450&fit=crop",
                price: 0,
            },
            {
                slug: "programa-perder-peso-idosos",
                title: "Perder Peso na Terceira Idade",
                description: "Programa adaptado para idosos",
                icon: "User",
                imageUrl: "https://images.unsplash.com/photo-1516307364728-25b36c5f400f?w=800&h=450&fit=crop",
                price: 0,
            },
        ];

        await db.insert(pathologies).values(defaultPrograms);
        console.log(`✅ Created ${defaultPrograms.length} default programs`);
    } else {
        const count = await db.select().from(pathologies);
        console.log(`✅ Pathologies already exist: ${count.length} programs found`);
    }

    console.log("Seeding completed.");
}

seed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
