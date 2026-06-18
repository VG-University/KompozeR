export type CartEventType =
  | 'CartCreated'
  | 'ItemAddedToCart'
  | 'ItemRemovedFromCart'
  | 'CartUpdatedFromConfiguration'
  | 'CartItemsRemovedUnavailable'
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
}
