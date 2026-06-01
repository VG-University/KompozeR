// RedisCatalogEventPublisher — [DS] Implementazione Redis Pub/Sub di CatalogEventPublisher.
// Pubblica gli eventi di catalogo sul canale `catalog:events` di Redis.
// Il notificationService si sottoscrive a questo canale per ricevere le notifiche
// e inoltrarle agli utenti che hanno configurazioni impattate.
//
// Ogni messaggio è una stringa JSON serializzata del CatalogEvent.
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
