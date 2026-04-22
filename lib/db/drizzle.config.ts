import { defineConfig } from "drizzle-kit";
import { existsSync } from "node:fs";
import path from "path";

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
  throw new Error("A database connection string must be set");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
