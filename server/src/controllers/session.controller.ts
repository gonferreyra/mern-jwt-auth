import { NextFunction, Request, Response } from 'express';
import SessionModel from '../models/session.model';
import { z } from 'zod';
import appAssert from '../utils/appAssert';

export const getSessionsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessions = await SessionModel.find(
      {
        userId: req.userId,
        expiresAt: { $gt: new Date() },
      },
      {
        // options to show only the fields we want
        _id: 1,
        userAgent: 1,
        createdAt: 1,
      },
      {
        sort: { createdAt: -1 }, // sort that shows most recent sessions first
      }
    );

    // this will allow the user to delete it's sessiones. but NOT the current one
    res.status(200).json(
      sessions.map((session) => ({
        ...session.toObject(),
        ...(session.id === req.sessionId && {
          isCurrent: true,
        }),
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const deleteSessionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = z.string().parse(req.params.id);
    const deleted = await SessionModel.findByIdAndDelete({
      _id: sessionId,
      userId: req.userId, // check if the user making the req is the session owner
    });
    appAssert(deleted, 404, 'Session not found');
    res.status(200).json({ message: 'Session deleted.' });
  } catch (error) {
    next(error);
  }
};
