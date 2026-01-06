import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../config';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    stack?: string;
  };
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error:', err);

  const response: ErrorResponse = {
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  };

  // Handle known application errors
  if (err instanceof AppError) {
    response.error.message = err.message;
    response.error.code = err.code;

    // Include stack trace in development
    if (config.nodeEnv === 'development') {
      response.error.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    response.error.message = 'Invalid JSON payload';
    response.error.code = 'INVALID_JSON';
    res.status(400).json(response);
    return;
  }

  // Include stack trace in development for unknown errors
  if (config.nodeEnv === 'development') {
    response.error.stack = err.stack;
    response.error.message = err.message;
  }

  // Handle unknown errors
  res.status(500).json(response);
};

/**
 * Handle 404 - Route not found
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Resource not found',
      code: 'NOT_FOUND',
    },
  });
};
