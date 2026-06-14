import { ChatMessage, ChatSession } from '../../domain/entities/ChatSession';
import { ChatRepository } from '../../domain/ports/ChatRepository';
import { ChatMessageModel, ChatSessionModel } from './schemas/chatSchema';

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

  async updateSession(session: ChatSession): Promise<void> {
    await ChatSessionModel.findByIdAndUpdate(session.id, {
      userId: session.userId,
      configurationId: session.configurationId,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  }

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
