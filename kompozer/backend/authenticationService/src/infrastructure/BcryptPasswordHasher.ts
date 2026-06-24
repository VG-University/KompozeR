/**
 * BcryptPasswordHasher — Real implementation of PasswordHasher.
 * Uses bcryptjs with SALT_ROUNDS=12 to ensure secure and resilient hashing
 * against brute-force attacks. Does not depend on native Node APIs (compatible with edge).
 */
import bcrypt from 'bcryptjs';
import { PasswordHasher } from '../domain/ports/PasswordHasher';

const SALT_ROUNDS = 12;

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
