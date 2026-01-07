import { Router } from 'express';
import pollRoutes from './poll.routes';
import voteRoutes from './vote.routes';
import studentRoutes from './student.routes';
import stateRoutes from './state.routes';

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
    },
  });
});

router.use('/polls', pollRoutes);
router.use('/votes', voteRoutes);
router.use('/students', studentRoutes);
router.use('/state', stateRoutes);

export default router;
