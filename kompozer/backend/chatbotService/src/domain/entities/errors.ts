export class ChatbotError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ChatbotError';
  }
}

export class ValidationError extends ChatbotError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}

export class SessionNotFoundError extends ChatbotError {
  constructor(sessionId: string) {
    super('SESSION_NOT_FOUND', `Session \"${sessionId}\" not found`);
  }
}

export class ForbiddenError extends ChatbotError {
  constructor(message: string) {
    super('FORBIDDEN', message);
  }
}

export class SessionClosedError extends ChatbotError {
  constructor(sessionId: string) {
    super('SESSION_CLOSED', `Session \"${sessionId}\" is closed`);
  }
}

export class CatalogLookupError extends ChatbotError {
  constructor(message: string) {
    super('CATALOG_LOOKUP_FAILED', message);
  }
}
