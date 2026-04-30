import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Use process.cwd() to ensure we find the database in the project root
const dbPath = path.resolve(process.cwd(), 'enrollments.db');

console.log(`[Database] Opening database at ${dbPath}`);
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Setup DB schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER UNIQUE NOT NULL,
      total_enrolled INTEGER NOT NULL,
      class_name TEXT NOT NULL,
      college_name TEXT NOT NULL,
      city_name TEXT NOT NULL DEFAULT 'Sargodha'
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Ensure city_name column exists for existing tables
  try {
    db.exec(`ALTER TABLE enrollments ADD COLUMN city_name TEXT NOT NULL DEFAULT 'Sargodha'`);
    console.log('[Database] Added city_name column to enrollments table');
  } catch (err) {}

  try {
    db.exec(`ALTER TABLE users ADD COLUMN role TEXT`);
    console.log('[Database] Added role column to users table');
  } catch (err) {}

  try {
    db.exec(`ALTER TABLE users ADD COLUMN bio TEXT`);
    console.log('[Database] Added bio column to users table');
  } catch (err) {}
  try {
    db.prepare('SELECT 1').get();
    console.log('[Database] Connection verified');
  } catch (err) {
    console.error('[Database] Connection failed:', err);
    throw err;
  }

  console.log('[Database] Schema initialized');
}
