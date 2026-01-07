import { Request, Response } from 'express';
import { stateService } from '../services/state.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getCurrentState = asyncHandler(async (req: Request, res: Response) => {
  const studentId = req.query.student_id as string | undefined;
  const sessionId = req.query.session_id as string | undefined;

  const state = await stateService.getStudentState(
    studentId || null,
    sessionId || null
  );

  res.json({ success: true, data: state });
});

export const getTeacherState = asyncHandler(async (_req: Request, res: Response) => {
  const state = await stateService.getTeacherState();
  res.json({ success: true, data: state });
});
