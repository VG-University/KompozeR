/**
 * No-op CartEventPublisher used when messaging infrastructure is disabled.
 */
import { CartEvent } from '../domain/entities/CartEvent';
import { CartEventPublisher } from '../domain/ports/CartEventPublisher';

export class NoopCartEventPublisher implements CartEventPublisher {
  async publish(event: CartEvent): Promise<void> {
    console.log(`[cart][noop-publisher] Event: ${JSON.stringify(event)}`);
  }
}
