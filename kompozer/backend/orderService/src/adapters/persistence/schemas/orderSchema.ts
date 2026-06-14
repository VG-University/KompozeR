import { Schema, model } from 'mongoose';

export type OrderDoc = {
  _id: string;
  userId: string;
  items: Array<{
    sku: string;
    name: string;
    unitPrice: number;
    quantity: number;
  }>;
  total: number;
  status: 'SUBMITTED' | 'CANCELLED';
  submittedAt: Date;
  cancelledAt?: Date;
};

const orderItemSchema = new Schema(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDoc>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    status: { type: String, required: true, enum: ['SUBMITTED', 'CANCELLED'] },
    submittedAt: { type: Date, required: true, index: true },
    cancelledAt: { type: Date, required: false },
  },
  { _id: false },
);

orderSchema.index({ userId: 1, submittedAt: -1 });

export const OrderModel = model<OrderDoc>('Order', orderSchema, 'orders');
