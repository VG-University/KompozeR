/**
 * No-op implementation of CatalogEventPublisher.
 * Used in development environments where Redis is not configured.
 * Logs events to stdout for easier debugging.
 */
import { CatalogEventPublisher } from '../domain/ports/CatalogEventPublisher';
import { CatalogEvent }          from '../domain/entities/CatalogEvent';

export class NoopCatalogEventPublisher implements CatalogEventPublisher {
  async publish(event: CatalogEvent): Promise<void> {
    console.log(`[catalog][noop-publisher] Event: ${JSON.stringify(event)}`);
  }
}
