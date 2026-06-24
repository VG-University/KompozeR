/**
 * Use case for transitioning order status to DONE.
 * Accepts only SUBMITTED -> DONE transition.
 */
import {
  OrderAlreadyCancelledError,
  OrderAlreadyDoneError,
  OrderNotFoundError,
  OrderStatusTransitionNotAllowedError,
  ValidationError,
} from '../domain/entities/errors';
import { OrderRepository } from '../domain/ports/OrderRepository';
import { OrderDto, toOrderDto, UpdateOrderStatusInput } from './types';

export class UpdateOrderStatus {
  constructor(private readonly repo: OrderRepository) {}

  async execute(input: UpdateOrderStatusInput): Promise<OrderDto> {
    if (!input.orderId?.trim()) {
      throw new ValidationError('orderId is required');
    }
    if (input.status !== 'DONE') {
      throw new ValidationError('status must be DONE');
    }

    const order = await this.repo.findById(input.orderId);
    if (!order) {
      throw new OrderNotFoundError(input.orderId);
    }

    if (order.status === 'DONE') {
      throw new OrderAlreadyDoneError(input.orderId);
    }

    if (order.status === 'CANCELLED') {
      throw new OrderAlreadyCancelledError(input.orderId);
    }

    if (order.status !== 'SUBMITTED') {
      throw new OrderStatusTransitionNotAllowedError(
        `Cannot change order status from ${order.status} to ${input.status}`,
      );
    }

    const updated = {
      ...order,
      status: 'DONE' as const,
      doneAt: new Date(),
    };

    await this.repo.update(updated);
    return toOrderDto(updated);
  }
}
