import { ForbiddenError, NotificationNotFoundError, ValidationError } from '../domain/entities/errors';
import { NotificationRepository } from '../domain/ports/NotificationRepository';
import { NotificationDto, toNotificationDto } from './types';

export interface MarkNotificationReadInput {
  userId: string;
  notificationId: string;
}

export class MarkNotificationRead {
  constructor(private readonly repo: NotificationRepository) {}

  async execute(input: MarkNotificationReadInput): Promise<NotificationDto> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }
    if (!input.notificationId?.trim()) {
      throw new ValidationError('notificationId is required');
    }

    const current = await this.repo.findById(input.notificationId);
    if (!current) {
      throw new NotificationNotFoundError(input.notificationId);
    }
    if (current.userId !== input.userId) {
      throw new ForbiddenError('Cannot mark notifications of another user');
    }
    if (current.read) {
      return toNotificationDto(current);
    }

    const updated = await this.repo.markRead(input.notificationId, new Date());
    if (!updated) {
      throw new NotificationNotFoundError(input.notificationId);
    }
    return toNotificationDto(updated);
  }
}
