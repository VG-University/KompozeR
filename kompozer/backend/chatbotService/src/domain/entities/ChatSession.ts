export type ChatSessionStatus = 'ACTIVE' | 'CLOSED';

/** Persistent session aggregate for chatbot conversations. */
export interface ChatSession {
  id: string;
  userId: string;
  configurationId?: string;
  status: ChatSessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatMessageRole = 'USER' | 'BOT';

/** Persistent message aggregate for chatbot conversations. */
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  userId?: string;
  createdAt: Date;
}
