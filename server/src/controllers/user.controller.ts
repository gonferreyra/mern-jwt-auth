import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/user.model';
import appAssert from '../utils/appAssert';

export const getUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.userId, req.sessionId);
    const user = await UserModel.findById(req.userId);
    appAssert(user, 404, 'User not found');

    res.status(200).json(user.omitPassword());
  } catch (error) {
    next(error);
  }
};
