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
    const snapshot = await this.catalog.getBySku(input.sku);
    if (!snapshot || !snapshot.isAvailable) {
      return 0;
    }

    const carts = await this.cartRepo.findByRemovedSku(input.sku);
    if (carts.length === 0) {
      return 0;
    }

    let restoredCount = 0;

    for (const cart of carts) {
      const removed = cart.removedUnavailableItems?.[input.sku];
      if (!removed) {
        continue;
      }

      const alreadyPresent = cart.items.some((item) => item.sku === input.sku);
      const nextRemoved = { ...(cart.removedUnavailableItems ?? {}) };
      delete nextRemoved[input.sku];

      if (alreadyPresent) {
        cart.removedUnavailableItems = nextRemoved;
        cart.updatedAt = new Date();
        await this.cartRepo.upsert(cart);
        continue;
      }

      const restoredItem: CartItem = {
        sku: input.sku,
        name: removed.name,
        quantity: removed.quantity,
        unitPrice: snapshot.unitPrice,
        lineTotal: computeLineTotal(snapshot.unitPrice, removed.quantity),
      };

      cart.items.push(restoredItem);
      cart.removedUnavailableItems = nextRemoved;
      cart.total = computeCartTotal(cart.items);
      cart.updatedAt = new Date();

      await this.cartRepo.upsert(cart);
      restoredCount += 1;

      await this.eventPublisher.publish(
        this.buildEvent({
          type: 'CartItemsRestoredAvailable',
          userId: cart.userId,
          restoredSkus: [input.sku],
        }),
      );
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
