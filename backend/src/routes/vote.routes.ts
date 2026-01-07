import { Router } from 'express';
import { submitVote, getPollResults, checkVoted } from '../controllers/vote.controller';
import { voteLimiter } from '../middleware/rateLimiter';
import { validateVoteSubmit, validateUUID } from '../middleware/validation';

const router = Router();

router.post('/', voteLimiter, validateVoteSubmit, submitVote);
router.get('/check', checkVoted);
router.get('/polls/:id/results', validateUUID('id'), getPollResults);

export default router;
