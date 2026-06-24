/** Base error type for chatbot service failures. */
export class ChatbotError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ChatbotError';
  }
}

/** Raised when a request payload is missing required fields. */
export class ValidationError extends ChatbotError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}

/** Raised when a requested session cannot be found. */
export class SessionNotFoundError extends ChatbotError {
  constructor(sessionId: string) {
    super('SESSION_NOT_FOUND', `Session \"${sessionId}\" not found`);
  }
}

/** Raised when the caller tries to access another user's session. */
export class ForbiddenError extends ChatbotError {
  constructor(message: string) {
    super('FORBIDDEN', message);
  }
}

/** Raised when a closed session is mutated. */
export class SessionClosedError extends ChatbotError {
  constructor(sessionId: string) {
    super('SESSION_CLOSED', `Session \"${sessionId}\" is closed`);
  }
}

/** Raised when the service cannot retrieve catalog information. */
export class CatalogLookupError extends ChatbotError {
  constructor(message: string) {
    super('CATALOG_LOOKUP_FAILED', message);
  }
}
