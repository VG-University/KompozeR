// UuidIdGenerator — Implementazione reale di IdGenerator. Usa UUID v4.
import { v4 as uuidv4 } from 'uuid';
import { IdGenerator }  from '../domain/ports/IdGenerator';

export class UuidIdGenerator implements IdGenerator {
  generate(): string { return uuidv4(); }
}
