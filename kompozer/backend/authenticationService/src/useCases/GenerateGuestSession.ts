// GenerateGuestSession — Use case: generazione di una sessione ospite.
// Crea un utente virtuale con ruolo GUEST (senza credenziali e senza persistere su users),
// genera una sessione con scadenza e firma un JWT. Usato per accesso anonimo al catalogo e al CAD.
import { SessionRepository } from '../domain/ports/SessionRepository';
import { TokenSigner } from '../domain/ports/TokenSigner';
import { Clock } from '../domain/ports/Clock';
import { IdGenerator } from '../domain/ports/IdGenerator';
import { UserRole } from '../domain/entities/UserRole';
import { GenerateGuestSessionOutput } from './types';

export class GenerateGuestSession {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly signer: TokenSigner,
    private readonly clock: Clock,
    private readonly guestIdGen: IdGenerator,
    private readonly sessionIdGen: IdGenerator,
    private readonly tokenIdGen: IdGenerator,
    private readonly sessionTtlMs: number,
  ) {}

  async execute(): Promise<GenerateGuestSessionOutput> {
    const now = this.clock.now();
    const guestId = this.guestIdGen.generate();
    const sessionId = this.sessionIdGen.generate();
    const tokenId = this.tokenIdGen.generate();
    const expiresAt = new Date(now.getTime() + this.sessionTtlMs);

    const session = {
      id: sessionId,
      userId: guestId,
      tokenId,
      loggedIn: now,
      expiresAt,
      loggedOut: null,
      isRevoked: false,
    };

    await this.sessionRepo.save(session);

    const token = this.signer.sign(
      { userId: guestId, tokenId, role: UserRole.GUEST },
      this.sessionTtlMs / 1000,
    );

    return {
      token,
      session: {
        id: session.id,
        tokenId: session.tokenId,
        loggedIn: session.loggedIn,
        expiresAt: session.expiresAt,
      },
      user: {
        id: guestId,
        username: `guest_${guestId}`,
        role: UserRole.GUEST,
      },
    };
  }
}
