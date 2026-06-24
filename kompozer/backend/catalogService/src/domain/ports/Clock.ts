/**
 * Domain port for obtaining current timestamp.
 * Abstracts `new Date()` to keep tests deterministic.
 */
export interface Clock {
  now(): Date;
}
