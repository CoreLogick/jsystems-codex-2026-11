import Database from "better-sqlite3";

export type AppDatabase = Database;

export function openDatabase(path: string): AppDatabase {
  const database = new Database(path);
  database.pragma("foreign_keys = ON");
  database.pragma("journal_mode = WAL");
  database.pragma("busy_timeout = 5000");
  return database;
}
