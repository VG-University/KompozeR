/**
 * Domain port for realtime delivery of notifications.
 */
import { Notification } from '../entities/Notification';

export interface NotificationBroadcaster {
  push(notification: Notification): Promise<void>;
}
