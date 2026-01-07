import { Request, Response } from 'express';
import { studentService } from '../services/student.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const registerStudent = asyncHandler(async (req: Request, res: Response) => {
  const { name, session_id } = req.body;
  const student = await studentService.registerStudent({ name, session_id });
  res.status(201).json({ success: true, data: student });
});

export const getAllStudents = asyncHandler(async (_req: Request, res: Response) => {
  const students = await studentService.getAllStudents();
  res.json({ success: true, data: students });
});

export const getOnlineStudents = asyncHandler(async (_req: Request, res: Response) => {
  const students = await studentService.getOnlineStudents();
  res.json({ success: true, data: students });
});

export const removeStudent = asyncHandler(async (req: Request, res: Response) => {
  await studentService.removeStudent(req.params.id);
  res.json({ success: true, message: 'Student removed' });
});

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getStudentById(req.params.id);
  res.json({ success: true, data: student });
});
