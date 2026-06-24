/**
 * Use case that restores previously removed cart items once catalog availability returns.
 */
import { CartItem, computeCartTotal, computeLineTotal } from '../domain/entities/Cart';
import { CatalogSnapshotProvider } from '../domain/ports/CatalogSnapshotProvider';
import { CartEventPublisher } from '../domain/ports/CartEventPublisher';
import { CartRepository } from '../domain/ports/CartRepository';
import { CartEvent } from '../domain/entities/CartEvent';

export interface RestoreUnavailableItemsInput {
  sku: string;
}

export class RestoreUnavailableItems {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly catalog: CatalogSnapshotProvider,
    private readonly eventPublisher: CartEventPublisher = { publish: async () => {} },
  ) {}

  async execute(input: RestoreUnavailableItemsInput): Promise<number> {
    // Verify the triggering SKU is now available before looking up carts.
    const triggerSnapshot = await this.catalog.getBySku(input.sku);
    if (!triggerSnapshot || !triggerSnapshot.isAvailable) {
      return 0;
    }

    const carts = await this.cartRepo.findByRemovedSku(input.sku);
    if (carts.length === 0) {
      return 0;
    }

    let restoredCount = 0;

    for (const cart of carts) {
      const snapshotMap = cart.removedUnavailableItems ?? {};
      if (!snapshotMap[input.sku]) {
        continue;
      }

      // For each cart, try to restore ALL snapshotted items that are now available.
      const nextRemoved = { ...snapshotMap };
      const restoredItems: CartItem[] = [];
      const restoredSkus: string[] = [];

      for (const [sku, removedSnapshot] of Object.entries(snapshotMap)) {
        const catalogEntry = await this.catalog.getBySku(sku);
        if (!catalogEntry || !catalogEntry.isAvailable) {
          // Still unavailable — keep in snapshot.
          continue;
        }

        const alreadyPresent = cart.items.some((item) => item.sku === sku);
        delete nextRemoved[sku];

        if (alreadyPresent) {
          // Already in cart (added manually in the meantime) — just clean snapshot.
          continue;
        }

        restoredItems.push({
          sku,
          name: removedSnapshot.name,
          quantity: removedSnapshot.quantity,
          unitPrice: catalogEntry.unitPrice,
          lineTotal: computeLineTotal(catalogEntry.unitPrice, removedSnapshot.quantity),
        });
        restoredSkus.push(sku);
      }

      if (restoredItems.length === 0 && Object.keys(nextRemoved).length === Object.keys(snapshotMap).length) {
        // Nothing changed for this cart.
        continue;
      }

      cart.items = [...cart.items, ...restoredItems];
      cart.removedUnavailableItems = nextRemoved;
      cart.total = computeCartTotal(cart.items);
      cart.updatedAt = new Date();

      await this.cartRepo.upsert(cart);

      if (restoredSkus.length > 0) {
        restoredCount += 1;
        await this.eventPublisher.publish(
          this.buildEvent({
            type: 'CartItemsRestoredAvailable',
            userId: cart.userId,
            restoredSkus,
          }),
        );
      }
    }

    return restoredCount;
  }

  private buildEvent(event: Omit<CartEvent, 'eventId' | 'occurredAt'>): CartEvent {
    return {
      ...event,
      eventId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      occurredAt: new Date().toISOString(),
    };
  }
}
