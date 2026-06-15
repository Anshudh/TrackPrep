import { query } from '../config/db.js';

class TaskService {
  async getTasks(userId, { completed } = {}) {
    let sql = `SELECT * FROM tasks WHERE user_id = $1`;
    const params = [userId];

    if (completed !== undefined) {
      sql += ` AND completed = $2`;
      params.push(completed === 'true' || completed === true);
    }

    sql += ` ORDER BY deadline ASC, created_at DESC`;
    const result = await query(sql, params);
    return result.rows;
  }

  async getTaskById(userId, taskId) {
    const sql = `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`;
    const result = await query(sql, [taskId, userId]);
    return result.rows[0];
  }

  async addTask(userId, { title, deadline }) {
    const sql = `
      INSERT INTO tasks (user_id, title, deadline, completed)
      VALUES ($1, $2, $3, false)
      RETURNING *
    `;
    const params = [userId, title, deadline || null];
    const result = await query(sql, params);
    return result.rows[0];
  }

  async updateTask(userId, taskId, { title, deadline, completed }) {
    const sql = `
      UPDATE tasks
      SET title = COALESCE($1, title),
          deadline = COALESCE($2, deadline),
          completed = COALESCE($3, completed)
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `;
    const params = [
      title !== undefined ? title : null,
      deadline !== undefined ? deadline : null,
      completed !== undefined ? completed : null,
      taskId,
      userId
    ];
    const result = await query(sql, params);
    return result.rows[0];
  }

  async deleteTask(userId, taskId) {
    const sql = `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *`;
    const result = await query(sql, [taskId, userId]);
    return result.rowCount > 0;
  }

  async getPendingCount(userId) {
    const sql = `SELECT COUNT(*) as count FROM tasks WHERE user_id = $1 AND completed = false`;
    const result = await query(sql, [userId]);
    return parseInt(result.rows[0].count || '0');
  }
}

export default new TaskService();
