import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { Pool } from "pg";

export async function migrate(connectionString) {
  if (!connectionString) throw new Error("Set DATABASE_URL before running migrations");
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(482916230)");
    await client.query("CREATE TABLE IF NOT EXISTS dutchflow_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
    const directory = new URL("../migrations/", import.meta.url);
    for (const name of (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort()) {
      const sql = await readFile(new URL(name, directory), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const previous = await client.query("SELECT checksum FROM dutchflow_migrations WHERE name = $1", [name]);
      if (previous.rows.length) {
        if (previous.rows[0].checksum !== checksum) throw new Error(`Applied migration changed: ${name}`);
        continue;
      }
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO dutchflow_migrations (name, checksum) VALUES ($1, $2)", [name, checksum]);
        await client.query("COMMIT");
        console.log(`Applied ${name}`);
      } catch (error) { await client.query("ROLLBACK"); throw error; }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(482916230)");
    client.release();
    await pool.end();
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  migrate(process.env.DATABASE_URL).catch(() => { console.error("Migration failed. Check database connectivity and migration history; no credentials are logged."); process.exitCode = 1; });
}
