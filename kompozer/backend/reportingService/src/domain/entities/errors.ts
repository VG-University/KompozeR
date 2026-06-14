export class ReportingError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ReportingError';
  }
}

export class ValidationError extends ReportingError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}
