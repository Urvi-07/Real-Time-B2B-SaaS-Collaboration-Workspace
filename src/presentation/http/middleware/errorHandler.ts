import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../../../infrastructure/errors/AppError';
import { logger } from '../../../infrastructure/logging/logger';
import { ZodError } from 'zod';
import { config } from '../../../infrastructure/config/config';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    
    if (!err.isOperational) {
      logger.error(`[AppError] System Error: ${err.message}`, { stack: err.stack });
    } else {
      logger.warn(`[AppError] Operational Error: ${err.message}`);
    }
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Failed';
    details = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    logger.warn(`[ValidationError] Schema validation failed: ${JSON.stringify(details)}`);
  } else {
    // Unhandled / system errors
    logger.error(`[UnhandledError] ${err.name}: ${err.message}`, { stack: err.stack });
    
    if (config.NODE_ENV === 'development') {
      message = err.message;
      details = err.stack;
    }
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(details && { details }),
  });
};
