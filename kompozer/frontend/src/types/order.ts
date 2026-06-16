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
  submittedAt: string;
  doneAt?: string;
  cancelledAt?: string;
}

export interface OrdersListDto {
  items: Order[];
  total: number;
  page: number;
  limit: number;
}
