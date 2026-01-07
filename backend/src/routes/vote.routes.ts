import { Router } from 'express';
import { submitVote, getPollResults, checkVoted } from '../controllers/vote.controller';
import { voteLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', voteLimiter, submitVote);
router.get('/check', checkVoted);
router.get('/polls/:id/results', getPollResults);

export default router;
