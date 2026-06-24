/**
 * UUID-based id generator used by notification use cases.
 */
import { randomUUID } from 'crypto';
import { IdGenerator } from '../useCases/HandleCatalogEvent';

export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
