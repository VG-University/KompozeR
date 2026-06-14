import { ChatMessage, ChatSession, ChatSessionStatus } from '../domain/entities/ChatSession';

export interface ChatSessionDto {
  id: string;
  userId: string;
  configurationId?: string;
  status: ChatSessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageDto {
  id: string;
  sessionId: string;
  role: ChatMessage['role'];
  content: string;
  userId?: string;
  createdAt: string;
}

export function toSessionDto(session: ChatSession): ChatSessionDto {
  return {
    id: session.id,
    userId: session.userId,
    configurationId: session.configurationId,
    status: session.status,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

export function toMessageDto(message: ChatMessage): ChatMessageDto {
  return {
    id: message.id,
    sessionId: message.sessionId,
    role: message.role,
    content: message.content,
    userId: message.userId,
    createdAt: message.createdAt.toISOString(),
  };
}
