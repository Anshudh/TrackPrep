import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const poolConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'trackprep',
};

const pool = new Pool(poolConfig);

// Log database connection info
pool.on('connect', () => {
  console.log('Database connection pool established successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

// Wrapper query function for simple calls
const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error(`Database Query Failed:\nSQL: ${text}\nError:`, error.message);
    throw error;
  }
};

export { pool, query };
