import { Cart } from '../../domain/entities/Cart';
import { CartRepository } from '../../domain/ports/CartRepository';
import { CartModel } from './schemas/cartSchema';

export class MongoCartRepository implements CartRepository {
  async findByUserId(userId: string): Promise<Cart | null> {
    const doc = await CartModel.findOne({ userId }).lean();
    return doc
      ? {
          userId: doc.userId,
          items: doc.items,
          total: doc.total,
          updatedAt: doc.updatedAt,
        }
      : null;
  }

  async upsert(cart: Cart): Promise<void> {
    await CartModel.findOneAndUpdate(
      { userId: cart.userId },
      {
        _id: cart.userId,
        userId: cart.userId,
        items: cart.items,
        total: cart.total,
        updatedAt: cart.updatedAt,
      },
      { upsert: true },
    );
  }

  async clear(userId: string): Promise<void> {
    await CartModel.findOneAndUpdate(
      { userId },
      {
        _id: userId,
        userId,
        items: [],
        total: 0,
        updatedAt: new Date(),
      },
      { upsert: true },
    );
  }
}
