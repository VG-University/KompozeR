/**
 * Domain port for unique identifier generation.
 *
 * Abstracts UUID v4 (production) so tests can use deterministic
 * generators with predictable values.
 */
export interface IdGenerator {
  generate(): string;
}
