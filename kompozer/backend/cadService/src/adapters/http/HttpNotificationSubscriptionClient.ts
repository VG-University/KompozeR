import http from 'http';
import https from 'https';
import { URL } from 'url';
import { ResourceConflictError } from '../../domain/entities/errors';
import { NotificationSubscriptionClient } from '../../domain/ports/NotificationSubscriptionClient';

export class HttpNotificationSubscriptionClient implements NotificationSubscriptionClient {
  constructor(
    private readonly notificationBaseUrl: string,
    private readonly timeoutMs = 5000,
  ) {}

  async ensureProductAvailabilitySubscription(ownerId: string, sku: string): Promise<void> {
    const url = new URL('/notifications/subscriptions', this.notificationBaseUrl);
    const body = JSON.stringify({
      scope: 'PRODUCT',
      targetId: sku,
      events: ['AVAILABILITY_CHANGED'],
      channel: 'IN_APP',
    });

    await new Promise<void>((resolve, reject) => {
      const client = url.protocol === 'https:' ? https : http;

      const req = client.request(
        url,
        {
          method: 'POST',
          timeout: this.timeoutMs,
          headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(body),
            'x-user-id': ownerId,
          },
        },
        (res) => {
          const statusCode = res.statusCode ?? 500;
          res.resume();

          if (statusCode >= 400) {
            reject(
              new ResourceConflictError(
                `Notification service rejected subscription for ${sku} with status ${statusCode}`,
              ),
            );
            return;
          }

          resolve();
        },
      );

      req.on('timeout', () => {
        req.destroy();
        reject(new ResourceConflictError('Notification service request timed out'));
      });

      req.on('error', () => {
        reject(new ResourceConflictError('Notification service request failed'));
      });

      req.write(body);
      req.end();
    });
  }
}
