/**
 * Domain port for unique identifier generation.
 * Abstracts UUID v4 in production and predictable generators in tests.
 */
export interface IdGenerator {
  generate(): string;
}
