import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as chatController from '../controllers/chat.controller';

const router = Router();

router.get('/', asyncHandler(chatController.getMessages));
router.post('/', asyncHandler(chatController.sendMessage));
router.delete('/:id', asyncHandler(chatController.deleteMessage));

export default router;
