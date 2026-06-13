import { Notification, NotificationSubscription } from '../entities/Notification';

export interface ListNotificationsInput {
  userId: string;
  page: number;
  limit: number;
  unreadOnly: boolean;
}

export interface ListNotificationsResult {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationRepository {
  saveMany(items: Notification[]): Promise<void>;
  list(input: ListNotificationsInput): Promise<ListNotificationsResult>;
  countUnread(userId: string): Promise<number>;
  findById(id: string): Promise<Notification | null>;
  markRead(notificationId: string, readAt: Date): Promise<Notification | null>;
  createSubscription(item: NotificationSubscription): Promise<void>;
  listSubscriptions(userId: string): Promise<NotificationSubscription[]>;
  findSubscriptionById(subscriptionId: string): Promise<NotificationSubscription | null>;
  updateSubscription(subscription: NotificationSubscription): Promise<NotificationSubscription | null>;
  deactivateSubscription(subscriptionId: string, updatedAt: Date): Promise<boolean>;
  listActiveSubscriptionsBySkuAndEvent(
    sku: string,
    eventType: Notification['type'],
  ): Promise<NotificationSubscription[]>;
}
