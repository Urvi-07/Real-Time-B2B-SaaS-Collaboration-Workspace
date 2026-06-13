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

      req.body = parsed.body ?? req.body;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req.query = (parsed.query ?? req.query) as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req.params = (parsed.params ?? req.params) as any;

      next();
    } catch (error) {
      next(error);
    }
  };
};
