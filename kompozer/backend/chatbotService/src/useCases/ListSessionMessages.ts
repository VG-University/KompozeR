import { ForbiddenError, SessionNotFoundError, ValidationError } from '../domain/entities/errors';
import { ChatRepository } from '../domain/ports/ChatRepository';
import { ChatMessageDto, toMessageDto } from './types';

export interface ListSessionMessagesInput {
  userId: string;
  sessionId: string;
}

export interface ListSessionMessagesOutput {
  items: ChatMessageDto[];
}

export class ListSessionMessages {
  constructor(private readonly repo: ChatRepository) {}

  async execute(input: ListSessionMessagesInput): Promise<ListSessionMessagesOutput> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }
    if (!input.sessionId?.trim()) {
      throw new ValidationError('sessionId is required');
    }

    const session = await this.repo.findSessionById(input.sessionId);
    if (!session) {
      throw new SessionNotFoundError(input.sessionId);
    }
    if (session.userId !== input.userId) {
      throw new ForbiddenError('Cannot list another user messages');
    }

    const messages = await this.repo.listMessagesBySessionId(input.sessionId);
    return { items: messages.map(toMessageDto) };
  }
}
