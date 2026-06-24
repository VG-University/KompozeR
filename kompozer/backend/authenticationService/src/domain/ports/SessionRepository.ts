/**
 * Domain port (interface) for session persistence.
 *
 * Defines the contract for any storage implementation.
 * Production implementation is MongoSessionRepository; tests may use fakes.
 */
import { Session } from '../entities/Session';

export interface SessionRepository {
  save(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  findByTokenId(tokenId: string): Promise<Session | null>;
  findAllByUserId(userId: string): Promise<Session[]>;
  update(session: Session): Promise<void>;
}
