import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { AppDatabase } from "./connection";

const migrationName = "0000_initial";

export function migrate(database: AppDatabase): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS __migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);
  const applied = database.prepare("SELECT name FROM __migrations WHERE name = ?").get(migrationName);
  if (applied) return;

  const sql = readFileSync(join(process.cwd(), "drizzle", `${migrationName}.sql`), "utf8");
  const apply = database.transaction(() => {
    database.exec(sql);
    database.prepare("INSERT INTO __migrations (name, applied_at) VALUES (?, ?)").run(migrationName, new Date().toISOString());
  });
  apply();
}
