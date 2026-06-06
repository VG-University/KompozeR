// SessionRepository — Porta di dominio (interfaccia) per la persistenza delle sessioni.
// Definisce il contratto che deve rispettare qualsiasi implementazione di storage.
// L'implementazione reale è MongoSessionRepository; nei test viene usata FakeSessionRepository.
import { Session } from '../entities/Session';

export interface SessionRepository {
  save(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  findByTokenId(tokenId: string): Promise<Session | null>;
  findAllByUserId(userId: string): Promise<Session[]>;
  update(session: Session): Promise<void>;
}
