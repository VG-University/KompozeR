import { Order, OrderItem, OrderStatus } from '../domain/entities/Order';

export interface OrderDto {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  submittedAt: string;
  cancelledAt?: string;
}

export interface CreateOrderInput {
  userId: string;
  items: OrderItem[];
  total: number;
}

export interface ListOrdersInput {
  userId: string;
}

export interface GetOrderInput {
  userId: string;
  orderId: string;
}

export interface CancelOrderInput {
  userId: string;
  orderId: string;
}

export function toOrderDto(order: Order): OrderDto {
  return {
    id: order.id,
    userId: order.userId,
    items: order.items.map((item) => ({ ...item })),
    total: order.total,
    status: order.status,
    submittedAt: order.submittedAt.toISOString(),
    cancelledAt: order.cancelledAt?.toISOString(),
  };
}
