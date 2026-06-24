/**
 * Use case for counting unread notifications of a user.
 */
import { ValidationError } from '../domain/entities/errors';
import { NotificationRepository } from '../domain/ports/NotificationRepository';

export interface CountUnreadNotificationsInput {
  userId: string;
}

export interface CountUnreadNotificationsOutput {
  count: number;
}

export class CountUnreadNotifications {
  constructor(private readonly repo: NotificationRepository) {}

  async execute(input: CountUnreadNotificationsInput): Promise<CountUnreadNotificationsOutput> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }
    const count = await this.repo.countUnread(input.userId);
    return { count };
  }
}
