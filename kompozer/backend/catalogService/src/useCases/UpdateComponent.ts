/**
 * Use case for updating an existing component.
 *
 * Requires ADMIN role.
 *
 * [DS] Optimistic Concurrency Control:
 * The client must send expectedVersion.
 * If DB version differs, VersionConflictError (409) is thrown.
 * On success, version is incremented by 1.
 *
 * [DS] Event publishing:
 * If price or availability changes, the corresponding CatalogEvent is published.
 * notificationService subscribes and notifies impacted users.
 */
import { ComponentRepository }                             from '../domain/ports/ComponentRepository';
import { CatalogEventPublisher }                           from '../domain/ports/CatalogEventPublisher';
import { Clock }                                           from '../domain/ports/Clock';
import { IdGenerator }                                     from '../domain/ports/IdGenerator';
import { ComponentNotFoundError, VersionConflictError }    from '../domain/entities/errors';
import { PriceChangedEvent, AvailabilityChangedEvent }    from '../domain/entities/CatalogEvent';
import { UpdateComponentInput, ComponentDto }              from './types';
import { Component }                                       from '../domain/entities/Component';

function toDto(c: Component): ComponentDto {
  return {
    id:             c.id,
    sku:            c.sku,
    name:           c.name,
    description:    c.description,
    category:       c.category,
    Type:           c.Type,
    price:          c.price,
    isAvailable:    c.isAvailable,
    imageUrl:       c.imageUrl,
    dimensions:     c.dimensions,
    compatibleWith: c.compatibleWith,
    version:        c.version,
    createdAt:      c.createdAt.toISOString(),
    updatedAt:      c.updatedAt.toISOString(),
  };
}

export class UpdateComponent {
  constructor(
    private readonly componentRepo:   ComponentRepository,
    private readonly eventPublisher:  CatalogEventPublisher,
    private readonly clock:           Clock,
    private readonly eventIdGenerator: IdGenerator,
  ) {}

  async execute(input: UpdateComponentInput): Promise<ComponentDto> {
    const existing = await this.componentRepo.findById(input.id);
    if (!existing) throw new ComponentNotFoundError(input.id);

    // [DS] Optimistic concurrency check
    if (existing.version !== input.expectedVersion) {
      throw new VersionConflictError(input.id, input.expectedVersion, existing.version);
    }

    const now = this.clock.now();

    // Compute updated values.
    const newPrice       = input.price       !== undefined ? Math.floor(input.price) : existing.price;
    const newIsAvailable = input.isAvailable !== undefined ? input.isAvailable : existing.isAvailable;

    const updated: Component = {
      ...existing,
      name:           input.name           ?? existing.name,
      description:    input.description    ?? existing.description,
      price:          newPrice,
      isAvailable:    newIsAvailable,
      imageUrl:       input.imageUrl       ?? existing.imageUrl,
      dimensions:     input.dimensions     ?? existing.dimensions,
      compatibleWith: input.compatibleWith ?? existing.compatibleWith,
      version:        existing.version + 1,  // [DS] increment version
      updatedAt:      now,
    };

    await this.componentRepo.update(updated);

    // [DS] Publish events only when relevant values changed.
    if (newPrice !== existing.price) {
      const event: PriceChangedEvent = {
        type:        'PRICE_CHANGED',
        eventId:     this.eventIdGenerator.generate(),
        occurredAt:  now,
        componentId: existing.id,
        sku:         existing.sku,
        changedBy:   input.requestingUserId,
        oldPrice:    existing.price,
        newPrice,
      };
      await this.eventPublisher.publish(event);
    }

    if (newIsAvailable !== existing.isAvailable) {
      const event: AvailabilityChangedEvent = {
        type:           'AVAILABILITY_CHANGED',
        eventId:        this.eventIdGenerator.generate(),
        occurredAt:     now,
        componentId:    existing.id,
        sku:            existing.sku,
        changedBy:      input.requestingUserId,
        oldIsAvailable: existing.isAvailable,
        newIsAvailable,
      };
      await this.eventPublisher.publish(event);
    }

    return toDto(updated);
  }
}
