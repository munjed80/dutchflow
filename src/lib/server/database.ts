import "server-only";
import { Pool } from "pg";

let pool: Pool | undefined;
export function getDatabase() {
  if (!process.env.DATABASE_URL) throw new Error("Database is not configured");
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
    // An idle connection may fail during database restarts; do not crash the web process.
    pool.on("error", () => console.error("Database connection interrupted"));
  }
  return pool;
}
