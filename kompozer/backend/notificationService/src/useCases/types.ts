import { Notification } from '../domain/entities/Notification';
import { NotificationSubscription } from '../domain/entities/Notification';

export interface NotificationDto {
  id: string;
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  sku: string;
  componentId: string;
  contextType: Notification['contextType'];
  contextId: string;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

export function toNotificationDto(n: Notification): NotificationDto {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    sku: n.sku,
    componentId: n.componentId,
    contextType: n.contextType,
    contextId: n.contextId,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
    readAt: n.readAt ? n.readAt.toISOString() : null,
  };
}

export interface NotificationSubscriptionDto {
  id: string;
  userId: string;
  scope: 'PRODUCT';
  targetId: string;
  events: Array<'PRICE_CHANGED' | 'AVAILABILITY_CHANGED'>;
  channel: 'IN_APP';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toSubscriptionDto(s: NotificationSubscription): NotificationSubscriptionDto {
  return {
    id: s.id,
    userId: s.userId,
    scope: s.scope,
    targetId: s.targetId,
    events: s.events,
    channel: s.channel,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}
