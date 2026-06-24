import { ChatMessage, ChatSession } from '../../domain/entities/ChatSession';
import { ChatRepository } from '../../domain/ports/ChatRepository';
import { ChatMessageModel, ChatSessionModel } from './schemas/chatSchema';

/** MongoDB repository implementation for chatbot sessions and messages. */
export class MongoChatRepository implements ChatRepository {
  async createSession(session: ChatSession): Promise<void> {
    await ChatSessionModel.create({
      _id: session.id,
      userId: session.userId,
      configurationId: session.configurationId,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  }

  /** Maps a chat session document into the domain aggregate. */
  async findSessionById(sessionId: string): Promise<ChatSession | null> {
    const doc = await ChatSessionModel.findById(sessionId).lean();
    if (!doc) return null;

    return {
      id: doc._id,
      userId: doc.userId,
      configurationId: doc.configurationId,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /** Replaces the persisted session state with the provided aggregate. */
  async updateSession(session: ChatSession): Promise<void> {
    await ChatSessionModel.findByIdAndUpdate(session.id, {
      userId: session.userId,
      configurationId: session.configurationId,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  }

  /** Persists a single chat message document. */
  async saveMessage(message: ChatMessage): Promise<void> {
    await ChatMessageModel.create({
      _id: message.id,
      sessionId: message.sessionId,
      role: message.role,
      content: message.content,
      userId: message.userId ?? null,
      createdAt: message.createdAt,
    });
  }

  /** Loads all messages for one session ordered by creation time. */
  async listMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
    const docs = await ChatMessageModel.find({ sessionId }).sort({ createdAt: 1 }).lean();

    return docs.map((doc) => ({
      id: doc._id,
      sessionId: doc.sessionId,
      role: doc.role,
      content: doc.content,
      userId: doc.userId ?? undefined,
      createdAt: doc.createdAt,
    }));
  }
}
