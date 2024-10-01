import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createAccount, loginUser } from '../services/auth.service';
import { setAuthCookies } from '../utils/cookies';
import { loginSchema, registerSchema } from './auth.schemas';

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

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request
    const request = loginSchema.parse({
      ...req.body,
      userAgent: req.headers['user-agent'],
    });

    // call service
    const { accessToken, refreshToken } = await loginUser(request);

    setAuthCookies({ res, accessToken, refreshToken }).status(200).json({
      message: 'Login successful.',
    });
  } catch (error) {
    next(error);
  }
};
