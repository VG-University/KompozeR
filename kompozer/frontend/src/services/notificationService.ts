/** Notifications API client for list retrieval, unread counters, and mark-as-read. */
import { http } from './httpClient';
import type { NotificationsListDto, UnreadCountDto, Notification } from '@/types/notification';

export const notificationService = {
  list(params: { unread?: boolean; page?: number; limit?: number } = {}): Promise<NotificationsListDto> {
    const query = new URLSearchParams();
    if (params.unread) query.set('unread', 'true');
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return http.get<NotificationsListDto>(`/notifications${qs ? `?${qs}` : ''}`);
  },

  unreadCount(): Promise<UnreadCountDto> {
    return http.get<UnreadCountDto>('/notifications/unread/count');
  },

  markRead(id: string): Promise<Notification> {
    return http.patch<Notification>(`/notifications/${id}/read`);
  },
};
