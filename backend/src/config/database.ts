import { Pool, PoolClient } from 'pg';
import { config } from './index';

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

let isConnected = false;
let hasLoggedConnection = false;

pool.on('connect', () => {
  isConnected = true;
  if (!hasLoggedConnection) {
    hasLoggedConnection = true;
    console.log('Database connected');
  }
});

pool.on('error', (err) => {
  isConnected = false;
  console.error('Database error:', err.message);
});

export const query = async (text: string, params?: any[], retries = 3): Promise<any> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (err: any) {
      console.error(`Query attempt ${attempt} failed:`, err.message);
      
      if (attempt === retries) {
        throw new Error('Database temporarily unavailable');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

export const getClient = async (retries = 3): Promise<PoolClient> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      return client;
    } catch (err: any) {
      console.error(`Connection attempt ${attempt} failed:`, err.message);
      
      if (attempt === retries) {
        throw new Error('Database temporarily unavailable');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error('Database temporarily unavailable');
};

export const isDbConnected = (): boolean => isConnected;

export const healthCheck = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT 1');
    isConnected = true;
    return true;
  } catch {
    isConnected = false;
    return false;
  }
};

export default { pool, query, getClient, isDbConnected, healthCheck };
