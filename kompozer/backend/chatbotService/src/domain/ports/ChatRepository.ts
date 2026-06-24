import { ChatMessage, ChatSession } from '../entities/ChatSession';

/** Persistence contract for chatbot sessions and messages. */
export interface ChatRepository {
  createSession(session: ChatSession): Promise<void>;
  findSessionById(sessionId: string): Promise<ChatSession | null>;
  updateSession(session: ChatSession): Promise<void>;
  saveMessage(message: ChatMessage): Promise<void>;
  listMessagesBySessionId(sessionId: string): Promise<ChatMessage[]>;
}
