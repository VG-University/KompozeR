import { computeCartTotal } from '../domain/entities/Cart';
import { CartRepository } from '../domain/ports/CartRepository';
import { GetCartOutput, RemoveCartItemInput } from './types';

export class RemoveCartItem {
  constructor(private readonly cartRepo: CartRepository) {}

  async execute(input: RemoveCartItemInput): Promise<GetCartOutput> {
    const cart = await this.cartRepo.findByUserId(input.userId);
    if (!cart) {
      return {
        userId: input.userId,
        items: [],
        total: 0,
        updatedAt: new Date(0),
      };
    }

    cart.items = cart.items.filter((item) => item.sku !== input.sku);
    cart.total = computeCartTotal(cart.items);
    cart.updatedAt = new Date();
    await this.cartRepo.upsert(cart);

    return {
      userId: cart.userId,
      items: cart.items,
      total: cart.total,
      updatedAt: cart.updatedAt,
    };
  }
}
