import { CartRepository } from '../domain/ports/CartRepository';
import { GetCartInput, GetCartOutput } from './types';

export class GetCart {
  constructor(private readonly cartRepo: CartRepository) {}

  async execute(input: GetCartInput): Promise<GetCartOutput> {
    const existing = await this.cartRepo.findByUserId(input.userId);
    if (!existing) {
      return {
        userId: input.userId,
        items: [],
        total: 0,
        updatedAt: new Date(0),
      };
    }

    return {
      userId: existing.userId,
      items: existing.items,
      total: existing.total,
      updatedAt: existing.updatedAt,
    };
  }
}
