import { Router } from 'express';
import {
  registerStudent,
  getAllStudents,
  getOnlineStudents,
  removeStudent,
  getStudentById,
} from '../controllers/student.controller';
import { validateStudentRegister, validateUUID } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validateStudentRegister, registerStudent);
router.get('/', getAllStudents);
router.get('/online', getOnlineStudents);
router.get('/:id', validateUUID('id'), getStudentById);
router.delete('/:id', validateUUID('id'), removeStudent);

export default router;
