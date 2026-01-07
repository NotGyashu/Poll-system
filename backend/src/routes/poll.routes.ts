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
import { validatePollCreate, validateUUID } from '../middleware/validation';

const router = Router();

router.post('/', validatePollCreate, createPoll);
router.get('/', getAllPolls);
router.get('/active', getActivePoll);
router.get('/history', getPollHistory);
router.get('/:id', validateUUID('id'), getPollById);
router.patch('/:id/start', validateUUID('id'), startPoll);
router.patch('/:id/end', validateUUID('id'), endPoll);

export default router;
