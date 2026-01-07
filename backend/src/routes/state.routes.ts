import { Router } from 'express';
import { getCurrentState } from '../controllers/state.controller';

const router = Router();

router.get('/current', getCurrentState);

export default router;
