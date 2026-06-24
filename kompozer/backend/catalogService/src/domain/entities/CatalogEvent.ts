/**
 * [DS] Discriminated union of events published by catalogService.
 *
 * Events are published on Redis Pub/Sub whenever an admin updates price
 * or availability. notificationService subscribes, finds impacted CAD
 * configurations, and sends push notifications.
 *
 * Each event carries before/after values so subscribers can build user-facing
 * messages without additional queries.
 */

export type CatalogEventType = 'PRICE_CHANGED' | 'AVAILABILITY_CHANGED';

interface CatalogEventBase {
  eventId:     string;           // unique event UUID
  occurredAt:  Date;             // generation timestamp (server clock)
  componentId: string;           // updated component id
  sku:         string;           // component SKU (duplicated for subscriber convenience)
  changedBy:   string;           // admin userId performing the change
}

export interface PriceChangedEvent extends CatalogEventBase {
  type:     'PRICE_CHANGED';
  oldPrice: number;              // cents, previous value
  newPrice: number;              // cents, updated value
}

export interface AvailabilityChangedEvent extends CatalogEventBase {
  type:            'AVAILABILITY_CHANGED';
  oldIsAvailable:  boolean;
  newIsAvailable:  boolean;
}

// Union type used throughout code as the single catalog event type.
export type CatalogEvent = PriceChangedEvent | AvailabilityChangedEvent;
