/**
 * Catalog event contract consumed by notificationService.
 */
export type CatalogEventType = 'PRICE_CHANGED' | 'AVAILABILITY_CHANGED';

interface CatalogEventBase {
  eventId: string;
  occurredAt: string | Date;
  componentId: string;
  sku: string;
  changedBy: string;
}

export interface PriceChangedEvent extends CatalogEventBase {
  type: 'PRICE_CHANGED';
  oldPrice: number;
  newPrice: number;
}

export interface AvailabilityChangedEvent extends CatalogEventBase {
  type: 'AVAILABILITY_CHANGED';
  oldIsAvailable: boolean;
  newIsAvailable: boolean;
}

export type CatalogEvent = PriceChangedEvent | AvailabilityChangedEvent;