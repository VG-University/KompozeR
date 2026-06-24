/**
 * Use case for voluntarily closing the current session.
 *
 * Verifies session existence and ownership,
 * then sets loggedOut with the current timestamp.
 */
import { SessionRepository } from '../domain/ports/SessionRepository';
import { Clock } from '../domain/ports/Clock';
import { SessionNotFoundError, ForbiddenError } from '../domain/entities/errors';
import { LogoutUserInput } from './types';

export class LogoutUser {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: LogoutUserInput): Promise<void> {
    // Gateway injects X-Session-Id from JWT tokenId, not from DB session id.
    // For compatibility we first try tokenId lookup, then fallback to id.
    let session = await this.sessionRepo.findByTokenId(input.sessionId);
    if (!session) {
      session = await this.sessionRepo.findById(input.sessionId);
    }

    if (!session) throw new SessionNotFoundError();
    if (session.userId !== input.userId) throw new ForbiddenError();

    await this.sessionRepo.update({
      ...session,
      loggedOut: this.clock.now(),
    });
  }
}
