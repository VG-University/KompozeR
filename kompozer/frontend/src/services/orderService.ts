import { http } from './httpClient';
import type { Order, OrdersListDto } from '@/types/order';

export const orderService = {
  list(params: { page?: number; limit?: number } = {}): Promise<OrdersListDto> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return http.get<OrdersListDto>(`/orders${qs ? `?${qs}` : ''}`);
  },

  get(id: string): Promise<Order> {
    return http.get<Order>(`/orders/${id}`);
  },

  markDone(id: string): Promise<Order> {
    return http.patch<Order>(`/orders/${id}/status`, { status: 'DONE' });
  },

  markCancelled(id: string): Promise<Order> {
    return http.patch<Order>(`/orders/${id}/status`, { status: 'CANCELLED' });
  },
};
