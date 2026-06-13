import { Notification } from '../entities/Notification';

export interface NotificationBroadcaster {
  push(notification: Notification): Promise<void>;
}
