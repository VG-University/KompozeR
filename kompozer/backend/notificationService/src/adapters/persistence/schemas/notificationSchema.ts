import { Schema, model } from 'mongoose';

export type NotificationDoc = {
  _id: string;
  userId: string;
  type: 'PRICE_CHANGED' | 'AVAILABILITY_CHANGED';
  title: string;
  message: string;
  sku: string;
  componentId: string;
  contextType: 'CAD' | 'CART' | 'SUBSCRIPTION';
  contextId: string;
  read: boolean;
  createdAt: Date;
  readAt: Date | null;
};

const notificationSchema = new Schema<NotificationDoc>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['PRICE_CHANGED', 'AVAILABILITY_CHANGED'],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    sku: { type: String, required: true, index: true },
    componentId: { type: String, required: true },
    contextType: {
      type: String,
      required: true,
      enum: ['CAD', 'CART', 'SUBSCRIPTION'],
    },
    contextId: { type: String, required: true },
    read: { type: Boolean, required: true, default: false, index: true },
    createdAt: { type: Date, required: true, index: true },
    readAt: { type: Date, required: false, default: null },
  },
  { _id: false },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const NotificationModel = model<NotificationDoc>(
  'Notification',
  notificationSchema,
  'notifications',
);

export type NotificationSubscriptionDoc = {
  _id: string;
  userId: string;
  scope: 'PRODUCT';
  targetId: string;
  events: Array<'PRICE_CHANGED' | 'AVAILABILITY_CHANGED'>;
  channel: 'IN_APP';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const notificationSubscriptionSchema = new Schema<NotificationSubscriptionDoc>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    scope: { type: String, required: true, enum: ['PRODUCT'], default: 'PRODUCT' },
    targetId: { type: String, required: true, index: true },
    events: {
      type: [String],
      required: true,
      enum: ['PRICE_CHANGED', 'AVAILABILITY_CHANGED'],
      default: ['PRICE_CHANGED', 'AVAILABILITY_CHANGED'],
    },
    channel: { type: String, required: true, enum: ['IN_APP'], default: 'IN_APP' },
    isActive: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { _id: false },
);

notificationSubscriptionSchema.index({ targetId: 1, isActive: 1 });
notificationSubscriptionSchema.index({ userId: 1, isActive: 1, updatedAt: -1 });
notificationSubscriptionSchema.index(
  { userId: 1, scope: 1, targetId: 1, channel: 1 },
  { unique: true },
);

export const NotificationSubscriptionModel = model<NotificationSubscriptionDoc>(
  'NotificationSubscription',
  notificationSubscriptionSchema,
  'notificationSubscriptions',
);

export type ProcessedEventDoc = {
  _id: string;
  processedAt: Date;
};

const processedEventSchema = new Schema<ProcessedEventDoc>(
  {
    _id: { type: String, required: true },
    processedAt: { type: Date, required: true },
  },
  { _id: false },
);

export const ProcessedEventModel = model<ProcessedEventDoc>(
  'ProcessedEvent',
  processedEventSchema,
  'notificationEvents',
);
