import { io, type Socket } from 'socket.io-client';
import type { Notification } from '@/types/notification';

interface NotificationPushPayload {
  event: 'notification:push';
  data?: {
    notification?: {
      id: string;
      type: Notification['type'];
      title?: string;
      message: string;
      target?: {
        scope?: Notification['contextType'];
        targetId?: string;
      };
      read: boolean;
      createdAt: string;
    };
  };
}

function decodeUserIdFromToken(token: string): string | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalizedPayload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
    const payload = JSON.parse(atob(paddedPayload));
    const userId = payload?.userId;
    return typeof userId === 'string' && userId.trim().length > 0 ? userId : null;
  } catch {
    return null;
  }
}

class NotificationSocketService {
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket) {
      return;
    }

    const token = localStorage.getItem('kompozer_token') ?? '';
    const userId = decodeUserIdFromToken(token);
    if (!token || !userId) {
      return;
    }

    this.socket = io('/', {
      path: '/api/ws/notifications/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 8000,
      randomizationFactor: 0.5,
      timeout: 10000,
      auth: { userId },
      query: { token },
    });
  }

  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.disconnect();
    this.socket = null;
  }

  onPush(handler: (payload: NotificationPushPayload) => void): () => void {
    this.connect();
    this.socket?.on('notification:push', handler);
    return () => this.socket?.off('notification:push', handler);
  }

  onConnectionRestored(handler: () => void): () => void {
    this.connect();

    const socket = this.socket;
    if (!socket) {
      return () => {};
    }

    let disconnectedSinceLastConnect = false;

    const onDisconnect = () => {
      disconnectedSinceLastConnect = true;
    };

    const onConnect = () => {
      if (disconnectedSinceLastConnect) {
        disconnectedSinceLastConnect = false;
        handler();
      }
    };

    socket.on('disconnect', onDisconnect);
    socket.on('connect', onConnect);

    return () => {
      socket.off('disconnect', onDisconnect);
      socket.off('connect', onConnect);
    };
  }
}

export const notificationSocket = new NotificationSocketService();
