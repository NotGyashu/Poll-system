import express, { Application } from 'express';
import { corsMiddleware } from './config/cors';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(corsMiddleware);

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
