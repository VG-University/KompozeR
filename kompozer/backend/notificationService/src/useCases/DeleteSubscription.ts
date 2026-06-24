/**
 * Use case for deactivating an existing subscription.
 */
import {
  ForbiddenError,
  SubscriptionNotFoundError,
  ValidationError,
} from '../domain/entities/errors';
import { NotificationRepository } from '../domain/ports/NotificationRepository';

export interface DeleteSubscriptionInput {
  userId: string;
  subscriptionId: string;
}

export class DeleteSubscription {
  constructor(private readonly repo: NotificationRepository) {}

  async execute(input: DeleteSubscriptionInput): Promise<void> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }
    if (!input.subscriptionId?.trim()) {
      throw new ValidationError('subscriptionId is required');
    }

    const current = await this.repo.findSubscriptionById(input.subscriptionId);
    if (!current) {
      throw new SubscriptionNotFoundError(input.subscriptionId);
    }
    if (current.userId !== input.userId) {
      throw new ForbiddenError('Cannot delete another user subscription');
    }

    const deactivated = await this.repo.deactivateSubscription(input.subscriptionId, new Date());
    if (!deactivated) {
      throw new SubscriptionNotFoundError(input.subscriptionId);
    }
  }
}
