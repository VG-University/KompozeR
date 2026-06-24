/**
 * Real implementation of Clock.
 * Returns `new Date()` from system time.
 * Kept as a dedicated class so tests can inject FakeClock
 * and make all time-dependent computations deterministic.
 */
import { Clock } from '../domain/ports/Clock';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
