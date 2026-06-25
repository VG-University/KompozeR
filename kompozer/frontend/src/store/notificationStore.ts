/** Notification store for toast queue, unread count, and fetched items. */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Notification } from '@/types/notification';
import { notificationService } from '@/services/notificationService';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export const useNotificationStore = defineStore('notifications', () => {
  const unreadCount = ref(0);
  const toasts = ref<ToastMessage[]>([]);

  /** Fetches current unread count from the API and updates the badge silently. */
  async function refreshUnreadCount(): Promise<void> {
    try {
      const res = await notificationService.unreadCount();
      unreadCount.value = res.count;
    } catch {
      // ignora errori di rete silenziosi per il badge
    }
  }

  /** Increments unread count when an inbound realtime notification is unread. */
  function applyRealtimePush(notification: Notification): void {
    if (!notification.read) {
      unreadCount.value += 1;
    }
  }

  /** Queues a timed toast message and schedules its automatic removal after 4 s. */
  function addToast(type: ToastMessage['type'], message: string): void {
    const id = crypto.randomUUID();
    toasts.value.push({ id, type, message });
    setTimeout(() => removeToast(id), 4000);
  }

  /** Removes a specific toast by id from the queue. */
  function removeToast(id: string): void {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  /** Calls the API to mark a notification read and decrements the unread counter. */
  async function markRead(notification: Notification): Promise<void> {
    await notificationService.markRead(notification.id);
    if (unreadCount.value > 0) {
      unreadCount.value -= 1;
    }
  }

  return {
    unreadCount,
    toasts,
    refreshUnreadCount,
    applyRealtimePush,
    addToast,
    removeToast,
    markRead,
  };
});
