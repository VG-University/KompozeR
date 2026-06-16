import { http } from './httpClient';
import type { CatalogItem, CatalogListDto } from '@/types/catalog';

export interface CatalogListParams {
  search?: string;
  category?: string;
  available?: boolean;
  page?: number;
  limit?: number;
}

export const catalogService = {
  list(params: CatalogListParams = {}): Promise<CatalogListDto> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.available !== undefined) query.set('available', String(params.available));
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return http.get<CatalogListDto>(`/catalog${qs ? `?${qs}` : ''}`);
  },

  get(id: string): Promise<CatalogItem> {
    return http.get<CatalogItem>(`/catalog/${id}`);
  },
};
