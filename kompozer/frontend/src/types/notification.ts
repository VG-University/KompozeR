export type NotificationType = 'PRICE_CHANGED' | 'AVAILABILITY_CHANGED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  sku: string;
  message: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationsListDto {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface UnreadCountDto {
  count: number;
}
