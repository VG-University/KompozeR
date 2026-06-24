/**
 * Domain port (interface) for user persistence.
 *
 * Defines the contract for any storage implementation.
 * Production implementation is MongoUserRepository; tests may use fakes.
 */
import { User } from '../entities/User';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<void>;
}
