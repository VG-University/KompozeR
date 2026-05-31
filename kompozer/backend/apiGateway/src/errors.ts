// GatewayError — Errore interno del gateway, con codice leggibile dalla macchina.
// Usato dal gatewayErrorMiddleware per produrre risposte JSON uniformi.
export class GatewayError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

export class MissingTokenError extends GatewayError {
  constructor() {
    super('MISSING_TOKEN', 'Authorization header is required', 401);
  }
}

export class InvalidTokenError extends GatewayError {
  constructor() {
    super('INVALID_TOKEN', 'Token is invalid or expired', 401);
  }
}
