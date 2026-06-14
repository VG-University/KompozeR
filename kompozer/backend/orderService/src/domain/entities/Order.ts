export type OrderStatus = 'SUBMITTED' | 'CANCELLED';

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
  cancelledAt?: Date;
}
