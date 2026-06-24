/**
 * Maps domain errors to HTTP JSON responses.
 * Maps CatalogError `code` values to proper HTTP status codes.
 * Unknown errors are returned as 500.
 */
import { Request, Response, NextFunction } from 'express';
import { CatalogError }                    from '../../domain/entities/errors';

const CODE_TO_STATUS: Record<string, number> = {
  COMPONENT_NOT_FOUND:  404,
  DUPLICATE_SKU:        409,
  VERSION_CONFLICT:     409,
  VALIDATION_ERROR:     422,
  INSUFFICIENT_STOCK:   409,
};

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown[];
    timestamp: string;
  };
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof CatalogError) {
    const status = CODE_TO_STATUS[err.code] ?? 500;
    const body: ApiError = {
      error: {
        code: err.code,
        message: err.message,
        timestamp: new Date().toISOString(),
      },
    };

    if ('details' in err && Array.isArray((err as { details?: unknown[] }).details)) {
      const details = (err as { details?: unknown[] }).details;
      if (details && details.length > 0) {
        body.error.details = details;
      }
    }

    res.status(status).json(body);
    return;
  }

  console.error('[catalog] Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
  });
}
