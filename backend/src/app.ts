import express, { Application } from 'express';
import { corsMiddleware } from './config/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { swaggerServe, swaggerSetup } from './config/swagger';
import routes from './routes';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

// Swagger docs
app.use('/api-docs', swaggerServe, swaggerSetup);

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'Poll System API',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/health',
    api: '/api',
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
