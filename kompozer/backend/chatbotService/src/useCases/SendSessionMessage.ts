import { randomUUID } from 'crypto';
import { ChatMessage } from '../domain/entities/ChatSession';
import {
  CatalogLookupError,
  ForbiddenError,
  SessionClosedError,
  SessionNotFoundError,
  ValidationError,
} from '../domain/entities/errors';
import { CatalogQaProvider } from '../domain/ports/CatalogQaProvider';
import { ChatRepository } from '../domain/ports/ChatRepository';
import { ChatMessageDto, toMessageDto } from './types';

export interface SendSessionMessageInput {
  userId: string;
  sessionId: string;
  content: string;
}

export interface SendSessionMessageOutput {
  sessionId: string;
  userMessage: ChatMessageDto;
  botMessage: ChatMessageDto;
}

export class SendSessionMessage {
  constructor(
    private readonly repo: ChatRepository,
    private readonly catalog: CatalogQaProvider,
  ) {}

  async execute(input: SendSessionMessageInput): Promise<SendSessionMessageOutput> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }
    if (!input.sessionId?.trim()) {
      throw new ValidationError('sessionId is required');
    }
    if (!input.content?.trim()) {
      throw new ValidationError('content is required');
    }

    const session = await this.repo.findSessionById(input.sessionId);
    if (!session) {
      throw new SessionNotFoundError(input.sessionId);
    }
    if (session.userId !== input.userId) {
      throw new ForbiddenError('Cannot send message to another user session');
    }
    if (session.status === 'CLOSED') {
      throw new SessionClosedError(input.sessionId);
    }

    const now = new Date();
    const userMessage: ChatMessage = {
      id: randomUUID(),
      sessionId: input.sessionId,
      role: 'USER',
      content: input.content.trim(),
      userId: input.userId,
      createdAt: now,
    };
    await this.repo.saveMessage(userMessage);

    const answer = await this.generateAnswer(input.content);
    const botMessage: ChatMessage = {
      id: randomUUID(),
      sessionId: input.sessionId,
      role: 'BOT',
      content: answer,
      createdAt: new Date(),
    };
    await this.repo.saveMessage(botMessage);

    await this.repo.updateSession({
      ...session,
      updatedAt: new Date(),
    });

    return {
      sessionId: input.sessionId,
      userMessage: toMessageDto(userMessage),
      botMessage: toMessageDto(botMessage),
    };
  }

  private async generateAnswer(question: string): Promise<string> {
    const normalized = question.trim();

    let items;
    try {
      items = await this.catalog.search(normalized);
    } catch {
      throw new CatalogLookupError('Unable to retrieve catalog data for chatbot response');
    }

    if (items.length === 0) {
      return 'Non trovo componenti corrispondenti alla tua domanda nel catalogo corrente.';
    }

    const top = items.slice(0, 3);
    const lines = top.map((item) => {
      const availability = item.isAvailable ? 'disponibile' : 'non disponibile';
      const euro = (item.price / 100).toFixed(2).replace('.', ',');
      return `- ${item.name} (${item.sku}): ${euro} EUR, ${availability}`;
    });

    return `Ho trovato questi componenti nel catalogo:\n${lines.join('\n')}`;
  }
}
