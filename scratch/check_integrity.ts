import { db } from '../db/index';

try {
  const result = db.pragma('integrity_check');
  console.log("Integrity Check Result:", result);
  
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log("Tables:", tables);

  for (const table of tables as any) {
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.log(`Columns for ${table.name}:`, columns);
  }

} catch (error) {
  console.error("Integrity check failed:", error);
} finally {
  db.close();
}
