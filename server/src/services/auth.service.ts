import VerificationCodeTypes from '../constants/verificationCodeTypes';
import SessionModel from '../models/session.model';
import UserModel from '../models/user.model';
import VerificationCodeModel from '../models/verificationCode.model';
import {
  fiveMinutesAgo,
  ONE_DAY_MS,
  oneHourFromNow,
  oneYearFromNow,
  thirtyDaysFromNow,
} from '../utils/date';
import { APP_ORIGIN, JWT_REFRESH_SECRET, JWT_SECRET } from '../constants/env';
import jwt from 'jsonwebtoken';
import appAssert from '../utils/appAssert';
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from '../utils/jwt';

import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from '../utils/emailTemplates';
import { sendMail } from '../utils/sendMail';
import { hashValue } from '../utils/bcrypt';

type CreateAccoutParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccoutParams) => {
  // verify existing user
  const existingUser = await UserModel.exists({
    email: data.email,
  });

  // custom error
  appAssert(!existingUser, 409, 'Email already in use');

  // create user
  const user = await UserModel.create({
    email: data.email,
    password: data.password,
  });

  // create verification code
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeTypes.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  // send verification email
  const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;
  const { error } = await sendMail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });

  if (error) {
    console.log(error);
  }

  // create session
  const session = await SessionModel.create({
    userId: user._id,
    userAgent: data.userAgent,
  });

  // sign access token & refresh token
  const refreshToken = jwt.sign(
    { sessionId: session._id },
    JWT_REFRESH_SECRET,
    {
      audience: ['user'],
      expiresIn: '30d',
    }
  );

  const accessToken = jwt.sign(
    { userId: user._id, sessionId: session._id },
    JWT_SECRET,
    {
      audience: ['user'],
      expiresIn: '15m',
    }
  );

  // return user & tokens
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

type LoginParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const loginUser = async ({
  email,
  password,
  userAgent,
}: LoginParams) => {
  // get the user by email
  const user = await UserModel.findOne({ email });
  appAssert(user, 401, 'Invalid email or password.');

  // validate password from the request
  const isValid = await user.comparePassword(password);
  appAssert(isValid, 401, 'Invalid email or password.');

  const userID = user._id;
  // create a session
  const session = await SessionModel.create({
    sessionId: userID,
    userAgent,
  });

  // token payload
  const sessionInfo = {
    sessionId: session._id,
  };
  // sign access token & refresh token
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

  const accessToken = signToken({ ...sessionInfo, sessionId: session._id });

  // return user & tokens
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const refreshUserAccessToken = async (token: string) => {
  // verify token
  const { payload } = verifyToken<RefreshTokenPayload>(token, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, 401, 'Invalid refresh token.');

  // validate session
  const session = await SessionModel.findById(payload.sessionId);
  appAssert(
    session && session.expiresAt.getTime() > Date.now(),
    401,
    'Session expired.'
  );

  // refresh the session if it expires in the next 24 hours
  const sessionNeedsRefresh =
    session.expiresAt.getTime() - Date.now() < ONE_DAY_MS;

  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken(
        {
          sessionId: session._id,
        },
        refreshTokenSignOptions
      )
    : undefined;

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session._id,
  });

  return {
    accessToken,
    newRefreshToken,
  };
};

export const verifyEmail = async (code: string) => {
  // get the verification code
  const validCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeTypes.EmailVerification,
    // $gt: mongo operator "greater than"
    expiresAt: { $gt: Date.now() },
  });
  appAssert(validCode, 404, 'Invalid or expired verification code');

  // update user to verified true
  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    {
      verified: true,
    },
    { new: true }
  );
  appAssert(updatedUser, 500, 'Failed to verify email');

  // delete verification code
  await validCode.deleteOne();

  // return user
  return {
    user: updatedUser.omitPassword(),
  };
};

export const sendPasswordResetEmail = async (email: string) => {
  // get the user by email
  const user = await UserModel.findOne({ email });
  appAssert(user, 404, 'User not found');

  // check email rate limit - don't allow more than 1 requests in 5 minutes
  const fiveMinAgo = fiveMinutesAgo();
  const count = await VerificationCodeModel.countDocuments({
    userId: user._id,
    type: VerificationCodeTypes.PasswordReset,
    createdAt: { $gt: fiveMinAgo },
  });
  appAssert(
    count <= 1,
    429,
    'Too many password reset requests, please try again later.'
  );

  // create verification code
  const expiresAt = oneHourFromNow();
  const verificationcode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeTypes.PasswordReset,
    expiresAt,
  });

  // send verification email with code and expiresAt. If it's expired, the code will be invalid
  const url = `${APP_ORIGIN}/password/reset?code=${
    verificationcode._id
  }&exp=${expiresAt.getTime()}`;

  const { data, error } = await sendMail({
    to: user.email,
    ...getPasswordResetTemplate(url),
  });
  appAssert(data?.id, 500, `${error?.name} - ${error?.message}`);

  // return success
  return {
    url,
    emailId: data?.id,
  };
};

type ResetPasswordParams = {
  password: string;
  verificationCode: string;
};

export const resetPassword = async ({
  password,
  verificationCode,
}: ResetPasswordParams) => {
  // get the verification code
  const validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeTypes.PasswordReset,
    expiresAt: { $gt: Date.now() }, // check if code is not expired
  });
  appAssert(validCode, 404, 'Invalid or expired verification code');

  // update the users password
  const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, {
    password: await hashValue(password),
  });
  appAssert(updatedUser, 500, 'Failed to reset password');

  // delete the verification code
  await validCode.deleteOne();

  // delete all sessions
  await SessionModel.deleteMany({
    userId: updatedUser._id,
  });

  return {
    user: updatedUser.omitPassword(),
  };
};
