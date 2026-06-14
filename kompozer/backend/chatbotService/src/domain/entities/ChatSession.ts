export type ChatSessionStatus = 'ACTIVE' | 'CLOSED';

export interface ChatSession {
  id: string;
  userId: string;
  configurationId?: string;
  status: ChatSessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatMessageRole = 'USER' | 'BOT';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  userId?: string;
  createdAt: Date;
}
