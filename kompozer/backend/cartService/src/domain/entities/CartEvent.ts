/**
 * Event contract emitted by cartService for downstream consumers.
 */
export type CartEventType =
  | 'CartCreated'
  | 'ItemAddedToCart'
  | 'ItemRemovedFromCart'
  | 'CartUpdatedFromConfiguration'
  | 'CartItemsRemovedUnavailable'
  | 'CartItemsRestoredAvailable'
  | 'CartPricesUpdated'
  | 'OrderRequestSubmitted'
  | 'OrderConfirmationRequested';

export interface CartEvent {
  eventId: string;
  type: CartEventType;
  occurredAt: string;
  userId: string;
  sku?: string;
  quantity?: number;
  unitPrice?: number;
  source?: 'MANUAL' | 'CONFIGURATION';
  removedSkus?: string[];
  updatedSkus?: string[];
  restoredSkus?: string[];
}
