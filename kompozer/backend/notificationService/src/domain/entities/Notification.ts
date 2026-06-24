/**
 * Core domain models for notifications and notification subscriptions.
 */
export type NotificationType = 'PRICE_CHANGED' | 'AVAILABILITY_CHANGED';

export type NotificationContextType = 'CAD' | 'CART' | 'SUBSCRIPTION';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  sku: string;
  componentId: string;
  contextType: NotificationContextType;
  contextId: string;
  read: boolean;
  createdAt: Date;
  readAt: Date | null;
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  scope: 'PRODUCT';
  targetId: string;
  events: Array<'PRICE_CHANGED' | 'AVAILABILITY_CHANGED'>;
  channel: 'IN_APP';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}