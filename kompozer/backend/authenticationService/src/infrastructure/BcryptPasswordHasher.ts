// BcryptPasswordHasher — Implementazione reale di PasswordHasher.
// Usa bcryptjs con SALT_ROUNDS=12 per garantire un hashing sicuro e resistente
// ad attacchi brute-force. Non dipende da API native di Node (compatibile con edge).
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
