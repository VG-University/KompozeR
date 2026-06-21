import { Order } from '../entities/Order';

export interface OrderRepository {
  create(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  listByUserId(userId: string): Promise<Order[]>;
  listAll(): Promise<Order[]>;
  update(order: Order): Promise<void>;
}
