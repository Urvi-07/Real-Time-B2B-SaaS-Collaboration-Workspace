import { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from './validateRequest';
import { ZodError } from 'zod';

describe('validateRequest Middleware', () => {
  const schema = z.object({
    body: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      age: z.coerce.number().optional(),
    }),
  });

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should call next() and update req.body if validation passes', async () => {
    mockRequest.body = { name: 'John Doe', age: '30' };
    
    const middleware = validateRequest(schema);
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
    expect(mockRequest.body).toEqual({ name: 'John Doe', age: 30 });
  });

  it('should call next(error) with ZodError if validation fails', async () => {
    mockRequest.body = { name: 'J' };
    
    const middleware = validateRequest(schema);
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
    const error = nextFunction.mock.calls[0][0];
    expect(error).toBeInstanceOf(ZodError);
    expect(error.issues[0].message).toBe('Name must be at least 2 characters');
  });
});
