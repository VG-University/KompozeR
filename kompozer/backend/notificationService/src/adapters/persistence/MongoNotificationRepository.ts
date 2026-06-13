import { Notification, NotificationSubscription } from '../../domain/entities/Notification';
import {
  ListNotificationsInput,
  ListNotificationsResult,
  NotificationRepository,
} from '../../domain/ports/NotificationRepository';
import {
  NotificationDoc,
  NotificationModel,
  NotificationSubscriptionDoc,
  NotificationSubscriptionModel,
} from './schemas/notificationSchema';

function toEntity(doc: NotificationDoc): Notification {
  return {
    id: doc._id,
    userId: doc.userId,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    sku: doc.sku,
    componentId: doc.componentId,
    contextType: doc.contextType,
    contextId: doc.contextId,
    read: doc.read,
    createdAt: new Date(doc.createdAt),
    readAt: doc.readAt ? new Date(doc.readAt) : null,
  };
}

function toSubscription(doc: NotificationSubscriptionDoc): NotificationSubscription {
  return {
    id: doc._id,
    userId: doc.userId,
    scope: doc.scope,
    targetId: doc.targetId,
    events: doc.events,
    channel: doc.channel,
    isActive: doc.isActive,
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  };
}

export class MongoNotificationRepository implements NotificationRepository {
  async saveMany(items: Notification[]): Promise<void> {
    if (items.length === 0) return;
    await NotificationModel.insertMany(
      items.map((n) => ({
        _id: n.id,
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        sku: n.sku,
        componentId: n.componentId,
        contextType: n.contextType,
        contextId: n.contextId,
        read: n.read,
        createdAt: n.createdAt,
        readAt: n.readAt,
      })),
      { ordered: false },
    );
  }

  async list(input: ListNotificationsInput): Promise<ListNotificationsResult> {
    const query: Record<string, unknown> = { userId: input.userId };
    if (input.unreadOnly) {
      query['read'] = false;
    }

    const skip = (input.page - 1) * input.limit;
    const [docs, total] = await Promise.all([
      NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(input.limit)
        .lean<NotificationDoc[]>(),
      NotificationModel.countDocuments(query),
    ]);

    const totalPages = total === 0 ? 1 : Math.ceil(total / input.limit);

    return {
      items: docs.map(toEntity),
      total,
      page: input.page,
      limit: input.limit,
      totalPages,
    };
  }

  async countUnread(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId, read: false });
  }

  async findById(id: string): Promise<Notification | null> {
    const doc = await NotificationModel.findById(id).lean<NotificationDoc | null>();
    return doc ? toEntity(doc) : null;
  }

  async markRead(notificationId: string, readAt: Date): Promise<Notification | null> {
    const doc = await NotificationModel.findOneAndUpdate(
      { _id: notificationId },
      { $set: { read: true, readAt } },
      { new: true },
    ).lean<NotificationDoc | null>();

    return doc ? toEntity(doc) : null;
  }

  async createSubscription(item: NotificationSubscription): Promise<void> {
    await NotificationSubscriptionModel.create({
      _id: item.id,
      userId: item.userId,
      scope: item.scope,
      targetId: item.targetId,
      events: item.events,
      channel: item.channel,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  async listSubscriptions(userId: string): Promise<NotificationSubscription[]> {
    const docs = await NotificationSubscriptionModel.find({ userId })
      .sort({ updatedAt: -1 })
      .lean<NotificationSubscriptionDoc[]>();
    return docs.map(toSubscription);
  }

  async findSubscriptionById(subscriptionId: string): Promise<NotificationSubscription | null> {
    const doc = await NotificationSubscriptionModel.findById(subscriptionId)
      .lean<NotificationSubscriptionDoc | null>();
    return doc ? toSubscription(doc) : null;
  }

  async updateSubscription(
    subscription: NotificationSubscription,
  ): Promise<NotificationSubscription | null> {
    const doc = await NotificationSubscriptionModel.findOneAndUpdate(
      { _id: subscription.id },
      {
        $set: {
          scope: subscription.scope,
          targetId: subscription.targetId,
          events: subscription.events,
          channel: subscription.channel,
          isActive: subscription.isActive,
          updatedAt: subscription.updatedAt,
        },
      },
      { new: true },
    ).lean<NotificationSubscriptionDoc | null>();

    return doc ? toSubscription(doc) : null;
  }

  async deactivateSubscription(subscriptionId: string, updatedAt: Date): Promise<boolean> {
    const res = await NotificationSubscriptionModel.updateOne(
      { _id: subscriptionId },
      { $set: { isActive: false, updatedAt } },
    );
    return res.modifiedCount > 0;
  }

  async listActiveSubscriptionsBySkuAndEvent(
    sku: string,
    eventType: Notification['type'],
  ): Promise<NotificationSubscription[]> {
    const docs = await NotificationSubscriptionModel.find({
      targetId: sku,
      isActive: true,
      events: eventType,
    }).lean<NotificationSubscriptionDoc[]>();
    return docs.map(toSubscription);
  }
}
