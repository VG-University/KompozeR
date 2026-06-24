/**
 * In-memory fake implementations of domain ports for tests.
 * No dependency on external frameworks (no Mongoose, Redis, etc.).
 * Fakes are deterministic and inspectable so tests can assert side effects.
 */
import { Component }           from '../../src/domain/entities/Component';
import { ComponentRepository, FindAllResult } from '../../src/domain/ports/ComponentRepository';
import { ComponentFilter }     from '../../src/domain/ports/ComponentFilter';
import { CatalogEventPublisher } from '../../src/domain/ports/CatalogEventPublisher';
import { CatalogEvent }        from '../../src/domain/entities/CatalogEvent';
import { Clock }               from '../../src/domain/ports/Clock';
import { IdGenerator }         from '../../src/domain/ports/IdGenerator';
import { VersionConflictError } from '../../src/domain/entities/errors';

// FakeComponentRepository

export class FakeComponentRepository implements ComponentRepository {
  private store: Map<string, Component> = new Map();

  async save(component: Component): Promise<void> {
    this.store.set(component.id, { ...component });
  }

  async findById(id: string): Promise<Component | null> {
    return this.store.get(id) ?? null;
  }

  async findBySku(sku: string): Promise<Component | null> {
    for (const c of this.store.values()) {
      if (c.sku === sku) return { ...c };
    }
    return null;
  }

  async findAll(filter: ComponentFilter): Promise<FindAllResult> {
    let items = [...this.store.values()];

    if (filter.category  !== undefined) items = items.filter(c => c.category  === filter.category);
    if (filter.available !== undefined) items = items.filter(c => c.isAvailable === filter.available);
    if (filter.minPrice  !== undefined) items = items.filter(c => c.price >= filter.minPrice!);
    if (filter.maxPrice  !== undefined) items = items.filter(c => c.price <= filter.maxPrice!);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      items = items.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
      );
    }

    const total = items.length;
    const page  = filter.page  ?? 1;
    const limit = filter.limit ?? 20;
    const start = (page - 1) * limit;
    items = items.slice(start, start + limit);

    return { items: items.map(c => ({ ...c })), total };
  }

  async update(component: Component): Promise<void> {
    const existing = this.store.get(component.id);
    if (!existing) return; // use case guarantees existence before update call
    // [DS] Optimistic concurrency: use case already validated version,
    // here we only persist updated document.
    if (existing.version !== component.version - 1) {
      throw new VersionConflictError(component.id, component.version - 1, existing.version);
    }
    this.store.set(component.id, { ...component });
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  // Test utilities.
  all(): Component[] { return [...this.store.values()]; }
  size(): number     { return this.store.size; }
}

// FakeCatalogEventPublisher

export class FakeCatalogEventPublisher implements CatalogEventPublisher {
  readonly published: CatalogEvent[] = [];

  async publish(event: CatalogEvent): Promise<void> {
    this.published.push(event);
  }

  // Test utility.
  clear(): void { this.published.length = 0; }
}

// FakeClock

export class FakeClock implements Clock {
  constructor(private _now: Date = new Date('2025-01-01T00:00:00.000Z')) {}

  now(): Date { return new Date(this._now); }
  setNow(d: Date): void { this._now = d; }
}

// FakeIdGenerator

export class FakeIdGenerator implements IdGenerator {
  private counter = 0;
  constructor(private readonly prefix: string = 'id') {}

  generate(): string {
    this.counter += 1;
    return `${this.prefix}-${String(this.counter).padStart(3, '0')}`;
  }

  reset(): void { this.counter = 0; }
}

// Helpers

import { ComponentCategory } from '../../src/domain/entities/ComponentCategory';
import { ComponentType }     from '../../src/domain/entities/ComponentType';

/**
 * Builds a test component with overrideable defaults.
 * Useful for seeding FakeComponentRepository in tests.
 */
export function makeComponent(overrides: Partial<Component> = {}): Component {
  return {
    id:             'comp-001',
    sku:            'KMP-SHELF-001',
    name:           'Ripiano 80cm',
    description:    'Ripiano in legno massello 80x30 cm',
    category:       ComponentCategory.TONDO,
    Type:           ComponentType.RIPIANO,
    price:          1990,       // EUR 19.90
    isAvailable:    true,
    imageUrl:       'https://cdn.kompo.it/shelf-001.jpg',
    dimensions:     { widthMm: 800, heightMm: 20, depthMm: 300 },
    compatibleWith: ['KMP-COL-001', 'KMP-COL-002'],
    version:        1,
    createdAt:      new Date('2025-01-01T00:00:00.000Z'),
    updatedAt:      new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  };
}
