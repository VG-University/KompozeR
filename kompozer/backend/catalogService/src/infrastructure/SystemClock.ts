// SystemClock — Implementazione reale di Clock. Usa `new Date()` del sistema.
import { Clock } from '../domain/ports/Clock';

export class SystemClock implements Clock {
  now(): Date { return new Date(); }
}
