/**
 * Use case for clearing all items in a user cart.
 */
import { CartRepository } from '../domain/ports/CartRepository';
import { CartEvent } from '../domain/entities/CartEvent';
import { CartEventPublisher } from '../domain/ports/CartEventPublisher';
import { ClearCartInput } from './types';

export class ClearCart {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly eventPublisher: CartEventPublisher = { publish: async () => {} },
  ) {}

  async execute(input: ClearCartInput): Promise<void> {
    await this.cartRepo.clear(input.userId);
    await this.eventPublisher.publish(
      this.buildEvent({
        type: 'CartUpdatedFromConfiguration',
        userId: input.userId,
        source: 'CONFIGURATION',
      }),
    );
  }

  private buildEvent(event: Omit<CartEvent, 'eventId' | 'occurredAt'>): CartEvent {
    return {
      ...event,
      eventId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      occurredAt: new Date().toISOString(),
    };
  }
}
