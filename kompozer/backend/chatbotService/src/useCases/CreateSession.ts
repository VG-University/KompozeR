import { randomUUID } from 'crypto';
import { ChatSession } from '../domain/entities/ChatSession';
import { ValidationError } from '../domain/entities/errors';
import { ChatRepository } from '../domain/ports/ChatRepository';
import { ChatSessionDto, toSessionDto } from './types';

export interface CreateSessionInput {
  userId: string;
  configurationId?: string;
}

export class CreateSession {
  constructor(private readonly repo: ChatRepository) {}

  async execute(input: CreateSessionInput): Promise<ChatSessionDto> {
    if (!input.userId?.trim()) {
      throw new ValidationError('userId is required');
    }

    const now = new Date();
    const session: ChatSession = {
      id: randomUUID(),
      userId: input.userId,
      configurationId: input.configurationId,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    await this.repo.createSession(session);
    return toSessionDto(session);
  }
}
