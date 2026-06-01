// UuidIdGenerator — Implementazione reale di IdGenerator.
// Genera UUID v4 tramite la libreria `uuid`, garantendo identificatori
// globalmente univoci per utenti, sessioni e token.
import { v4 as uuidv4 } from 'uuid';
import { IdGenerator } from '../domain/ports/IdGenerator';

export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return uuidv4();
  }
}
