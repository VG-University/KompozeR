import { Cart } from '../../src/domain/entities/Cart';
import { CartEvent } from '../../src/domain/entities/CartEvent';
import { CatalogItemSnapshot, CatalogSnapshotProvider } from '../../src/domain/ports/CatalogSnapshotProvider';
import { CartEventPublisher } from '../../src/domain/ports/CartEventPublisher';
import { CartRepository } from '../../src/domain/ports/CartRepository';

export class FakeCartRepository implements CartRepository {
  private store = new Map<string, Cart>();

  async findByUserId(userId: string): Promise<Cart | null> {
    const cart = this.store.get(userId);
    return cart ? { ...cart, items: cart.items.map((it) => ({ ...it })) } : null;
  }

  async upsert(cart: Cart): Promise<void> {
    this.store.set(cart.userId, { ...cart, items: cart.items.map((it) => ({ ...it })) });
  }

  async clear(userId: string): Promise<void> {
    this.store.set(userId, {
      userId,
      items: [],
      total: 0,
      updatedAt: new Date(),
    });
  }
}

export class FakeCatalogSnapshotProvider implements CatalogSnapshotProvider {
  private snapshots = new Map<string, CatalogItemSnapshot>();

  set(snapshot: CatalogItemSnapshot): void {
    this.snapshots.set(snapshot.sku, snapshot);
  }

  async getBySku(sku: string): Promise<CatalogItemSnapshot | null> {
    return this.snapshots.get(sku) ?? null;
  }
}

export class FakeCartEventPublisher implements CartEventPublisher {
  readonly events: CartEvent[] = [];

  async publish(event: CartEvent): Promise<void> {
    this.events.push(event);
  }
}
