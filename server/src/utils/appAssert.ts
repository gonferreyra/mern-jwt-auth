import assert from 'node:assert';
import AppError from './AppError';
import { HttpStatusCode } from '../constants/http';
import { AppErrorCode } from '../constants/appErrorCode';

// this type defines a function that asserts a condition and throws an AppError if the condition is falsy
type appAssert = (
  condition: any,
  httpStatusCode: HttpStatusCode,
  message: string,
  appErrorCode?: AppErrorCode
) => asserts condition;

/**
 * Asserts a condition and throws an AppError if the condition is falsy
 */

const appAssert: appAssert = (
  condition,
  httpStatusCode,
  message,
  appErrorCode
) => assert(condition, new AppError(httpStatusCode, message, appErrorCode));

export default appAssert;
