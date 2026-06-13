export type CartEventType =
  | 'CartCreated'
  | 'ItemAddedToCart'
  | 'ItemRemovedFromCart'
  | 'CartUpdatedFromConfiguration'
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
}
