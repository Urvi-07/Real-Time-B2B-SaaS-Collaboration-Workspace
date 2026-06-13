import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../../../infrastructure/errors/AppError';
import { logger } from '../../../infrastructure/logging/logger';
import { ZodError } from 'zod';
import { config } from '../../../infrastructure/config/config';
import { sendError } from '../utils/apiResponse';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown[];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    
    if (!err.isOperational) {
      logger.error(`[AppError] System Error: ${err.message}`, { stack: err.stack });
    } else {
      logger.warn(`[AppError] Operational Error: ${err.message}`);
    }
    errors = [{ message: err.message }];
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Failed';
    errors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    logger.warn(`[ValidationError] Schema validation failed: ${JSON.stringify(errors)}`);
  } else {
    logger.error(`[UnhandledError] ${err.name}: ${err.message}`, { stack: err.stack });
    
    if (config.NODE_ENV === 'development') {
      message = err.message;
      errors = [{ message: err.message, stack: err.stack }];
    } else {
      errors = [{ message: 'Internal Server Error' }];
    }
  }

  sendError(res, message, errors, statusCode);
};
