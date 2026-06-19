import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodRawShape } from 'zod';

/**
 * Reusable Express middleware to validate request parameters, body, and query payloads.
 * Automatically delegates any validation errors to the global error-handling middleware.
 * 
 * @param schema Zod object schema containing body, query, and/or params validations.
 */
export const validateRequest = (schema: ZodObject<ZodRawShape>) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if (parsed.query !== undefined) {
        Object.defineProperty(req, 'query', {
          value: parsed.query,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      if (parsed.params !== undefined) {
        Object.defineProperty(req, 'params', {
          value: parsed.params,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
