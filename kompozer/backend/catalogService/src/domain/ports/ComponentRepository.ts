/**
 * Domain port (interface) for component persistence.
 * Defines the contract for any storage implementation.
 * Production implementation is MongoCatalogRepository; tests use fakes.
 *
 * findAll returns paged items plus raw total count.
 *
 * [DS] update must enforce optimistic concurrency:
 * update only when doc.version === component.version - 1,
 * otherwise throw VersionConflictError.
 */
import { Component }       from '../entities/Component';
import { ComponentFilter } from './ComponentFilter';

export interface FindAllResult {
  items: Component[];
  total: number;
}

export interface ComponentRepository {
  save(component: Component): Promise<void>;
  findById(id: string): Promise<Component | null>;
  findBySku(sku: string): Promise<Component | null>;
  findAll(filter: ComponentFilter): Promise<FindAllResult>;
  update(component: Component): Promise<void>;
  delete(id: string): Promise<void>;
}
