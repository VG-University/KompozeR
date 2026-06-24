import { Schema, model } from 'mongoose';

/** MongoDB document shape for order reporting. */
export type OrderDoc = {
  _id: string;
  status: 'SUBMITTED' | 'DONE' | 'CANCELLED';
  total: number;
  submittedAt: Date;
};

/** Root schema for the orders collection used by reporting queries. */
const orderSchema = new Schema<OrderDoc>(
  {
    _id: { type: String, required: true },
    status: { type: String, required: true, enum: ['SUBMITTED', 'DONE', 'CANCELLED'] },
    total: { type: Number, required: true },
    submittedAt: { type: Date, required: true, index: true },
  },
  { _id: false },
);

export const OrderModel = model<OrderDoc>('Order', orderSchema, 'orders');
