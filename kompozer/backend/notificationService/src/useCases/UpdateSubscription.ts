import {
  ForbiddenError,
  SubscriptionNotFoundError,
  ValidationError,
} from '../domain/entities/errors';
import { NotificationRepository } from '../domain/ports/NotificationRepository';
import { NotificationSubscriptionDto, toSubscriptionDto } from './types';

export interface UpdateSubscriptionInput {
  userId: string;
  subscriptionId: string;
  events?: Array<'PRICE_CHANGED' | 'AVAILABILITY_CHANGED'>;
  isActive?: boolean;
}

export class UpdateSubscription {
  constructor(private readonly repo: NotificationRepository) {}

  async execute(input: UpdateSubscriptionInput): Promise<NotificationSubscriptionDto> {
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
      throw new ForbiddenError('Cannot update another user subscription');
    }

    const events = input.events ? [...new Set(input.events)] : current.events;
    if (events.length === 0) {
      throw new ValidationError('events cannot be empty');
    }

    const updated = await this.repo.updateSubscription({
      ...current,
      events,
      isActive: input.isActive ?? current.isActive,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new SubscriptionNotFoundError(input.subscriptionId);
    }

    return toSubscriptionDto(updated);
  }
}
