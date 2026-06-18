import { CartRepository } from '../domain/ports/CartRepository';
import { CatalogSnapshotProvider } from '../domain/ports/CatalogSnapshotProvider';
import { CartEventPublisher } from '../domain/ports/CartEventPublisher';
import { SyncCart } from './SyncCart';
import { GetCartInput, GetCartOutput } from './types';

export class GetCart {
  private readonly syncCart: SyncCart | undefined;

  constructor(
    private readonly cartRepo: CartRepository,
    catalog?: CatalogSnapshotProvider,
    eventPublisher?: CartEventPublisher,
  ) {
    // Sync is optional: if catalog is not provided the cart is returned as-is.
    if (catalog) {
      this.syncCart = new SyncCart(cartRepo, catalog, eventPublisher);
    }
  }

  async execute(input: GetCartInput): Promise<GetCartOutput> {
    if (this.syncCart) {
      const synced = await this.syncCart.execute({ userId: input.userId });
      return {
        userId: synced.userId,
        items: synced.items,
        total: synced.total,
        updatedAt: synced.updatedAt,
      };
    }

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
