import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const poolConfig = process.env.DATABASE_URL
  ? { 
      connectionString: process.env.DATABASE_URL,
      // If connecting to Railway database from outside or with SSL requirement
      ssl: process.env.DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false
    }
  : {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_DATABASE || 'trackprep',
    };

const pool = new Pool(poolConfig);

// Automatically load schema if tables don't exist
const initSchema = async (clientPool) => {
  try {
    // Check if the 'users' table already exists
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    const res = await clientPool.query(checkQuery);
    const tableExists = res.rows[0]?.exists;

    if (!tableExists) {
      console.log('Database tables not found. Loading schema from schema.sql...');
      const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute the schema script
      await clientPool.query(schemaSql);
      console.log('Database schema successfully initialized.');
    } else {
      console.log('Database tables verified. Schema initialization skipped.');
    }
  } catch (err) {
    console.error('Failed to initialize database schema automatically:', err.message);
  }
};

// Log database connection info
pool.on('connect', () => {
  console.log('Database connection pool established successfully.');
});

// Trigger schema initialization on connection
initSchema(pool);

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
