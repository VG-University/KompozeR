export class CadError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'CadError';
  }
}

export class ValidationError extends CadError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}

export class ResourceNotFoundError extends CadError {
  constructor(message: string) {
    super('RESOURCE_NOT_FOUND', message);
  }
}

export class ResourceConflictError extends CadError {
  constructor(message: string) {
    super('RESOURCE_CONFLICT', message);
  }
}
