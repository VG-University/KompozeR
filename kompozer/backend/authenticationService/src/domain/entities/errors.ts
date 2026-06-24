/**
 * Domain error hierarchy for the Authentication Service.
 *
 * AuthError is the base class with a machine-readable `code`.
 * Subclasses cover application error scenarios (credentials, duplicates,
 * sessions, authorization, validation) and are mapped to HTTP by errorMiddleware.
 */
export class AuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('INVALID_CREDENTIALS', 'Invalid username or password');
  }
}

export class InvalidPasswordError extends AuthError {
  constructor() {
    super('INVALID_CREDENTIALS', 'Invalid username or password');
  }
}

export class DuplicateUsernameError extends AuthError {
  constructor(username: string) {
    super('DUPLICATE_USERNAME', `Username "${username}" is already taken`);
  }
}

export class DuplicateEmailError extends AuthError {
  constructor(email: string) {
    super('DUPLICATE_EMAIL', `Email "${email}" is already registered`);
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super('RESOURCE_NOT_FOUND', 'User not found');
  }
}

export class SessionNotFoundError extends AuthError {
  constructor() {
    super('RESOURCE_NOT_FOUND', 'Session not found');
  }
}

export class SessionRevokedError extends AuthError {
  constructor() {
    super('SESSION_REVOKED', 'Session has been revoked');
  }
}

export class ForbiddenError extends AuthError {
  constructor() {
    super('FORBIDDEN', 'You do not have permission to perform this action');
  }
}

export class ValidationError extends AuthError {
  constructor(
    message: string,
    public readonly details: { field: string; reason: string }[],
  ) {
    super('VALIDATION_ERROR', message);
  }
}
