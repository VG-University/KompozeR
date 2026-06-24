/**
 * Real implementation of IdGenerator.
 * Generates UUID v4 values via the `uuid` package, providing globally
 * unique identifiers for users, sessions, and tokens.
 */
import { v4 as uuidv4 } from 'uuid';
import { IdGenerator } from '../domain/ports/IdGenerator';

export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return uuidv4();
  }
}
