/**
 * Core order domain model.
 */
export type OrderStatus = 'SUBMITTED' | 'DONE' | 'CANCELLED';

export interface OrderItem {
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  submittedAt: Date;
  doneAt?: Date;
  cancelledAt?: Date;
}
