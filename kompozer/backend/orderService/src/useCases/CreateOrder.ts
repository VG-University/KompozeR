/**
 * Use case for creating a new order in SUBMITTED state.
 */
import { randomUUID } from 'crypto';
import { Order } from '../domain/entities/Order';
import { ValidationError } from '../domain/entities/errors';
import { OrderRepository } from '../domain/ports/OrderRepository';
import { CreateOrderInput, OrderDto, toOrderDto } from './types';

export class CreateOrder {
  constructor(private readonly repo: OrderRepository) {}

  async execute(input: CreateOrderInput): Promise<OrderDto> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }
    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new ValidationError('items must contain at least one element');
    }
    if (!Number.isFinite(input.total) || input.total <= 0) {
      throw new ValidationError('total must be a positive number');
    }

    const now = new Date();
    const order: Order = {
      id: randomUUID(),
      userId: input.userId,
      items: input.items.map((item) => ({ ...item })),
      total: input.total,
      status: 'SUBMITTED',
      submittedAt: now,
    };

    await this.repo.create(order);
    return toOrderDto(order);
  }
}
