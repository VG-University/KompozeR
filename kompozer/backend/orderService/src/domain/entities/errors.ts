export class OrderError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'OrderError';
  }
}

export class ValidationError extends OrderError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}

export class OrderNotFoundError extends OrderError {
  constructor(orderId: string) {
    super('ORDER_NOT_FOUND', `Order ${orderId} not found`);
  }
}

export class ForbiddenError extends OrderError {
  constructor(message: string) {
    super('FORBIDDEN', message);
  }
}

export class OrderAlreadyCancelledError extends OrderError {
  constructor(orderId: string) {
    super('ORDER_ALREADY_CANCELLED', `Order ${orderId} is already cancelled`);
  }
}
