// errorMiddleware — Traduce gli errori di dominio in risposte HTTP JSON.
// Mappa i `code` dei CatalogError agli status code HTTP appropriati.
// Qualsiasi errore non riconosciuto viene restituito come 500.
import { Request, Response, NextFunction } from 'express';
import { CatalogError }                    from '../../domain/entities/errors';

const CODE_TO_STATUS: Record<string, number> = {
  COMPONENT_NOT_FOUND:  404,
  DUPLICATE_SKU:        409,
  VERSION_CONFLICT:     409,
  VALIDATION_ERROR:     422,
  INSUFFICIENT_STOCK:   409,
};

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof CatalogError) {
    const status = CODE_TO_STATUS[err.code] ?? 500;
    res.status(status).json({ code: err.code, message: err.message });
    return;
  }

  console.error('[catalog] Unhandled error:', err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' });
}
