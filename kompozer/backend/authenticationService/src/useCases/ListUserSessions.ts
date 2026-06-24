/**
 * Use case for listing all sessions of a user.
 *
 * Returns complete session history, including expired and revoked sessions,
 * so clients can render history and support selective revocation.
 */
import { SessionRepository } from '../domain/ports/SessionRepository';
import { ListUserSessionsInput, ListUserSessionsOutput } from './types';

export class ListUserSessions {
  constructor(private readonly sessionRepo: SessionRepository) {}

  async execute(input: ListUserSessionsInput): Promise<ListUserSessionsOutput> {
    const sessions = await this.sessionRepo.findAllByUserId(input.userId);

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        tokenId: s.tokenId,
        loggedIn: s.loggedIn,
        expiresAt: s.expiresAt,
        loggedOut: s.loggedOut,
        isRevoked: s.isRevoked,
      })),
    };
  }
}
