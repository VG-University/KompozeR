import http from 'http';
import https from 'https';
import { URL } from 'url';
import { Category } from '../../domain/entities/Category';
import { ResourceConflictError, ValidationError } from '../../domain/entities/errors';
import {
  CatalogComponentRule,
  CatalogComponentType,
  CatalogRules,
  CatalogRulesProvider,
} from '../../domain/ports/CatalogRulesProvider';

interface CatalogListItem {
  Type: unknown;
  dimensions: {
    widthMm: unknown;
    heightMm: unknown;
    depthMm: unknown;
  };
}

interface CatalogListResponse {
  items: CatalogListItem[];
}

export class HttpCatalogRulesProvider implements CatalogRulesProvider {
  constructor(
    private readonly catalogBaseUrl: string,
    private readonly timeoutMs = 3000,
  ) {}

  async getRules(category: Category): Promise<CatalogRules> {
    const url = new URL('/catalog', this.catalogBaseUrl);
    url.searchParams.set('category', category);
    url.searchParams.set('limit', '500');

    const data = await this.getJson<CatalogListResponse>(url);
    if (!data || !Array.isArray(data.items)) {
      throw new ResourceConflictError('Catalog response does not contain a valid items array');
    }

    const shelfByWidthMm = new Map<number, CatalogComponentRule>();
    const terminalHeightsMm: number[] = [];
    const footHeightsMm: number[] = [];
    const uprightHeightsMm: number[] = [];

    for (const item of data.items) {
      const type = this.parseType(item.Type);
      const widthMm = Number(item.dimensions?.widthMm);
      const heightMm = Number(item.dimensions?.heightMm);
      const depthMm = Number(item.dimensions?.depthMm);

      if ([widthMm, heightMm, depthMm].some((value) => Number.isNaN(value) || value <= 0)) {
        continue;
      }

      const rule: CatalogComponentRule = {
        type,
        widthMm,
        heightMm,
        depthMm,
      };

      if (type === 'RIPIANO') {
        shelfByWidthMm.set(widthMm, rule);
      }
      if (type === 'TERMINALE') {
        terminalHeightsMm.push(heightMm);
      }
      if (type === 'PIEDINO') {
        footHeightsMm.push(heightMm);
      }
      if (type === 'MONTANTE') {
        uprightHeightsMm.push(heightMm);
      }
    }

    return {
      shelfByWidthMm,
      terminalHeightsMm: uniqueSorted(terminalHeightsMm),
      footHeightsMm: uniqueSorted(footHeightsMm),
      uprightHeightsMm: uniqueSorted(uprightHeightsMm),
    };
  }

  private parseType(type: unknown): CatalogComponentType {
    if (
      type === 'PIEDINO' ||
      type === 'MONTANTE' ||
      type === 'RIPIANO' ||
      type === 'TERMINALE' ||
      type === 'MENSOLA'
    ) {
      return type;
    }

    throw new ValidationError('Catalog returned an unknown component type');
  }

  private getJson<T>(url: URL): Promise<T> {
    const client = url.protocol === 'https:' ? https : http;

    return new Promise<T>((resolve, reject) => {
      const req = client.get(url, { timeout: this.timeoutMs }, (res) => {
        const statusCode = res.statusCode ?? 500;
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8');

          if (statusCode >= 400) {
            reject(new ResourceConflictError(`Catalog request failed with status ${statusCode}`));
            return;
          }

          try {
            resolve(JSON.parse(body) as T);
          } catch {
            reject(new ResourceConflictError('Catalog response is not valid JSON'));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new ResourceConflictError('Catalog request timed out'));
      });

      req.on('error', () => {
        reject(new ResourceConflictError('Catalog request failed'));
      });
    });
  }
}

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}
