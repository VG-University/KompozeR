import { CART_EVENTS_CHANNEL, RedisCartEventPublisher } from '../../../src/adapters/messaging/publishers/RedisCartEventPublisher';
import { CartEvent } from '../../../src/domain/entities/CartEvent';

describe('RedisCartEventPublisher', () => {
  it('publishes cart events to cart:events channel as JSON payload', async () => {
    const publish = jest.fn().mockResolvedValue(1);
    const redis = { publish } as unknown as { publish: (channel: string, payload: string) => Promise<number> };
    const publisher = new RedisCartEventPublisher(redis as never);

    const event: CartEvent = {
      eventId: 'evt_1',
      type: 'ItemAddedToCart',
      occurredAt: new Date().toISOString(),
      userId: 'usr_1',
      sku: 'SKU-001',
      quantity: 2,
      unitPrice: 1990,
      source: 'MANUAL',
    };

    await publisher.publish(event);

    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(CART_EVENTS_CHANNEL, JSON.stringify(event));
  });
});
