import { Cart, CartItem, computeCartTotal, computeLineTotal } from '../domain/entities/Cart';
import { CartEvent } from '../domain/entities/CartEvent';
import { ValidationError } from '../domain/entities/errors';
import { CartEventPublisher } from '../domain/ports/CartEventPublisher';
import { CartRepository } from '../domain/ports/CartRepository';
import { GetCartOutput, UpsertCartItemInput } from './types';

export class UpsertCartItem {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly eventPublisher: CartEventPublisher = { publish: async () => {} },
  ) {}

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

    const existingCart = await this.cartRepo.findByUserId(input.userId);
    const cart =
      existingCart ?? ({ userId: input.userId, items: [], total: 0, updatedAt: new Date() } as Cart);

    const updatedItem: CartItem = {
      sku: input.sku,
      name: input.name,
      unitPrice: input.unitPrice,
      quantity: input.quantity,
      lineTotal: computeLineTotal(input.unitPrice, input.quantity),
    };

    const idx = cart.items.findIndex((it) => it.sku === input.sku);
    const isNewItem = idx < 0;
    if (idx >= 0) {
      cart.items[idx] = updatedItem;
    } else {
      cart.items.push(updatedItem);
    }

    cart.total = computeCartTotal(cart.items);
    cart.updatedAt = new Date();

    await this.cartRepo.upsert(cart);

    if (!existingCart) {
      await this.eventPublisher.publish(
        this.buildEvent({
          type: 'CartCreated',
          userId: input.userId,
        }),
      );
    }

    if (isNewItem) {
      await this.eventPublisher.publish(
        this.buildEvent({
          type: 'ItemAddedToCart',
          userId: input.userId,
          sku: input.sku,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          source: 'MANUAL',
        }),
      );
    }

    return {
      userId: cart.userId,
      items: cart.items,
      total: cart.total,
      updatedAt: cart.updatedAt,
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
