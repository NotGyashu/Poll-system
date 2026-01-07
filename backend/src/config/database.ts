import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { config } from './index';

// Build pool config - use DATABASE_URL if available (Supabase), otherwise use individual vars
const poolConfig: PoolConfig = config.database.url
  ? {
      connectionString: config.database.url,
      ssl: {
        rejectUnauthorized: false, // Required for Supabase
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    };

export const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
  const dbType = config.database.url ? 'Supabase' : 'Local PostgreSQL';
  console.log(`📦 Connected to ${dbType} database`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Execute a query with optional parameters
 */
export const query = async <T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (config.nodeEnv === 'development') {
      console.log('Executed query', { 
        text: text.substring(0, 50), 
        duration, 
        rows: result.rowCount 
      });
    }
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 */
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

/**
 * Test database connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

/**
 * Close all database connections
 */
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('📦 Database pool closed');
};

export default {
  pool,
  query,
  getClient,
  testConnection,
  closePool,
};
