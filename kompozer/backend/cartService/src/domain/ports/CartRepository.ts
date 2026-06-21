import { Cart } from '../entities/Cart';

export interface CartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  findByRemovedSku(sku: string): Promise<Cart[]>;
  upsert(cart: Cart): Promise<void>;
  clear(userId: string): Promise<void>;
}
