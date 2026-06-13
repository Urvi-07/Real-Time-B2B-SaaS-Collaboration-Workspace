import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
}

/**
 * Send a standardized success JSON response.
 */
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a standardized error JSON response.
 */
export const sendError = (
  res: Response,
  message: string,
  errors: unknown[] = [],
  statusCode = 500
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
