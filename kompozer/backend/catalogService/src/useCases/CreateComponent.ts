/**
 * Use case for adding a new component to the catalog.
 *
 * Requires ADMIN role (enforced at HTTP layer by auth middleware, not here).
 * Throws DuplicateSkuError (409) when SKU is already registered.
 * Throws ValidationError (422) when required input is invalid.
 */
import { ComponentRepository }                from '../domain/ports/ComponentRepository';
import { Clock }                              from '../domain/ports/Clock';
import { IdGenerator }                        from '../domain/ports/IdGenerator';
import { DuplicateSkuError, ValidationError } from '../domain/entities/errors';
import { CreateComponentInput, ComponentDto } from './types';
import { Component }                          from '../domain/entities/Component';

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

export class CreateComponent {
  constructor(
    private readonly componentRepo: ComponentRepository,
    private readonly clock:         Clock,
    private readonly idGenerator:   IdGenerator,
  ) {}

  async execute(input: CreateComponentInput): Promise<ComponentDto> {
    // Input validation.
    const errors: { field: string; reason: string }[] = [];
    if (!input.sku?.trim())  errors.push({ field: 'sku',  reason: 'required' });
    if (!input.name?.trim()) errors.push({ field: 'name', reason: 'required' });
    if (typeof input.price !== 'number' || input.price < 0)
      errors.push({ field: 'price', reason: 'must be a non-negative integer (cents)' });
    if (errors.length > 0)
      throw new ValidationError('Invalid component data', errors);

    // SKU uniqueness.
    const existing = await this.componentRepo.findBySku(input.sku);
    if (existing) throw new DuplicateSkuError(input.sku);

    const now: Date = this.clock.now();
    const component: Component = {
      id:             this.idGenerator.generate(),
      sku:            input.sku.trim(),
      name:           input.name.trim(),
      description:    input.description?.trim() ?? '',
      category:       input.category,
      Type:           input.Type,
      price:          Math.floor(input.price),
      isAvailable:    input.isAvailable,
      imageUrl:       input.imageUrl?.trim() ?? '',
      dimensions:     input.dimensions,
      compatibleWith: input.compatibleWith ?? [],
      version:        1,
      createdAt:      now,
      updatedAt:      now,
    };

    await this.componentRepo.save(component);
    return toDto(component);
  }
}
