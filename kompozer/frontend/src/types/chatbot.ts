export type ChatSessionStatus = 'ACTIVE' | 'CLOSED';
export type ChatMessageRole = 'USER' | 'BOT';

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
  role: ChatMessageRole;
  content: string;
  userId?: string;
  createdAt: string;
}

export interface ChatMessagesListDto {
  items: ChatMessageDto[];
}

export interface SendChatMessageDto {
  sessionId: string;
  userMessage: ChatMessageDto;
  botMessage: ChatMessageDto;
}