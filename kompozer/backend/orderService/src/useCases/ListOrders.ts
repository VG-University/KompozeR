import { ValidationError } from '../domain/entities/errors';
import { OrderRepository } from '../domain/ports/OrderRepository';
import { ListOrdersInput, OrderDto, toOrderDto } from './types';

export interface ListOrdersOutput {
  items: OrderDto[];
}

export class ListOrders {
  constructor(private readonly repo: OrderRepository) {}

  async execute(input: ListOrdersInput): Promise<ListOrdersOutput> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }

    const orders = await this.repo.listByUserId(input.userId);
    return {
      items: orders.map(toOrderDto),
    };
  }
}
