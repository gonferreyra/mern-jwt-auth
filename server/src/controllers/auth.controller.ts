import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createAccount } from '../services/auth.services';
import { setAuthCookies } from '../utils/cookies';

const registerSchema = z
  .object({
    email: z.string().email().min(1).max(255),
    password: z.string().min(6).max(255),
    confirmPassword: z.string().min(6).max(255),
    userAgent: z.string().optional(), // to know where the request is coming from
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request
    const request = registerSchema.parse({
      ...req.body,
      userAgent: req.headers['user-agent'],
    });

    // call service
    const { user, accessToken, refreshToken } = await createAccount(request);

    //set the cookies
    setAuthCookies({ res, accessToken, refreshToken }).status(201).json(user);
  } catch (error) {
    next(error);
  }
};
