import http from 'http';
import https from 'https';
import { URL } from 'url';
import { CadConfigurationProvider, CadConfigurationSnapshot } from '../../domain/ports/CadConfigurationProvider';

/** HTTP adapter that loads CAD configuration context for chatbot answers. */
type CadConfigurationResponse = {
  id?: string;
  status?: string;
  category?: string | null;
  environment?: {
    maxWidthMm?: number;
    maxHeightMm?: number;
  } | null;
  columnPlan?: {
    columnCount?: number;
  } | null;
  bom?: Array<unknown>;
};

/**
 * Retrieves a CAD configuration snapshot through the CAD service API.
 */
export class HttpCadConfigurationProvider implements CadConfigurationProvider {
  constructor(
    private readonly cadBaseUrl: string,
    private readonly timeoutMs = 5000,
  ) {}

  async getById(userId: string, configurationId: string): Promise<CadConfigurationSnapshot | null> {
    const url = new URL(`/cad/configurations/${encodeURIComponent(configurationId)}`, this.cadBaseUrl);

    const payload = await this.getJson<CadConfigurationResponse>(url, {
      'x-user-id': userId,
    });

    if (!payload || typeof payload.id !== 'string') {
      return null;
    }

    return {
      id: payload.id,
      status: typeof payload.status === 'string' ? payload.status : 'UNKNOWN',
      category: typeof payload.category === 'string' ? payload.category : null,
      columnCount:
        payload.columnPlan && typeof payload.columnPlan.columnCount === 'number'
          ? payload.columnPlan.columnCount
          : 0,
      maxWidthMm:
        payload.environment && typeof payload.environment.maxWidthMm === 'number'
          ? payload.environment.maxWidthMm
          : null,
      maxHeightMm:
        payload.environment && typeof payload.environment.maxHeightMm === 'number'
          ? payload.environment.maxHeightMm
          : null,
      componentCount: Array.isArray(payload.bom) ? payload.bom.length : 0,
    };
  }

  /** Performs a GET request with identity headers and parses the response. */
  private getJson<T>(url: URL, headers: Record<string, string>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(
        url,
        {
          method: 'GET',
          timeout: this.timeoutMs,
          headers,
        },
        (res) => {
          const status = res.statusCode ?? 500;
          let raw = '';

          res.on('data', (chunk) => {
            raw += chunk.toString();
          });

          res.on('end', () => {
            if (status === 404 || status === 403) {
              resolve(null as T);
              return;
            }

            if (status >= 400) {
              reject(new Error(`CAD returned ${status}`));
              return;
            }

            try {
              resolve(JSON.parse(raw) as T);
            } catch {
              reject(new Error('Invalid JSON from CAD service'));
            }
          });
        },
      );

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('CAD request timed out'));
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }
}
