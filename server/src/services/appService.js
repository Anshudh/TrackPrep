import { query } from '../config/db.js';

class ApplicationService {
  async getApplications(userId, { status } = {}) {
    let sql = `SELECT * FROM applications WHERE user_id = $1`;
    const params = [userId];

    if (status) {
      sql += ` AND status = $2`;
      params.push(status);
    }

    sql += ` ORDER BY applied_date DESC, created_at DESC`;
    const result = await query(sql, params);
    return result.rows;
  }

  async getApplicationById(userId, applicationId) {
    const sql = `SELECT * FROM applications WHERE id = $1 AND user_id = $2`;
    const result = await query(sql, [applicationId, userId]);
    return result.rows[0];
  }

  async addApplication(userId, { company, role, status, applied_date, notes }) {
    const sql = `
      INSERT INTO applications (user_id, company, role, status, applied_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      userId,
      company,
      role,
      status || 'Applied',
      applied_date || new Date().toISOString().split('T')[0],
      notes || null
    ];
    const result = await query(sql, params);
    return result.rows[0];
  }

  async updateApplication(userId, applicationId, { company, role, status, applied_date, notes }) {
    const sql = `
      UPDATE applications
      SET company = $1, role = $2, status = $3, applied_date = $4, notes = $5
      WHERE id = $6 AND user_id = $7
      RETURNING *
    `;
    const params = [
      company,
      role,
      status,
      applied_date || new Date().toISOString().split('T')[0],
      notes || null,
      applicationId,
      userId
    ];
    const result = await query(sql, params);
    return result.rows[0];
  }

  async deleteApplication(userId, applicationId) {
    const sql = `DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING *`;
    const result = await query(sql, [applicationId, userId]);
    return result.rowCount > 0;
  }

  async getStatusStats(userId) {
    const sql = `
      SELECT status, COUNT(*) as count 
      FROM applications 
      WHERE user_id = $1 
      GROUP BY status
    `;
    const result = await query(sql, [userId]);
    return result.rows; // [{ status: 'Applied', count: 5 }, ...]
  }

  async getTotalCount(userId) {
    const sql = `SELECT COUNT(*) as count FROM applications WHERE user_id = $1`;
    const result = await query(sql, [userId]);
    return parseInt(result.rows[0].count || '0');
  }
}

export default new ApplicationService();
