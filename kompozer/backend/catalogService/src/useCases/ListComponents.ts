// ListComponents — Use case per la navigazione e il filtraggio del catalogo.
// Accesso pubblico: non richiede autenticazione (fruibile anche da sessioni GUEST).
// Delega il filtraggio al repository e aggiunge la logica di paginazione.
import { ComponentRepository }                   from '../domain/ports/ComponentRepository';
import { ComponentFilter }                        from '../domain/ports/ComponentFilter';
import { ListComponentsInput, PaginatedComponentsDto, ComponentDto } from './types';
import { Component }                              from '../domain/entities/Component';

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

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

export class ListComponents {
  constructor(private readonly componentRepo: ComponentRepository) {}

  async execute(input: ListComponentsInput): Promise<PaginatedComponentsDto> {
    const page  = Math.max(1, input.page  ?? DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, input.limit ?? DEFAULT_LIMIT));

    const filter: ComponentFilter = {
      category:  input.category,
      minPrice:  input.minPrice,
      maxPrice:  input.maxPrice,
      available: input.available,
      search:    input.search,
      page,
      limit,
    };

    const { items, total } = await this.componentRepo.findAll(filter);

    return {
      items:      items.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
