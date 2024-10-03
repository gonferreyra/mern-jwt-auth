import { ErrorRequestHandler, Response } from 'express';
import { z } from 'zod';
import AppError from '../utils/AppError';
import { clearAuthCookies, REFRESH_PATH } from '../utils/cookies';

const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }));
  return res.status(400).json({
    message: error.message,
    errors,
  });
};

const handleAppError = (res: Response, error: AppError) => {
  res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH: ${req.path}`, error);

  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  if (error instanceof z.ZodError) {
    handleZodError(res, error);
    return;
  }

  if (error instanceof AppError) {
    handleAppError(res, error);
    return;
  }

  res.status(500).send('Internal Server Error');
  return;
};
