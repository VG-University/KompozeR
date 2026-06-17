import {
  CartEmptyError,
  CartItemPriceChangedError,
  CartItemUnavailableError,
} from '../domain/entities/errors';
import { CartEvent } from '../domain/entities/CartEvent';
import { CartRepository } from '../domain/ports/CartRepository';
import { CartEventPublisher } from '../domain/ports/CartEventPublisher';
import { CatalogSnapshotProvider } from '../domain/ports/CatalogSnapshotProvider';
import { OrderServiceClient } from '../domain/ports/OrderServiceClient';
import { CheckoutCartInput, CheckoutCartOutput } from './types';

export class CheckoutCart {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly catalog: CatalogSnapshotProvider,
    private readonly orderServiceClient: OrderServiceClient,
    private readonly eventPublisher: CartEventPublisher = { publish: async () => {} },
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

    const order = await this.orderServiceClient.submitOrder({
      userId: cart.userId,
      items: cart.items,
      total: cart.total,
    });

    await this.cartRepo.clear(cart.userId);

    await this.eventPublisher.publish(
      this.buildEvent({
        type: 'OrderRequestSubmitted',
        userId: cart.userId,
      }),
    );

    await this.eventPublisher.publish(
      this.buildEvent({
        type: 'OrderConfirmationRequested',
        userId: cart.userId,
      }),
    );

    return {
      orderId: order.orderId,
      status: 'SUBMITTED',
      userId: cart.userId,
      items: cart.items,
      total: cart.total,
      submittedAt: order.submittedAt,
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
