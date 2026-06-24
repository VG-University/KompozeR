/**
 * In-memory fake adapters used by notificationService unit tests.
 */
import { CatalogEvent } from '../../src/domain/entities/CatalogEvent';
import { Notification, NotificationSubscription } from '../../src/domain/entities/Notification';
import {
  ListNotificationsInput,
  ListNotificationsResult,
  NotificationRepository,
} from '../../src/domain/ports/NotificationRepository';
import { NotificationBroadcaster } from '../../src/domain/ports/NotificationBroadcaster';
import { ImpactResolver, ImpactedUser } from '../../src/domain/ports/ImpactResolver';
import { ProcessedEventRepository } from '../../src/domain/ports/ProcessedEventRepository';
import { IdGenerator } from '../../src/useCases/HandleCatalogEvent';

export class FakeNotificationRepository implements NotificationRepository {
  notifications: Notification[] = [];
  subscriptions: NotificationSubscription[] = [];

  async saveMany(items: Notification[]): Promise<void> {
    this.notifications.push(...items);
  }

  async list(input: ListNotificationsInput): Promise<ListNotificationsResult> {
    const filtered = this.notifications.filter(
      (n) => n.userId === input.userId && (!input.unreadOnly || !n.read),
    );
    return {
      items: filtered,
      total: filtered.length,
      page: input.page,
      limit: input.limit,
      totalPages: 1,
    };
  }

  async countUnread(userId: string): Promise<number> {
    return this.notifications.filter((n) => n.userId === userId && !n.read).length;
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notifications.find((n) => n.id === id) ?? null;
  }

  async markRead(notificationId: string, readAt: Date): Promise<Notification | null> {
    const n = this.notifications.find((item) => item.id === notificationId);
    if (!n) return null;
    n.read = true;
    n.readAt = readAt;
    return n;
  }

  async createSubscription(item: NotificationSubscription): Promise<void> {
    this.subscriptions.push(item);
  }

  async upsertSubscription(item: NotificationSubscription): Promise<NotificationSubscription> {
    const existing = this.subscriptions.find(
      (s) =>
        s.userId === item.userId
        && s.scope === item.scope
        && s.targetId === item.targetId
        && s.channel === item.channel,
    );

    if (!existing) {
      this.subscriptions.push(item);
      return item;
    }

    existing.events = [...item.events];
    existing.isActive = item.isActive;
    existing.updatedAt = item.updatedAt;
    return existing;
  }

  async listSubscriptions(userId: string): Promise<NotificationSubscription[]> {
    return this.subscriptions.filter((s) => s.userId === userId);
  }

  async findSubscriptionById(subscriptionId: string): Promise<NotificationSubscription | null> {
    return this.subscriptions.find((s) => s.id === subscriptionId) ?? null;
  }

  async updateSubscription(
    subscription: NotificationSubscription,
  ): Promise<NotificationSubscription | null> {
    const idx = this.subscriptions.findIndex((s) => s.id === subscription.id);
    if (idx < 0) return null;
    this.subscriptions[idx] = subscription;
    return subscription;
  }

  async deactivateSubscription(subscriptionId: string, updatedAt: Date): Promise<boolean> {
    const s = this.subscriptions.find((item) => item.id === subscriptionId);
    if (!s) return false;
    s.isActive = false;
    s.updatedAt = updatedAt;
    return true;
  }

  async listActiveSubscriptionsBySkuAndEvent(
    sku: string,
    eventType: Notification['type'],
  ): Promise<NotificationSubscription[]> {
    return this.subscriptions.filter(
      (s) => s.targetId === sku && s.isActive && s.events.includes(eventType),
    );
  }
}

export class FakeProcessedEventRepository implements ProcessedEventRepository {
  private processed = new Set<string>();

  async hasProcessed(eventId: string): Promise<boolean> {
    return this.processed.has(eventId);
  }

  async markProcessed(eventId: string, _processedAt: Date): Promise<void> {
    this.processed.add(eventId);
  }
}

export class FakeImpactResolver implements ImpactResolver {
  impacts: ImpactedUser[] = [];

  async resolve(_event: CatalogEvent): Promise<ImpactedUser[]> {
    return this.impacts;
  }
}

export class FakeBroadcaster implements NotificationBroadcaster {
  pushed: Notification[] = [];

  async push(notification: Notification): Promise<void> {
    this.pushed.push(notification);
  }
}

export class FakeIdGenerator implements IdGenerator {
  private seq = 0;

  generate(): string {
    this.seq += 1;
    return `notif-${this.seq}`;
  }
}
