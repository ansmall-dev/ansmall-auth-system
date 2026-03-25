import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "app.db");

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
};

export function findUserByEmail(email: string): UserRow | undefined {
  const row = db
    .prepare(
      `SELECT id, email, password_hash, created_at FROM users WHERE email = ?`,
    )
    .get(email.trim().toLowerCase()) as UserRow | undefined;
  return row;
}

export function findUserById(id: number): UserRow | undefined {
  return db
    .prepare(
      `SELECT id, email, password_hash, created_at FROM users WHERE id = ?`,
    )
    .get(id) as UserRow | undefined;
}

export function createUser(email: string, passwordHash: string): UserRow {
  const normalized = email.trim().toLowerCase();
  const result = db
    .prepare(`INSERT INTO users (email, password_hash) VALUES (?, ?)`)
    .run(normalized, passwordHash);
  const id = Number(result.lastInsertRowid);
  const user = findUserById(id);
  if (!user) {
    throw new Error("Failed to create user");
  }
  return user;
}
