/**
 * Use case for forced session revocation.
 *
 * A BASE user can revoke only owned sessions, while an ADMIN can revoke any
 * session. Revocation sets isRevoked=true in persistence.
 */
import { SessionRepository } from '../domain/ports/SessionRepository';
import { UserRepository } from '../domain/ports/UserRepository';
import { UserRole } from '../domain/entities/UserRole';
import { SessionNotFoundError, ForbiddenError } from '../domain/entities/errors';
import { RevokeSessionInput } from './types';

export class RevokeSession {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(input: RevokeSessionInput): Promise<void> {
    const session = await this.sessionRepo.findById(input.sessionId);

    if (!session) throw new SessionNotFoundError();

    const requester = await this.userRepo.findById(input.requestingUserId);
    const isAdmin = requester?.role === UserRole.ADMIN;
    const isOwner = session.userId === input.requestingUserId;

    if (!isAdmin && !isOwner) throw new ForbiddenError();

    await this.sessionRepo.update({ ...session, isRevoked: true });
  }
}
