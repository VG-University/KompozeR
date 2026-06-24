/**
 * Use case for paginated notification listing.
 */
import { ValidationError } from '../domain/entities/errors';
import { NotificationRepository } from '../domain/ports/NotificationRepository';
import { NotificationDto, toNotificationDto } from './types';

export interface ListNotificationsInput {
  userId: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface ListNotificationsOutput {
  items: NotificationDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListNotifications {
  constructor(private readonly repo: NotificationRepository) {}

  async execute(input: ListNotificationsInput): Promise<ListNotificationsOutput> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }

    const page = Number.isInteger(input.page) && (input.page as number) > 0 ? (input.page as number) : 1;
    const limitRaw = Number.isInteger(input.limit) && (input.limit as number) > 0 ? (input.limit as number) : 20;
    const limit = Math.min(limitRaw, 100);
    const unreadOnly = Boolean(input.unreadOnly);

    const result = await this.repo.list({
      userId: input.userId,
      page,
      limit,
      unreadOnly,
    });

    return {
      items: result.items.map(toNotificationDto),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
