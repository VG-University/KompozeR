import { ChatMessage, ChatSession } from '../../src/domain/entities/ChatSession';
import { ChatRepository } from '../../src/domain/ports/ChatRepository';
import { CatalogQaItem, CatalogQaProvider } from '../../src/domain/ports/CatalogQaProvider';

export class FakeChatRepository implements ChatRepository {
  private sessions = new Map<string, ChatSession>();
  private messages: ChatMessage[] = [];

  async createSession(session: ChatSession): Promise<void> {
    this.sessions.set(session.id, { ...session });
  }

  async findSessionById(sessionId: string): Promise<ChatSession | null> {
    const session = this.sessions.get(sessionId);
    return session ? { ...session } : null;
  }

  async updateSession(session: ChatSession): Promise<void> {
    this.sessions.set(session.id, { ...session });
  }

  async saveMessage(message: ChatMessage): Promise<void> {
    this.messages.push({ ...message });
  }

  async listMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
    return this.messages
      .filter((message) => message.sessionId === sessionId)
      .map((message) => ({ ...message }));
  }
}

export class FakeCatalogQaProvider implements CatalogQaProvider {
  private items: CatalogQaItem[] = [];

  setItems(items: CatalogQaItem[]): void {
    this.items = items.map((item) => ({ ...item }));
  }

  async search(_query: string): Promise<CatalogQaItem[]> {
    return this.items.map((item) => ({ ...item }));
  }
}
