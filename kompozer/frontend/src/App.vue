<script setup lang="ts">
import { onUnmounted, watch } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useCartStore } from '@/store/cartStore';
import { notificationSocket } from '@/services/notificationSocket';
import type { Notification } from '@/types/notification';
import AppHeader from '@/components/layout/AppHeader.vue';
import ToastHost from '@/components/notifications/ToastHost.vue';

const auth = useAuthStore();
const notifications = useNotificationStore();
const cart = useCartStore();
let removeNotificationPushListener: (() => void) | null = null;
let removeConnectionRestoredListener: (() => void) | null = null;

watch(
  () => auth.isLoggedIn,
  async (isLoggedIn) => {
    if (removeNotificationPushListener) {
      removeNotificationPushListener();
      removeNotificationPushListener = null;
    }
    if (removeConnectionRestoredListener) {
      removeConnectionRestoredListener();
      removeConnectionRestoredListener = null;
    }
    notificationSocket.disconnect();

    if (!isLoggedIn) {
      return;
    }

    await Promise.all([notifications.refreshUnreadCount(), cart.refreshItemCount()]);

    removeConnectionRestoredListener = notificationSocket.onConnectionRestored(() => {
      void Promise.all([notifications.refreshUnreadCount(), cart.refreshItemCount()]);
      notifications.addToast('info', 'Connessione realtime ripristinata');
    });

    removeNotificationPushListener = notificationSocket.onPush((payload) => {
      const pushed = payload.data?.notification;
      if (!pushed) {
        return;
      }

      const notification: Notification = {
        id: pushed.id,
        userId: auth.user?.id ?? '',
        type: pushed.type,
        title: pushed.title,
        sku: pushed.target?.targetId ?? '',
        message: pushed.message,
        contextType: pushed.target?.scope,
        contextId: pushed.target?.targetId,
        read: pushed.read,
        createdAt: pushed.createdAt,
      };

      notifications.applyRealtimePush(notification);
      notifications.addToast('warning', notification.message);

      if (notification.type === 'AVAILABILITY_CHANGED') {
        void cart.refreshItemCount();
      }
    });
  },
  { immediate: true },
);

onUnmounted(() => {
  removeNotificationPushListener?.();
  removeConnectionRestoredListener?.();
  removeNotificationPushListener = null;
  removeConnectionRestoredListener = null;
  notificationSocket.disconnect();
});
</script>

<template>
  <div class="app-shell">
    <AppHeader v-if="auth.isLoggedIn" />
    <main class="app-content">
      <RouterView />
    </main>
    <ToastHost />
  </div>
</template>

<style>
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  padding-top: var(--header-height);
}
</style>
