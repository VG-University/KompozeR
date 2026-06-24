/**
 * [DS] Redis Pub/Sub implementation of CatalogEventPublisher.
 * Publishes catalog events on Redis channel `catalog:events`.
 * notificationService subscribes to this channel to deliver impacted-user
 * notifications.
 *
 * Each message is a JSON-serialized CatalogEvent string.
 */
import Redis             from 'ioredis';
import { CatalogEventPublisher } from '../../../domain/ports/CatalogEventPublisher';
import { CatalogEvent }          from '../../../domain/entities/CatalogEvent';

export const CATALOG_EVENTS_CHANNEL = 'catalog:events';

export class RedisCatalogEventPublisher implements CatalogEventPublisher {
  constructor(private readonly redis: Redis) {}

  async publish(event: CatalogEvent): Promise<void> {
    const payload = JSON.stringify(event);
    await this.redis.publish(CATALOG_EVENTS_CHANNEL, payload);
    console.log(`[catalog][redis-publisher] Published ${event.type} for SKU ${event.sku}`);
  }
}
