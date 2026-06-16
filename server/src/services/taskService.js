import { query } from '../config/db.js';
import cacheService from './cacheService.js';
import eventService from './eventService.js';

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

    // Invalidate cached statistics
    await cacheService.clearUserCache(userId);

    // Emit live activity feed event
    eventService.emitActivity(userId, 'created a task', title);

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

    if (result.rows[0]) {
      // Invalidate cached statistics
      await cacheService.clearUserCache(userId);

      // Emit live activity feed event
      if (completed === true || completed === 'true') {
        eventService.emitActivity(userId, 'completed a task', result.rows[0].title);
      } else {
        eventService.emitActivity(userId, 'updated a task', result.rows[0].title);
      }
    }

    return result.rows[0];
  }

  async deleteTask(userId, taskId) {
    const sql = `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *`;
    const result = await query(sql, [taskId, userId]);

    if (result.rowCount > 0) {
      // Invalidate cached statistics
      await cacheService.clearUserCache(userId);

      // Emit live activity feed event
      eventService.emitActivity(userId, 'deleted a task', result.rows[0].title);
    }

    return result.rowCount > 0;
  }

  async getPendingCount(userId) {
    const cacheKey = `user:${userId}:task_pending_count`;
    const cached = await cacheService.get(cacheKey);
    if (cached !== null) return cached;

    const sql = `SELECT COUNT(*) as count FROM tasks WHERE user_id = $1 AND completed = false`;
    const result = await query(sql, [userId]);
    const count = parseInt(result.rows[0].count || '0');
    await cacheService.set(cacheKey, count, 300);
    return count;
  }
}

export default new TaskService();
