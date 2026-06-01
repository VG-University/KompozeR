// errorMiddleware — Middleware Express per la gestione centralizzata degli errori.
// Intercetta le istanze di AuthError lanciate dai use case e le traduce in risposte HTTP
// conformi al RESTErrorModel del progetto ({ error: { code, message, details, timestamp } }).
// Gli errori sconosciuti vengono oscurati e restituiti come 500 INTERNAL_ERROR.
import { Request, Response, NextFunction } from 'express';
import {
  AuthError,
  ValidationError,
  DuplicateUsernameError,
  DuplicateEmailError,
  InvalidCredentialsError,
  SessionNotFoundError,
  UserNotFoundError,
  SessionRevokedError,
  ForbiddenError,
} from '../../domain/entities/errors';

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown[];
    traceId?: string;
    timestamp: string;
  };
}

function statusFor(err: AuthError): number {
  if (err instanceof ValidationError) return 422;
  if (err instanceof DuplicateUsernameError || err instanceof DuplicateEmailError) return 409;
  if (err instanceof InvalidCredentialsError) return 401;
  if (err instanceof SessionNotFoundError || err instanceof UserNotFoundError) return 404;
  if (err instanceof SessionRevokedError) return 401;
  if (err instanceof ForbiddenError) return 403;
  return 500;
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AuthError) {
    const body: ApiError = {
      error: {
        code: err.code,
        message: err.message,
        timestamp: new Date().toISOString(),
      },
    };

    if (err instanceof ValidationError && err.details.length > 0) {
      body.error.details = err.details;
    }

    res.status(statusFor(err)).json(body);
    return;
  }

  // Unexpected error — do not leak internals
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
  });
}
