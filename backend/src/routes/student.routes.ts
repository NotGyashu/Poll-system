import { Router } from 'express';
import {
  registerStudent,
  getAllStudents,
  getOnlineStudents,
  removeStudent,
  getStudentById,
} from '../controllers/student.controller';

const router = Router();

router.post('/register', registerStudent);
router.get('/', getAllStudents);
router.get('/online', getOnlineStudents);
router.get('/:id', getStudentById);
router.delete('/:id', removeStudent);

export default router;
