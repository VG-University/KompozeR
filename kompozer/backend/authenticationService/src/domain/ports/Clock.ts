/**
 * Domain port for obtaining the current timestamp.
 *
 * Abstracts `new Date()` so tests can inject fixed time (FakeClock)
 * and keep time-based logic deterministic.
 */
export interface Clock {
  now(): Date;
}
