import { ForbiddenError, SessionClosedError, SessionNotFoundError, ValidationError } from '../domain/entities/errors';
import { ChatRepository } from '../domain/ports/ChatRepository';
import { ChatSessionDto, toSessionDto } from './types';

export interface CloseSessionInput {
  userId: string;
  sessionId: string;
}

export class CloseSession {
  constructor(private readonly repo: ChatRepository) {}

  async execute(input: CloseSessionInput): Promise<ChatSessionDto> {
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
      throw new ForbiddenError('Cannot close another user session');
    }
    if (session.status === 'CLOSED') {
      throw new SessionClosedError(input.sessionId);
    }

    const updated = {
      ...session,
      status: 'CLOSED' as const,
      updatedAt: new Date(),
    };

    await this.repo.updateSession(updated);
    return toSessionDto(updated);
  }
}
