<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useCartStore } from '@/store/cartStore';
import AppHeader from '@/components/layout/AppHeader.vue';
import ToastHost from '@/components/notifications/ToastHost.vue';

const auth = useAuthStore();
const notifications = useNotificationStore();
const cart = useCartStore();

onMounted(async () => {
  if (auth.isLoggedIn) {
    await Promise.all([notifications.refreshUnreadCount(), cart.refreshItemCount()]);
  }
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
