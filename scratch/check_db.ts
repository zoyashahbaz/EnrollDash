import { db, initDb } from '../db/index';

try {
  console.log("Initializing DB...");
  initDb();
  console.log("DB Initialized.");

  const enrollments = db.prepare('SELECT * FROM enrollments').all();
  console.log("Enrollments:", enrollments);

  const users = db.prepare('SELECT * FROM users').all();
  console.log("Users:", users);

  console.log("Database check successful.");
} catch (error) {
  console.error("Database check failed:", error);
} finally {
  db.close();
}
