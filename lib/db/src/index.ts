import { drizzle } from "drizzle-orm/node-postgres";
import { existsSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const loadEnvFile = (
  process as typeof process & { loadEnvFile?: (filePath?: string) => void }
).loadEnvFile;

for (const envPath of [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "../../.env"),
]) {
  if (existsSync(envPath)) {
    loadEnvFile?.(envPath);
  }
}

const externalConnectionString =
  process.env.connection_string ?? process.env.CONNECTION_STRING;

function isDirectSupabaseConnection(connectionString?: string) {
  if (!connectionString) {
    return false;
  }

  try {
    const hostname = new URL(connectionString).hostname;
    return /^db\.[^.]+\.supabase\.co$/.test(hostname);
  } catch {
    return false;
  }
}

const connectionString =
  externalConnectionString &&
  (!isDirectSupabaseConnection(externalConnectionString) ||
    !process.env.DATABASE_URL)
    ? externalConnectionString
    : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "A database connection string must be set. Provide connection_string or DATABASE_URL.",
  );
}

const useSsl =
  connectionString.includes("supabase.co") ||
  connectionString.includes("pooler.supabase.com") ||
  connectionString.includes("sslmode=require");

export const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
