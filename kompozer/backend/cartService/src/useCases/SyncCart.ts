import { Cart, computeLineTotal, computeCartTotal } from '../domain/entities/Cart';
import { CartEvent } from '../domain/entities/CartEvent';
import { CartEventPublisher } from '../domain/ports/CartEventPublisher';
import { CartRepository } from '../domain/ports/CartRepository';
import { CatalogSnapshotProvider } from '../domain/ports/CatalogSnapshotProvider';
import { GetCartOutput, SyncCartInput } from './types';

export interface SyncCartResult extends GetCartOutput {
  /** SKUs removed because the item is no longer available in the catalog. */
  removedSkus: string[];
  /** SKUs whose unit price was updated from the catalog snapshot. */
  updatedSkus: string[];
}

export class SyncCart {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly catalog: CatalogSnapshotProvider,
    private readonly eventPublisher: CartEventPublisher = { publish: async () => {} },
  ) {}

  async execute(input: SyncCartInput): Promise<SyncCartResult> {
    const existing = await this.cartRepo.findByUserId(input.userId);
    if (!existing || existing.items.length === 0) {
      return {
        userId: input.userId,
        items: [],
        total: 0,
        updatedAt: existing?.updatedAt ?? new Date(0),
        removedSkus: [],
        updatedSkus: [],
      };
    }

    const removedSkus: string[] = [];
    const updatedSkus: string[] = [];

    const syncedItems = await Promise.all(
      existing.items.map(async (item) => {
        const snapshot = await this.catalog.getBySku(item.sku);

        if (!snapshot || !snapshot.isAvailable) {
          removedSkus.push(item.sku);
          return null;
        }

        if (snapshot.unitPrice !== item.unitPrice) {
          updatedSkus.push(item.sku);
          return {
            ...item,
            unitPrice: snapshot.unitPrice,
            lineTotal: computeLineTotal(snapshot.unitPrice, item.quantity),
          };
        }

        return item;
      }),
    );

    const keptItems = syncedItems.filter((item): item is NonNullable<typeof item> => item !== null);

    const hasChanges = removedSkus.length > 0 || updatedSkus.length > 0;

    if (hasChanges) {
      const updated: Cart = {
        ...existing,
        items: keptItems,
        total: computeCartTotal(keptItems),
        updatedAt: new Date(),
      };

      await this.cartRepo.upsert(updated);

      if (removedSkus.length > 0) {
        await this.eventPublisher.publish(
          this.buildEvent({
            type: 'CartItemsRemovedUnavailable',
            userId: input.userId,
            removedSkus,
          }),
        );
      }

      if (updatedSkus.length > 0) {
        await this.eventPublisher.publish(
          this.buildEvent({
            type: 'CartPricesUpdated',
            userId: input.userId,
            updatedSkus,
          }),
        );
      }

      return {
        userId: updated.userId,
        items: updated.items,
        total: updated.total,
        updatedAt: updated.updatedAt,
        removedSkus,
        updatedSkus,
      };
    }

    return {
      userId: existing.userId,
      items: existing.items,
      total: existing.total,
      updatedAt: existing.updatedAt,
      removedSkus: [],
      updatedSkus: [],
    };
  }

  private buildEvent(event: Omit<CartEvent, 'eventId' | 'occurredAt'>): CartEvent {
    return {
      ...event,
      eventId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      occurredAt: new Date().toISOString(),
    };
  }
}
