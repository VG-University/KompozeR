/**
 * [DS] Domain port for publishing catalog events.
 * Abstracts messaging channel (Redis Pub/Sub in production, noop in dev,
 * fake in tests).
 *
 * This is the boundary between domain and external event-driven integration.
 */
import { CatalogEvent } from '../entities/CatalogEvent';

export interface CatalogEventPublisher {
  publish(event: CatalogEvent): Promise<void>;
}
