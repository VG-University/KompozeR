import { Cart } from '../../src/domain/entities/Cart';
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
