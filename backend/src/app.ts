import express, { Application } from 'express';
import { corsMiddleware } from './config/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { swaggerServe, swaggerSetup } from './config/swagger';
import routes from './routes';

const app: Application = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(corsMiddleware);

// Swagger docs
app.use('/api-docs', swaggerServe, swaggerSetup);

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export default app;
