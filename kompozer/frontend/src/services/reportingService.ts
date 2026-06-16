import { http } from './httpClient';
import type { OrderTrendDto } from '@/types/reporting';

export const reportingService = {
  orderTrend(params: { from?: string; to?: string } = {}): Promise<OrderTrendDto> {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    const qs = query.toString();
    return http.get<OrderTrendDto>(`/reports/trends/orders${qs ? `?${qs}` : ''}`);
  },
};
