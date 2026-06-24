/**
 * Redis subscriber for catalog availability events.
 * Triggers restoration flow when an unavailable SKU becomes available again.
 */
import Redis from 'ioredis';
import { CatalogEvent } from '../../../domain/entities/CatalogEvent';
import { RestoreUnavailableItems } from '../../../useCases/RestoreUnavailableItems';

export const CATALOG_EVENTS_CHANNEL = 'catalog:events';

export class RedisCatalogEventsSubscriber {
  private readonly redis: Redis;

  constructor(
    redisUrl: string,
    private readonly restoreUnavailableItems: RestoreUnavailableItems,
  ) {
    this.redis = new Redis(redisUrl);
  }

  async start(): Promise<void> {
    await this.redis.subscribe(CATALOG_EVENTS_CHANNEL);

    this.redis.on('message', (channel, payload) => {
      if (channel !== CATALOG_EVENTS_CHANNEL) {
        return;
      }

      try {
        const event = JSON.parse(payload) as CatalogEvent;
        if (event.type === 'AVAILABILITY_CHANGED' && event.newIsAvailable) {
          void this.restoreUnavailableItems.execute({ sku: event.sku });
        }
      } catch (error) {
        console.error('[cart][redis-subscriber] Invalid catalog event payload', error);
      }
    });

    console.log('[cart][redis-subscriber] Subscribed to catalog:events');
  }

  async stop(): Promise<void> {
    await this.redis.quit();
  }
}
