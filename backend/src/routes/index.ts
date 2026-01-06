import { Router } from 'express';

const router = Router();

// Placeholder routes
router.get('/', (_req, res) => {
  res.json({
    message: 'Poll System API',
    version: '1.0.0',
    endpoints: {
      polls: '/api/polls',
      votes: '/api/votes',
      students: '/api/students',
      state: '/api/state',
    },
  });
});

export default router;
