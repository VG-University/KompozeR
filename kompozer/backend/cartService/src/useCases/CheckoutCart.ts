import {
  CartEmptyError,
  CartItemPriceChangedError,
  CartItemUnavailableError,
} from '../domain/entities/errors';
import { CartRepository } from '../domain/ports/CartRepository';
import { CatalogSnapshotProvider } from '../domain/ports/CatalogSnapshotProvider';
import { CheckoutCartInput, CheckoutCartOutput } from './types';

export class CheckoutCart {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly catalog: CatalogSnapshotProvider,
  ) {}

  async execute(input: CheckoutCartInput): Promise<CheckoutCartOutput> {
    const cart = await this.cartRepo.findByUserId(input.userId);
    if (!cart || cart.items.length === 0) {
      throw new CartEmptyError();
    }

    for (const item of cart.items) {
      const snapshot = await this.catalog.getBySku(item.sku);
      if (!snapshot || !snapshot.isAvailable) {
        throw new CartItemUnavailableError(item.sku);
      }
      if (snapshot.unitPrice !== item.unitPrice) {
        throw new CartItemPriceChangedError(item.sku, item.unitPrice, snapshot.unitPrice);
      }
    }

    return {
      status: 'CONFIRMED',
      userId: cart.userId,
      items: cart.items,
      total: cart.total,
      checkedAt: new Date(),
    };
  }
}
