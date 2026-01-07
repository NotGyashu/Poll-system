import { Router } from 'express';
import {
  createPoll,
  getAllPolls,
  getPollById,
  getActivePoll,
  startPoll,
  endPoll,
  getPollHistory,
} from '../controllers/poll.controller';

const router = Router();

router.post('/', createPoll);
router.get('/', getAllPolls);
router.get('/active', getActivePoll);
router.get('/history', getPollHistory);
router.get('/:id', getPollById);
router.patch('/:id/start', startPoll);
router.patch('/:id/end', endPoll);

export default router;
