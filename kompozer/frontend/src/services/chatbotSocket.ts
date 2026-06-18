import { io, type Socket } from 'socket.io-client';
import type { ChatMessageDto, SendChatMessageDto } from '@/types/chatbot';

interface SendMessageAck {
  ok: boolean;
  output?: SendChatMessageDto;
  error?: string;
}

interface TypingPayload {
  sessionId: string;
  active: boolean;
}

class ChatbotSocketService {
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket) {
      return;
    }

    const token = localStorage.getItem('kompozer_token') ?? '';
    this.socket = io('/', {
      path: '/api/chatbot/socket.io',
      transports: ['polling'],
      query: token ? { token } : undefined,
    });
  }

  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  onNewMessage(handler: (message: ChatMessageDto) => void): () => void {
    this.connect();
    this.socket?.on('chat:message:new', handler);
    return () => this.socket?.off('chat:message:new', handler);
  }

  onError(handler: (payload: { message: string }) => void): () => void {
    this.connect();
    this.socket?.on('chat:error', handler);
    return () => this.socket?.off('chat:error', handler);
  }

  onTyping(handler: (payload: TypingPayload) => void): () => void {
    this.connect();
    this.socket?.on('chat:typing', handler);
    return () => this.socket?.off('chat:typing', handler);
  }

  sendMessage(sessionId: string, content: string): Promise<SendChatMessageDto> {
    this.connect();

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket is not connected'));
        return;
      }

      this.socket.timeout(10000).emit(
        'chat:message:send',
        { sessionId, content },
        (err: Error | null, ack?: SendMessageAck) => {
          if (err) {
            reject(new Error('Timeout invio messaggio realtime'));
            return;
          }

          if (!ack?.ok || !ack.output) {
            reject(new Error(ack?.error ?? 'Invio messaggio realtime fallito'));
            return;
          }

          resolve(ack.output);
        },
      );
    });
  }
}

export const chatbotSocket = new ChatbotSocketService();
