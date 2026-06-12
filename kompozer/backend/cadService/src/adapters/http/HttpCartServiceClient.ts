import http from 'http';
import https from 'https';
import { URL } from 'url';
import { BomItem } from '../../domain/entities/Bom';
import { ResourceConflictError } from '../../domain/entities/errors';
import { CartServiceClient } from '../../domain/ports/CartServiceClient';

export class HttpCartServiceClient implements CartServiceClient {
  constructor(
    private readonly cartBaseUrl: string,
    private readonly timeoutMs = 5000,
  ) {}

  async pushBomToCart(ownerId: string, items: BomItem[]): Promise<void> {
    for (const item of items) {
      await this.upsertItem(ownerId, item);
    }
  }

  private upsertItem(ownerId: string, item: BomItem): Promise<void> {
    const url = new URL(`/cart/items/${encodeURIComponent(item.sku)}`, this.cartBaseUrl);
    const body = JSON.stringify({
      name: item.name,
      unitPrice: item.unitPriceCents,
      quantity: item.quantity,
    });

    return new Promise<void>((resolve, reject) => {
      const client = url.protocol === 'https:' ? https : http;

      const req = client.request(
        url,
        {
          method: 'PUT',
          timeout: this.timeoutMs,
          headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(body),
            'x-user-id': ownerId,
          },
        },
        (res) => {
          const statusCode = res.statusCode ?? 500;
          res.resume(); // drain the response body

          if (statusCode >= 400) {
            reject(
              new ResourceConflictError(
                `Cart service rejected item ${item.sku} with status ${statusCode}`,
              ),
            );
            return;
          }
          resolve();
        },
      );

      req.on('timeout', () => {
        req.destroy();
        reject(new ResourceConflictError('Cart service request timed out'));
      });

      req.on('error', () => {
        reject(new ResourceConflictError('Cart service request failed'));
      });

      req.write(body);
      req.end();
    });
  }
}
