/** Real Clock implementation using system `new Date()`. */
import { Clock } from '../domain/ports/Clock';

export class SystemClock implements Clock {
  now(): Date { return new Date(); }
}
