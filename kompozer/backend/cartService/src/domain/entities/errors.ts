export class CartError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'CartError';
  }
}

export class ValidationError extends CartError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}
