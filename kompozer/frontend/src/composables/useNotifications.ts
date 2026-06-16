import { computed, ref } from 'vue';
import { notificationService } from '@/services/notificationService';
import { useNotificationStore } from '@/store/notificationStore';
import type { Notification } from '@/types/notification';
import { ApiError } from '@/types/api';

export function useNotifications() {
  const items = ref<Notification[]>([]);
  const loading = ref(false);
  const error = ref('');

  const unreadOnly = ref(false);
  const page = ref(1);
  const limit = ref(20);
  const total = ref(0);
  const totalPages = ref(1);

  const canPrev = computed(() => page.value > 1);
  const canNext = computed(() => page.value < totalPages.value);

  const notifications = useNotificationStore();

  async function load(): Promise<void> {
    loading.value = true;
    error.value = '';
    try {
      const response = await notificationService.list({
        unread: unreadOnly.value,
        page: page.value,
        limit: limit.value,
      });
      items.value = response.items;
      total.value = response.total;
      totalPages.value = response.totalPages ?? Math.max(1, Math.ceil(response.total / response.limit));
      await notifications.refreshUnreadCount();
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Errore caricamento notifiche';
    } finally {
      loading.value = false;
    }
  }

  async function markAsRead(item: Notification): Promise<void> {
    if (item.read) {
      return;
    }
    try {
      await notifications.markRead(item);
      item.read = true;
      item.readAt = new Date().toISOString();
      notifications.addToast('success', 'Notifica segnata come letta');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Errore aggiornamento notifica';
      notifications.addToast('error', msg);
    }
  }

  async function setUnreadOnly(value: boolean): Promise<void> {
    unreadOnly.value = value;
    page.value = 1;
    await load();
  }

  async function nextPage(): Promise<void> {
    if (!canNext.value) {
      return;
    }
    page.value += 1;
    await load();
  }

  async function prevPage(): Promise<void> {
    if (!canPrev.value) {
      return;
    }
    page.value -= 1;
    await load();
  }

  return {
    items,
    loading,
    error,
    unreadOnly,
    page,
    total,
    totalPages,
    canPrev,
    canNext,
    load,
    markAsRead,
    setUnreadOnly,
    nextPage,
    prevPage,
  };
}
