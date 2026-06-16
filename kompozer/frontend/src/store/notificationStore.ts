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

  async function refreshUnreadCount(): Promise<void> {
    try {
      const res = await notificationService.unreadCount();
      unreadCount.value = res.count;
    } catch {
      // ignora errori di rete silenziosi per il badge
    }
  }

  function addToast(type: ToastMessage['type'], message: string): void {
    const id = crypto.randomUUID();
    toasts.value.push({ id, type, message });
    setTimeout(() => removeToast(id), 4000);
  }

  function removeToast(id: string): void {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

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
    addToast,
    removeToast,
    markRead,
  };
});
