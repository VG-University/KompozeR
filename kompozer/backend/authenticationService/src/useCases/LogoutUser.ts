// LogoutUser — Use case: chiusura volontaria della sessione corrente.
// Verifica che la sessione esista e appartenga all'utente richiedente,
// poi imposta il campo loggedOut al timestamp corrente.
import { SessionRepository } from '../domain/SessionRepository';
import { Clock } from '../domain/Clock';
import { SessionNotFoundError, ForbiddenError } from '../domain/errors';
import { LogoutUserInput } from './types';

export class LogoutUser {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: LogoutUserInput): Promise<void> {
    const session = await this.sessionRepo.findById(input.sessionId);

    if (!session) throw new SessionNotFoundError();
    if (session.userId !== input.userId) throw new ForbiddenError();

    await this.sessionRepo.update({
      ...session,
      loggedOut: this.clock.now(),
    });
  }
}
