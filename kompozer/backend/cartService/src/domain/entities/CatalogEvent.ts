/**
 * Catalog event contract consumed by cartService subscriber.
 */
export type CatalogEventType = 'PRICE_CHANGED' | 'AVAILABILITY_CHANGED';

interface CatalogEventBase {
  eventId: string;
  occurredAt: string | Date;
  componentId: string;
  sku: string;
  changedBy: string;
}

interface PriceChangedEvent extends CatalogEventBase {
  type: 'PRICE_CHANGED';
  oldPrice: number;
  newPrice: number;
}

interface AvailabilityChangedEvent extends CatalogEventBase {
  type: 'AVAILABILITY_CHANGED';
  oldIsAvailable: boolean;
  newIsAvailable: boolean;
}

export type CatalogEvent = PriceChangedEvent | AvailabilityChangedEvent;
