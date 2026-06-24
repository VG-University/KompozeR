/**
 * Maps domain CartError instances to HTTP JSON responses.
 * Unknown errors are masked as INTERNAL_ERROR.
 */
import { Request, Response, NextFunction } from 'express';
import { CartError } from '../../domain/entities/errors';

const CODE_TO_STATUS: Record<string, number> = {
  VALIDATION_ERROR: 422,
  CART_EMPTY: 409,
  ITEM_UNAVAILABLE: 409,
  PRICE_CHANGED: 409,
  CATALOG_LOOKUP_FAILED: 503,
  ORDER_SUBMISSION_FAILED: 503,
};

interface ApiError {
  error: {
    code: string;
    message: string;
    timestamp: string;
  };
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof CartError) {
    const status = CODE_TO_STATUS[err.code] ?? 500;
    const body: ApiError = {
      error: {
        code: err.code,
        message: err.message,
        timestamp: new Date().toISOString(),
      },
    };
    res.status(status).json(body);
    return;
  }

  console.error('[cart] Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
  });
}
