import cors, { CorsOptions } from 'cors';
import { config } from './index';

const allowedOrigins = [
  'http://localhost:3000', // React dev server
  'http://localhost:5173', // Vite dev server
  config.frontendUrl,
].filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
};

export const corsMiddleware = cors(corsOptions);
