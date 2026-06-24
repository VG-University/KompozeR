/**
 * Domain port for publishing cart events.
 */
import { CartEvent } from '../entities/CartEvent';

export interface CartEventPublisher {
  publish(event: CartEvent): Promise<void>;
}
