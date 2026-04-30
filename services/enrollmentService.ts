import { db } from '../db/index';

export interface Enrollment {
  id: number;
  year: number;
  total_enrolled: number;
  class_name: string;
  college_name: string;
  city_name: string;
}

export const enrollmentService = {
  getAll(): Enrollment[] {
    return db.prepare('SELECT * FROM enrollments ORDER BY year ASC').all() as Enrollment[];
  },

  upsert(year: number, totalEnrolled: number, className: string, collegeName: string, cityName: string, id?: number): void {
    if (id) {
      const stmt = db.prepare('UPDATE enrollments SET year = ?, total_enrolled = ?, class_name = ?, college_name = ?, city_name = ? WHERE id = ?');
      stmt.run(year, totalEnrolled, className, collegeName, cityName, id);
    } else {
      const stmt = db.prepare('INSERT OR REPLACE INTO enrollments (year, total_enrolled, class_name, college_name, city_name) VALUES (?, ?, ?, ?, ?)');
      stmt.run(year, totalEnrolled, className, collegeName, cityName);
    }
  },

  delete(id: string | number): void {
    const stmt = db.prepare('DELETE FROM enrollments WHERE id = ?');
    stmt.run(id);
  }
};
