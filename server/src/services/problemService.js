import { query } from '../config/db.js';

class ProblemService {
  async getProblems(userId, { search, platform, difficulty, topic } = {}) {
    let sql = `SELECT * FROM problems WHERE user_id = $1`;
    const params = [userId];
    let paramCount = 1;

    if (search) {
      paramCount++;
      sql += ` AND title ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    if (platform) {
      paramCount++;
      sql += ` AND platform = $${paramCount}`;
      params.push(platform);
    }

    if (difficulty) {
      paramCount++;
      sql += ` AND difficulty = $${paramCount}`;
      params.push(difficulty);
    }

    if (topic) {
      paramCount++;
      sql += ` AND topic = $${paramCount}`;
      params.push(topic);
    }

    sql += ` ORDER BY solved_date DESC, created_at DESC`;
    const result = await query(sql, params);
    return result.rows;
  }

  async getProblemById(userId, problemId) {
    const sql = `SELECT * FROM problems WHERE id = $1 AND user_id = $2`;
    const result = await query(sql, [problemId, userId]);
    return result.rows[0];
  }

  async addProblem(userId, { title, platform, difficulty, topic, solved_date, problem_url }) {
    const sql = `
      INSERT INTO problems (user_id, title, platform, difficulty, topic, solved_date, problem_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const params = [
      userId,
      title,
      platform,
      difficulty,
      topic,
      solved_date || new Date().toISOString().split('T')[0],
      problem_url || null
    ];
    const result = await query(sql, params);
    return result.rows[0];
  }

  async updateProblem(userId, problemId, { title, platform, difficulty, topic, solved_date, problem_url }) {
    const sql = `
      UPDATE problems
      SET title = $1, platform = $2, difficulty = $3, topic = $4, solved_date = $5, problem_url = $6
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `;
    const params = [
      title,
      platform,
      difficulty,
      topic,
      solved_date || new Date().toISOString().split('T')[0],
      problem_url || null,
      problemId,
      userId
    ];
    const result = await query(sql, params);
    return result.rows[0];
  }

  async deleteProblem(userId, problemId) {
    const sql = `DELETE FROM problems WHERE id = $1 AND user_id = $2 RETURNING *`;
    const result = await query(sql, [problemId, userId]);
    return result.rowCount > 0;
  }

  async getDifficultyStats(userId) {
    const sql = `
      SELECT difficulty, COUNT(*) as count 
      FROM problems 
      WHERE user_id = $1 
      GROUP BY difficulty
    `;
    const result = await query(sql, [userId]);
    return result.rows; // [{ difficulty: 'Easy', count: 12 }, ...]
  }

  async getTopicStats(userId) {
    const sql = `
      SELECT topic, COUNT(*) as count 
      FROM problems 
      WHERE user_id = $1 
      GROUP BY topic
    `;
    const result = await query(sql, [userId]);
    return result.rows; // [{ topic: 'Array', count: 8 }, ...]
  }

  async getTotalCount(userId) {
    const sql = `SELECT COUNT(*) as count FROM problems WHERE user_id = $1`;
    const result = await query(sql, [userId]);
    return parseInt(result.rows[0].count || '0');
  }
}

export default new ProblemService();
