// RevokeSession — Use case: revoca forzata di una sessione.
// Un utente BASE può revocare solo le proprie sessioni; un ADMIN può revocare
// qualsiasi sessione. La revoca imposta isRevoked=true nel DB.
import { SessionRepository } from '../domain/SessionRepository';
import { UserRepository } from '../domain/UserRepository';
import { UserRole } from '../domain/UserRole';
import { SessionNotFoundError, ForbiddenError } from '../domain/errors';
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
