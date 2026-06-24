import { ForbiddenError, SessionNotFoundError, ValidationError } from '../domain/entities/errors';
import { ChatRepository } from '../domain/ports/ChatRepository';
import { ChatSessionDto, toSessionDto } from './types';

/** Input required to load one chatbot session. */
export interface GetSessionInput {
  userId: string;
  sessionId: string;
}

/** Loads one owned chatbot session. */
export class GetSession {
  constructor(private readonly repo: ChatRepository) {}

  async execute(input: GetSessionInput): Promise<ChatSessionDto> {
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
      throw new ForbiddenError('Cannot access another user session');
    }

    return toSessionDto(session);
  }
}
