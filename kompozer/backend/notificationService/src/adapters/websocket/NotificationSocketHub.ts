/**
 * Socket.IO hub that broadcasts in-app notifications to per-user rooms.
 */
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Notification } from '../../domain/entities/Notification';
import { NotificationBroadcaster } from '../../domain/ports/NotificationBroadcaster';

function roomOf(userId: string): string {
  return `user:${userId}`;
}

function getUserId(socket: Socket): string | null {
  const fromHeader = socket.handshake.headers['x-user-id'];
  if (typeof fromHeader === 'string' && fromHeader.trim().length > 0) {
    return fromHeader;
  }

  const auth = socket.handshake.auth as Record<string, unknown> | undefined;
  if (auth && typeof auth['userId'] === 'string' && auth['userId'].trim().length > 0) {
    return auth['userId'];
  }
  return null;
}

export class NotificationSocketHub implements NotificationBroadcaster {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      path: '/ws/notifications/socket.io',
      cors: {
        origin: '*',
      },
    });

    this.io.on('connection', (socket) => {
      const userId = getUserId(socket);
      if (!userId) {
        socket.emit('notification:error', {
          error: { code: 'UNAUTHORIZED', message: 'Missing identity for websocket connection' },
        });
        socket.disconnect(true);
        return;
      }

      socket.join(roomOf(userId));

      socket.on('notification:subscribe', (payload: { requestId?: string; data?: { userId?: string } }) => {
        const requestedUserId = payload?.data?.userId;
        const targetUserId = requestedUserId && requestedUserId === userId ? requestedUserId : userId;
        socket.join(roomOf(targetUserId));
        socket.emit('notification:subscribe', {
          requestId: payload?.requestId,
          data: { subscribed: true, userId: targetUserId },
        });
      });

      socket.on('notification:unsubscribe', (payload: { requestId?: string; data?: { userId?: string } }) => {
        const requestedUserId = payload?.data?.userId;
        const targetUserId = requestedUserId && requestedUserId === userId ? requestedUserId : userId;
        socket.leave(roomOf(targetUserId));
        socket.emit('notification:unsubscribe', {
          requestId: payload?.requestId,
          data: { subscribed: false, userId: targetUserId },
        });
      });
    });
  }

  async push(notification: Notification): Promise<void> {
    this.io.to(roomOf(notification.userId)).emit('notification:push', {
      event: 'notification:push',
      data: {
        notification: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          target: {
            scope: notification.contextType,
            targetId: notification.contextId,
          },
          read: notification.read,
          createdAt: notification.createdAt.toISOString(),
        },
      },
    });
  }
}
