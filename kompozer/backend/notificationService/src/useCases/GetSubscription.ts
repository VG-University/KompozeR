/**
 * Use case for retrieving one subscription owned by requesting user.
 */
import { ForbiddenError, SubscriptionNotFoundError, ValidationError } from '../domain/entities/errors';
import { NotificationRepository } from '../domain/ports/NotificationRepository';
import { NotificationSubscriptionDto, toSubscriptionDto } from './types';

export interface GetSubscriptionInput {
  userId: string;
  subscriptionId: string;
}

export class GetSubscription {
  constructor(private readonly repo: NotificationRepository) {}

  async execute(input: GetSubscriptionInput): Promise<NotificationSubscriptionDto> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }
    if (!input.subscriptionId?.trim()) {
      throw new ValidationError('subscriptionId is required');
    }

    const sub = await this.repo.findSubscriptionById(input.subscriptionId);
    if (!sub) {
      throw new SubscriptionNotFoundError(input.subscriptionId);
    }
    if (sub.userId !== input.userId) {
      throw new ForbiddenError('Cannot access another user subscription');
    }
    return toSubscriptionDto(sub);
  }
}
