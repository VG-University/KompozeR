// LoginUser — Use case: autenticazione di un utente esistente.
// Verifica le credenziali, crea una nuova sessione in DB e firma un JWT con userId,
// tokenId e ruolo. Restituisce il token, il riepilogo della sessione e del profilo utente.
import { UserRepository } from '../domain/ports/UserRepository';
import { SessionRepository } from '../domain/ports/SessionRepository';
import { PasswordHasher } from '../domain/ports/PasswordHasher';
import { TokenSigner } from '../domain/ports/TokenSigner';
import { Clock } from '../domain/ports/Clock';
import { IdGenerator } from '../domain/ports/IdGenerator';
import { InvalidCredentialsError } from '../domain/entities/errors';
import { LoginUserInput, LoginUserOutput } from './types';

export class LoginUser {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly hasher: PasswordHasher,
    private readonly signer: TokenSigner,
    private readonly clock: Clock,
    private readonly sessionIdGen: IdGenerator,
    private readonly tokenIdGen: IdGenerator,
    private readonly sessionTtlMs: number,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.userRepo.findByUsername(input.username);

    if (!user) throw new InvalidCredentialsError();

    const passwordValid = await this.hasher.compare(input.password, user.passwordHash);
    if (!passwordValid) throw new InvalidCredentialsError();

    const now = this.clock.now();
    const sessionId = this.sessionIdGen.generate();
    const tokenId = this.tokenIdGen.generate();
    const expiresAt = new Date(now.getTime() + this.sessionTtlMs);

    const session = {
      id: sessionId,
      userId: user.id,
      tokenId,
      loggedIn: now,
      expiresAt,
      loggedOut: null,
      isRevoked: false,
    };

    await this.sessionRepo.save(session);

    const token = this.signer.sign(
      { userId: user.id, tokenId, role: user.role },
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
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}
