import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './errorHandler';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const messages = error.errors?.map((e: any) => e.message).join(', ') || 'Validation failed';
      next(new AppError(messages, 400));
    }
  };
};
