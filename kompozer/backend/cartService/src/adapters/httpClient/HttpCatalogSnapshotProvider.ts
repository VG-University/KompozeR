import http from 'http';
import https from 'https';
import { URL } from 'url';
import { CatalogLookupError } from '../../domain/entities/errors';
import { CatalogItemSnapshot, CatalogSnapshotProvider } from '../../domain/ports/CatalogSnapshotProvider';

type CatalogListResponse = {
  items?: Array<{
    sku?: string;
    price?: number;
    isAvailable?: boolean;
  }>;
};

export class HttpCatalogSnapshotProvider implements CatalogSnapshotProvider {
  constructor(
    private readonly catalogBaseUrl: string,
    private readonly timeoutMs = 5000,
  ) {}

  async getBySku(sku: string): Promise<CatalogItemSnapshot | null> {
    const encoded = encodeURIComponent(sku);
    const url = new URL(`/catalog?search=${encoded}&limit=100`, this.catalogBaseUrl);

    const payload = await this.getJson<CatalogListResponse>(url);
    const items = payload.items ?? [];
    const match = items.find((i) => i.sku === sku);
    if (!match || typeof match.price !== 'number' || typeof match.isAvailable !== 'boolean') {
      return null;
    }

    return {
      sku,
      unitPrice: match.price,
      isAvailable: match.isAvailable,
    };
  }

  private getJson<T>(url: URL): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(
        url,
        {
          method: 'GET',
          timeout: this.timeoutMs,
        },
        (res) => {
          const status = res.statusCode ?? 500;
          let raw = '';

          res.on('data', (chunk) => {
            raw += chunk.toString();
          });

          res.on('end', () => {
            if (status >= 400) {
              reject(new CatalogLookupError(`Catalog returned ${status}`));
              return;
            }

            try {
              resolve(JSON.parse(raw) as T);
            } catch {
              reject(new CatalogLookupError('Invalid JSON from catalog service'));
            }
          });
        },
      );

      req.on('timeout', () => {
        req.destroy();
        reject(new CatalogLookupError('Catalog request timed out'));
      });

      req.on('error', () => {
        reject(new CatalogLookupError('Catalog request failed'));
      });

      req.end();
    });
  }
}
