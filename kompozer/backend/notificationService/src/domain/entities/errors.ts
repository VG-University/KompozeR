export class NotificationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}

export class ValidationError extends NotificationError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}

export class NotificationNotFoundError extends NotificationError {
  constructor(notificationId: string) {
    super('NOTIFICATION_NOT_FOUND', `Notification "${notificationId}" not found`);
  }
}

export class ForbiddenError extends NotificationError {
  constructor(message: string) {
    super('FORBIDDEN', message);
  }
}

export class SubscriptionNotFoundError extends NotificationError {
  constructor(subscriptionId: string) {
    super('SUBSCRIPTION_NOT_FOUND', `Subscription "${subscriptionId}" not found`);
  }
}