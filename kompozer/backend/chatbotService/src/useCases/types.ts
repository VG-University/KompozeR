import { ChatMessage, ChatSession, ChatSessionStatus } from '../domain/entities/ChatSession';

/** API view of a chatbot session. */
export interface ChatSessionDto {
  id: string;
  userId: string;
  configurationId?: string;
  status: ChatSessionStatus;
  createdAt: string;
  updatedAt: string;
}

/** API view of a chatbot message. */
export interface ChatMessageDto {
  id: string;
  sessionId: string;
  role: ChatMessage['role'];
  content: string;
  userId?: string;
  createdAt: string;
}

/** Maps a domain session to the transport DTO. */
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

/** Maps a domain message to the transport DTO. */
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
