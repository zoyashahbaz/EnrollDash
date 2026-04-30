import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'enrollments.db');

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function createDefaultUser() {
  const email = 'admin@university.edu';
  const username = 'Admin User';
  const password = 'admin123';
  
  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (!existingUser) {
    const password_hash = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, password_hash);
    console.log('Default admin user created successfully.');
  } else {
    console.log('Admin user already exists.');
  }
}

createDefaultUser().catch(console.error);
