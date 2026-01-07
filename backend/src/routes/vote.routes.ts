import { Router } from 'express';
import { submitVote, getPollResults, checkVoted } from '../controllers/vote.controller';

const router = Router();

router.post('/', submitVote);
router.get('/check', checkVoted);
router.get('/polls/:id/results', getPollResults);

export default router;
