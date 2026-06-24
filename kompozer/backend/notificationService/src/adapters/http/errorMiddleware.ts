/**
 * Maps NotificationError domain exceptions to HTTP JSON responses.
 * Unknown errors are returned as INTERNAL_ERROR.
 */
import { NextFunction, Request, Response } from 'express';
import { NotificationError } from '../../domain/entities/errors';

const CODE_TO_STATUS: Record<string, number> = {
  VALIDATION_ERROR: 422,
  NOTIFICATION_NOT_FOUND: 404,
  SUBSCRIPTION_NOT_FOUND: 404,
  FORBIDDEN: 403,
};

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof NotificationError) {
    const status = CODE_TO_STATUS[err.code] ?? 500;
    res.status(status).json({
      error: {
        code: err.code,
        message: err.message,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  console.error('[notification] Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
  });
}
