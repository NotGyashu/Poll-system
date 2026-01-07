import { Pool } from 'pg';
import { config } from './index';

// check if DATABASE_URL is set (for supabase)
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
    };

export const pool = new Pool(connectionConfig);

pool.on('connect', () => {
  console.log('Connected to database');
});

pool.on('error', (err) => {
  console.error('Database error', err);
});

// run a query
export const query = async (text: string, params?: any[]) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
};

// get a client for transactions
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export default {
  pool,
  query,
  getClient,
};
