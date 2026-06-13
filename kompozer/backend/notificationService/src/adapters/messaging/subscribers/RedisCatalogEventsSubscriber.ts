import Redis from 'ioredis';
import { CatalogEvent } from '../../../domain/entities/CatalogEvent';
import { HandleCatalogEvent } from '../../../useCases/HandleCatalogEvent';

export const CATALOG_EVENTS_CHANNEL = 'catalog:events';

export class RedisCatalogEventsSubscriber {
  private readonly redis: Redis;

  constructor(
    redisUrl: string,
    private readonly handler: HandleCatalogEvent,
  ) {
    this.redis = new Redis(redisUrl);
  }

  async start(): Promise<void> {
    await this.redis.subscribe(CATALOG_EVENTS_CHANNEL);
    this.redis.on('message', (channel, payload) => {
      if (channel !== CATALOG_EVENTS_CHANNEL) return;

      try {
        const event = JSON.parse(payload) as CatalogEvent;
        void this.handler.execute(event);
      } catch (error) {
        console.error('[notification][redis-subscriber] Invalid event payload', error);
      }
    });

    console.log('[notification][redis-subscriber] Subscribed to catalog:events');
  }

  async stop(): Promise<void> {
    await this.redis.quit();
  }
}
