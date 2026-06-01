// errors — Gerarchia di errori di dominio per il catalogService.
// CatalogError è la classe base con un campo `code` leggibile dalla macchina.
// Le sottoclassi coprono tutti i casi di errore applicativo e vengono
// tradotti in HTTP dall'errorMiddleware (404, 409, 400, 422).
export class CatalogError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'CatalogError';
  }
}

// 404 — il componente non esiste (by id o by sku)
export class ComponentNotFoundError extends CatalogError {
  constructor(identifier: string) {
    super('COMPONENT_NOT_FOUND', `Component "${identifier}" not found`);
  }
}

// 409 — uno SKU identico è già presente nel catalogo
export class DuplicateSkuError extends CatalogError {
  constructor(sku: string) {
    super('DUPLICATE_SKU', `SKU "${sku}" is already registered in the catalog`);
  }
}

// 422 — dati di input non validi (campo mancante, valore fuori range, ecc.)
export class ValidationError extends CatalogError {
  constructor(
    message: string,
    public readonly details: { field: string; reason: string }[],
  ) {
    super('VALIDATION_ERROR', message);
  }
}

// 409 — stock esaurito (usato da cartService quando decrementa lo stock)
export class InsufficientStockError extends CatalogError {
  constructor(sku: string, available: number) {
    super(
      'INSUFFICIENT_STOCK',
      `Insufficient stock for SKU "${sku}": ${available} unit(s) available`,
    );
  }
}

// 409 — [DS] conflitto di versione da optimistic concurrency control
export class VersionConflictError extends CatalogError {
  constructor(id: string, expected: number, actual: number) {
    super(
      'VERSION_CONFLICT',
      `Component "${id}": expected version ${expected}, got ${actual}. Reload and retry.`,
    );
  }
}
