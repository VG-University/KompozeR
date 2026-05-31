// ListUserSessions — Use case: elenco di tutte le sessioni di un utente.
// Restituisce la lista completa, incluse quelle scadute o revocate,
// così il client può mostrare la cronologia e permettere la revoca selettiva.
import { SessionRepository } from '../domain/SessionRepository';
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
