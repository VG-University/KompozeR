/**
 * Use case for retrieving a single component by id.
 *
 * Public access: authentication is not required.
 * Throws ComponentNotFoundError (404) if id does not exist.
 */
import { ComponentRepository }     from '../domain/ports/ComponentRepository';
import { ComponentNotFoundError }  from '../domain/entities/errors';
import { GetComponentInput, ComponentDto } from './types';
import { Component }               from '../domain/entities/Component';

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

export class GetComponent {
  constructor(private readonly componentRepo: ComponentRepository) {}

  async execute(input: GetComponentInput): Promise<ComponentDto> {
    const component = await this.componentRepo.findById(input.id);
    if (!component) throw new ComponentNotFoundError(input.id);
    return toDto(component);
  }
}
