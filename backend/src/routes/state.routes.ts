import { Router } from 'express';
import { getCurrentState, getTeacherState } from '../controllers/state.controller';

const router = Router();

router.get('/current', getCurrentState);
router.get('/teacher', getTeacherState);

export default router;
