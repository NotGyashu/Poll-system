import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';

export const validatePollCreate = (req: Request, _res: Response, next: NextFunction) => {
  const { question, options } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    throw new BadRequestError('Question is required');
  }

  if (!options || !Array.isArray(options) || options.length < 2) {
    throw new BadRequestError('At least 2 options are required');
  }

  for (const opt of options) {
    // Support both string options and object options with text property
    if (typeof opt === 'string') {
      if (opt.trim().length === 0) {
        throw new BadRequestError('All options must be non-empty strings');
      }
    } else if (typeof opt === 'object' && opt !== null) {
      if (typeof opt.text !== 'string' || opt.text.trim().length === 0) {
        throw new BadRequestError('All options must have non-empty text');
      }
    } else {
      throw new BadRequestError('Invalid option format');
    }
  }

  next();
};

export const validateVoteSubmit = (req: Request, _res: Response, next: NextFunction) => {
  const { poll_id, option_id, student_id } = req.body;

  if (!poll_id || typeof poll_id !== 'string') {
    throw new BadRequestError('poll_id is required');
  }

  if (!option_id || typeof option_id !== 'string') {
    throw new BadRequestError('option_id is required');
  }

  if (!student_id || typeof student_id !== 'string') {
    throw new BadRequestError('student_id is required');
  }

  next();
};

export const validateStudentRegister = (req: Request, _res: Response, next: NextFunction) => {
  const { name, session_id } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new BadRequestError('Name is required');
  }

  if (!session_id || typeof session_id !== 'string') {
    throw new BadRequestError('session_id is required');
  }

  next();
};

export const validateUUID = (paramName: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!id || !uuidRegex.test(id)) {
      throw new BadRequestError(`Invalid ${paramName}`);
    }

    next();
  };
};
