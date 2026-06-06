import { Cart, CartItem, computeCartTotal, computeLineTotal } from '../domain/entities/Cart';
import { ValidationError } from '../domain/entities/errors';
import { CartRepository } from '../domain/ports/CartRepository';
import { GetCartOutput, UpsertCartItemInput } from './types';

export class UpsertCartItem {
  constructor(private readonly cartRepo: CartRepository) {}

  async execute(input: UpsertCartItemInput): Promise<GetCartOutput> {
    if (!input.sku || !input.name) {
      throw new ValidationError('sku and name are required');
    }
    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new ValidationError('quantity must be a positive integer');
    }
    if (!Number.isInteger(input.unitPrice) || input.unitPrice < 0) {
      throw new ValidationError('unitPrice must be an integer >= 0');
    }

    const cart =
      (await this.cartRepo.findByUserId(input.userId)) ??
      ({ userId: input.userId, items: [], total: 0, updatedAt: new Date() } as Cart);

    const updatedItem: CartItem = {
      sku: input.sku,
      name: input.name,
      unitPrice: input.unitPrice,
      quantity: input.quantity,
      lineTotal: computeLineTotal(input.unitPrice, input.quantity),
    };

    const idx = cart.items.findIndex((it) => it.sku === input.sku);
    if (idx >= 0) {
      cart.items[idx] = updatedItem;
    } else {
      cart.items.push(updatedItem);
    }

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
