import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createAccount,
  loginUser,
  refreshUserAccessToken,
  resetPassword,
  sendPasswordResetEmail,
  verifyEmail,
} from '../services/auth.service';
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from '../utils/cookies';
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationCodeSchema,
} from './auth.schemas';
import { verifyToken } from '../utils/jwt';
import SessionModel from '../models/session.model';
import appAssert from '../utils/appAssert';

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

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;
    const { payload, error } = verifyToken(accessToken);

    if (payload) {
      // delete the session
      await SessionModel.findByIdAndDelete(payload.sessionId);
    }

    // clear the cookies
    clearAuthCookies(res).status(200).json({
      message: 'Logout successful.',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request
    const refreshToken = req.cookies.refreshToken || '';
    appAssert(refreshToken, 401, 'Missing refresh token.');

    // call service
    const { accessToken, newRefreshToken } = await refreshUserAccessToken(
      refreshToken
    );

    // set the cookies for refreshToken
    if (newRefreshToken) {
      res.cookie(
        'refreshToken',
        newRefreshToken,
        getRefreshTokenCookieOptions()
      );
    }

    res
      .status(200)
      .cookie('accessToken', accessToken, getAccessTokenCookieOptions()) // cokies for accessToken
      .json({
        message: 'Access token refreshed.',
      });
  } catch (error) {
    next(error);
  }
};
//verification code: takes the verificationCodeId, grabs the userId from the code and update the verify on that user to true
export const verifyEmailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request
    const verificationCode = verificationCodeSchema.parse(req.params.code);

    // call service
    await verifyEmail(verificationCode);

    res.status(200).json({
      message: 'Email was successfully verified.',
    });
  } catch (error) {
    next(error);
  }
};

export const sendPasswordResetHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request
    const email = emailSchema.parse(req.body.email);

    // call service
    await sendPasswordResetEmail(email);

    res.status(200).json({
      message: 'Password reset email sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request
    const request = resetPasswordSchema.parse(req.body);

    // call service
    await resetPassword(request);

    clearAuthCookies(res).status(200).json({
      message: 'Password reset successful.',
    });
  } catch (error) {
    next(error);
  }
};
