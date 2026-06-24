import { NextFunction, Request, Response } from 'express';
import { ChatbotError } from '../../domain/entities/errors';

const CODE_TO_STATUS: Record<string, number> = {
  VALIDATION_ERROR: 422,
  SESSION_NOT_FOUND: 404,
  FORBIDDEN: 403,
  SESSION_CLOSED: 409,
  CATALOG_LOOKUP_FAILED: 503,
};

/** Maps chatbot domain errors to API responses. */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ChatbotError) {
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

  console.error('[chatbot] Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
  });
}
