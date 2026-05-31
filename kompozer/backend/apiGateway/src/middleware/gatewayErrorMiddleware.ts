// gatewayErrorMiddleware — Gestione centralizzata degli errori del gateway.
// Traduce GatewayError in risposte JSON con il formato standard del progetto.
// Gli errori sconosciuti vengono oscurati come 500 INTERNAL_ERROR.
import { Request, Response, NextFunction } from 'express';
import { GatewayError } from '../errors';

export function gatewayErrorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof GatewayError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
  });
}
