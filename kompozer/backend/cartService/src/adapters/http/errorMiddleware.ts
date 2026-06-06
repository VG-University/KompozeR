import { Request, Response, NextFunction } from 'express';
import { CartError } from '../../domain/entities/errors';

const CODE_TO_STATUS: Record<string, number> = {
  VALIDATION_ERROR: 422,
};

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof CartError) {
    const status = CODE_TO_STATUS[err.code] ?? 500;
    res.status(status).json({ code: err.code, message: err.message });
    return;
  }

  console.error('[cart] Unhandled error:', err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' });
}
