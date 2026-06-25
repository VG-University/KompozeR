/** Chatbot HTTP client for sessions, history retrieval, and message posting. */
import { http } from './httpClient';
import type { ChatMessagesListDto, ChatSessionDto, SendChatMessageDto } from '@/types/chatbot';

export const chatbotService = {
  createSession(configurationId?: string): Promise<ChatSessionDto> {
    return http.post<ChatSessionDto>('/chatbot/sessions', configurationId ? { configurationId } : {});
  },

  getSession(sessionId: string): Promise<ChatSessionDto> {
    return http.get<ChatSessionDto>(`/chatbot/sessions/${sessionId}`);
  },

  listMessages(sessionId: string): Promise<ChatMessagesListDto> {
    return http.get<ChatMessagesListDto>(`/chatbot/sessions/${sessionId}/messages`);
  },

  sendMessage(sessionId: string, content: string): Promise<SendChatMessageDto> {
    return http.post<SendChatMessageDto>(`/chatbot/sessions/${sessionId}/messages`, { content });
  },

  closeSession(sessionId: string): Promise<ChatSessionDto> {
    return http.patch<ChatSessionDto>(`/chatbot/sessions/${sessionId}/close`);
  },
};