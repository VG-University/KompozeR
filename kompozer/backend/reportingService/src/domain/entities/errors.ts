/** Base error type for reporting service failures. */
export class ReportingError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ReportingError';
  }
}

/** Raised when a reporting request contains invalid input. */
export class ValidationError extends ReportingError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}
