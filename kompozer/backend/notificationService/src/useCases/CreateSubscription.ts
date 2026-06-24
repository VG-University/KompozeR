/**
 * Use case for creating/upserting a product notification subscription.
 */
import { randomUUID } from 'crypto';
import { NotificationSubscription } from '../domain/entities/Notification';
import { ValidationError } from '../domain/entities/errors';
import { NotificationRepository } from '../domain/ports/NotificationRepository';
import { NotificationSubscriptionDto, toSubscriptionDto } from './types';

export interface CreateSubscriptionInput {
  userId: string;
  scope: 'PRODUCT';
  targetId: string;
  events: Array<'PRICE_CHANGED' | 'AVAILABILITY_CHANGED'>;
  channel: 'IN_APP';
}

export class CreateSubscription {
  constructor(private readonly repo: NotificationRepository) {}

  async execute(input: CreateSubscriptionInput): Promise<NotificationSubscriptionDto> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }
    if (input.scope !== 'PRODUCT') {
      throw new ValidationError('scope must be PRODUCT');
    }
    if (!input.targetId?.trim()) {
      throw new ValidationError('targetId is required');
    }
    if (!Array.isArray(input.events) || input.events.length === 0) {
      throw new ValidationError('events must be a non-empty array');
    }
    if (input.channel !== 'IN_APP') {
      throw new ValidationError('channel must be IN_APP');
    }

    const now = new Date();
    const subscription: NotificationSubscription = {
      id: randomUUID(),
      userId: input.userId,
      scope: input.scope,
      targetId: input.targetId,
      events: [...new Set(input.events)],
      channel: input.channel,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.repo.upsertSubscription(subscription);
    return toSubscriptionDto(saved);
  }
}
