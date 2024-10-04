import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectToDatabase from './config/db';
import { NODE_ENV, PORT, APP_ORIGIN } from './constants/env';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.route';
import authenticate from './middleware/authenticate';
import userRoutes from './routes/user.route';

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN, // only this IP con access our api
    credentials: true, // allow session cookie from browser to pass through
  })
);
app.use(cookieParser());

app.get('/', async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'healthy',
    });
  } catch (error) {
    next(error);
  }
});

// auth routes
app.use('/auth', authRoutes);

// protected routes
app.use('/user', authenticate, userRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} enviroment.`);
  await connectToDatabase();
});
