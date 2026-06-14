import {
  ForbiddenError,
  OrderAlreadyCancelledError,
  OrderNotFoundError,
  ValidationError,
} from '../domain/entities/errors';
import { OrderRepository } from '../domain/ports/OrderRepository';
import { CancelOrderInput, OrderDto, toOrderDto } from './types';

export class CancelOrder {
  constructor(private readonly repo: OrderRepository) {}

  async execute(input: CancelOrderInput): Promise<OrderDto> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }
    if (!input.orderId?.trim()) {
      throw new ValidationError('orderId is required');
    }

    const order = await this.repo.findById(input.orderId);
    if (!order) {
      throw new OrderNotFoundError(input.orderId);
    }
    if (order.userId !== input.userId) {
      throw new ForbiddenError('Cannot cancel another user order');
    }
    if (order.status === 'CANCELLED') {
      throw new OrderAlreadyCancelledError(input.orderId);
    }

    const updated = {
      ...order,
      status: 'CANCELLED' as const,
      cancelledAt: new Date(),
    };

    await this.repo.update(updated);
    return toOrderDto(updated);
  }
}
