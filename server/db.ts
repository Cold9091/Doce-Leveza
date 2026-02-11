import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const client = createClient({
    url: process.env.DATABASE_URL.replace("libsql://", "https://"),
    authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
