/**
 * Domain port for password hashing and verification.
 *
 * Abstracts hashing implementation (bcrypt in production,
 * deterministic stubs in tests) to keep use cases framework-agnostic.
 */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
