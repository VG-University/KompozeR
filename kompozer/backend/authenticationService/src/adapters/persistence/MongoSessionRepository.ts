// MongoSessionRepository — Implementazione MongoDB di SessionRepository.
// Usa Mongoose per le operazioni CRUD sulla collection `sessions`.
// update() aggiorna solo i campi mutabili (loggedOut, isRevoked) lasciando immutabili
// gli altri dati della sessione (userId, tokenId, loggedIn, expiresAt).
import { Session } from '../../domain/entities/Session';
import { SessionRepository } from '../../domain/ports/SessionRepository';
import { SessionModel } from './schemas/sessionSchema';

export class MongoSessionRepository implements SessionRepository {
  async save(session: Session): Promise<void> {
    await SessionModel.create({
      _id: session.id,
      userId: session.userId,
      tokenId: session.tokenId,
      loggedIn: session.loggedIn,
      expiresAt: session.expiresAt,
      loggedOut: session.loggedOut,
      isRevoked: session.isRevoked,
    });
  }

  async findById(id: string): Promise<Session | null> {
    const doc = await SessionModel.findById(id).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findAllByUserId(userId: string): Promise<Session[]> {
    const docs = await SessionModel.find({ userId }).lean();
    return docs.map((d) => this.toEntity(d));
  }

  async update(session: Session): Promise<void> {
    await SessionModel.findByIdAndUpdate(session.id, {
      loggedOut: session.loggedOut,
      isRevoked: session.isRevoked,
    });
  }

  private toEntity(doc: {
    _id: string;
    userId: string;
    tokenId: string;
    loggedIn: Date;
    expiresAt: Date;
    loggedOut: Date | null;
    isRevoked: boolean;
  }): Session {
    return {
      id: doc._id,
      userId: doc.userId,
      tokenId: doc.tokenId,
      loggedIn: doc.loggedIn,
      expiresAt: doc.expiresAt,
      loggedOut: doc.loggedOut,
      isRevoked: doc.isRevoked,
    };
  }
}
