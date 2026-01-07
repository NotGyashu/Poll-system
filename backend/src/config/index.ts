import dotenv from 'dotenv';import dotenv from 'dotenv';
































export default config;};  },    minDuration: parseInt(process.env.MIN_POLL_DURATION || '10', 10),    maxDuration: parseInt(process.env.MAX_POLL_DURATION || '300', 10),    defaultDuration: parseInt(process.env.DEFAULT_POLL_DURATION || '60', 10),  poll: {  // Poll settings  },    password: process.env.DB_PASSWORD || 'postgres',    user: process.env.DB_USER || 'postgres',    name: process.env.DB_NAME || 'poll_system',    port: parseInt(process.env.DB_PORT || '5432', 10),    host: process.env.DB_HOST || 'localhost',    url: process.env.DATABASE_URL, // For Supabase/hosted databases  database: {  // Database - supports both DATABASE_URL (Supabase/production) and individual vars (local)  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',  // Frontend  nodeEnv: process.env.NODE_ENV || 'development',  port: parseInt(process.env.PORT || '5000', 10),  // Serverexport const config = {dotenv.config();// Load environment variables
// Load environment variables
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'poll_system',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },

  // Poll settings
  poll: {
    defaultDuration: parseInt(process.env.DEFAULT_POLL_DURATION || '60', 10),
    maxDuration: parseInt(process.env.MAX_POLL_DURATION || '300', 10),
    minDuration: parseInt(process.env.MIN_POLL_DURATION || '10', 10),
  },
};

export default config;
