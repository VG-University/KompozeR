/** Notification domain contracts for push events and unread counters. */
export type NotificationType = 'PRICE_CHANGED' | 'AVAILABILITY_CHANGED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title?: string;
  sku: string;
  message: string;
  contextType?: 'CAD' | 'CART' | 'SUBSCRIPTION';
  contextId?: string;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationsListDto {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface UnreadCountDto {
  count: number;
}
