import { Router } from 'express';
import pollRoutes from './poll.routes';
import voteRoutes from './vote.routes';
import studentRoutes from './student.routes';
import stateRoutes from './state.routes';
import { healthCheck } from '../config/database';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    message: 'Poll System API',
    version: '1.0.0',
    endpoints: {
      polls: '/api/polls',
      votes: '/api/votes',
      students: '/api/students',
      state: '/api/state',
      health: '/api/health',
    },
  });
});

router.get('/health', async (_req, res) => {
  const dbOk = await healthCheck();
  const status = dbOk ? 'healthy' : 'degraded';
  
  res.status(dbOk ? 200 : 503).json({
    status,
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

router.use('/polls', pollRoutes);
router.use('/votes', voteRoutes);
router.use('/students', studentRoutes);
router.use('/state', stateRoutes);

export default router;
