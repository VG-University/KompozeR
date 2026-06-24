/**
 * Use case for listing subscriptions owned by the requesting user.
 */
import { ValidationError } from '../domain/entities/errors';
import { NotificationRepository } from '../domain/ports/NotificationRepository';
import { NotificationSubscriptionDto, toSubscriptionDto } from './types';

export interface ListSubscriptionsInput {
  userId: string;
}

export interface ListSubscriptionsOutput {
  items: NotificationSubscriptionDto[];
}

export class ListSubscriptions {
  constructor(private readonly repo: NotificationRepository) {}

  async execute(input: ListSubscriptionsInput): Promise<ListSubscriptionsOutput> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }
    const items = await this.repo.listSubscriptions(input.userId);
    return { items: items.map(toSubscriptionDto) };
  }
}
