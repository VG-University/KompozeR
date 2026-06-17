<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

const auth = useAuthStore();
const notifications = useNotificationStore();
const router = useRouter();

const navLinks = computed(() => {
  if (auth.isAdmin) {
    return [
      { name: 'catalog', label: 'Catalogo' },
      { name: 'cad', label: 'Configuratore' },
      { name: 'cart', label: 'Carrello' },
      { name: 'admin-orders', label: 'Ordini' },
      { name: 'admin-reports', label: 'Report' },
    ];
  }

  if (auth.isGuest) {
    return [
      { name: 'cad', label: 'Configuratore' },
      { name: 'cart', label: 'Carrello' },
      { name: 'chatbot', label: 'Chatbot' },
    ];
  }

  return [
    { name: 'configurations', label: 'Configurazioni' },
    { name: 'cad', label: 'Configuratore' },
    { name: 'cart', label: 'Carrello' },
    { name: 'chatbot', label: 'Chatbot' },
  ];
});

const homeRoute = computed(() => ({ name: auth.homeRouteName }));

async function logout(): Promise<void> {
  auth.logout();
  await router.push({ name: 'auth' });
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <RouterLink :to="homeRoute" class="app-header__logo">
        KompozeR
      </RouterLink>

      <nav class="app-header__nav">
        <RouterLink
          v-for="link in navLinks"
          :key="link.name"
          :to="{ name: link.name }"
          class="app-header__nav-link"
          active-class="app-header__nav-link--active"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="app-header__actions">
        <RouterLink
          v-if="auth.isLoggedIn"
          :to="{ name: 'notifications' }"
          class="app-header__bell"
          aria-label="Notifiche"
        >
          🔔
          <span v-if="notifications.unreadCount > 0" class="app-header__badge">
            {{ notifications.unreadCount }}
          </span>
        </RouterLink>

        <span class="app-header__user">
          {{ auth.isGuest ? 'Guest' : auth.user?.username }}
        </span>

        <button class="app-header__logout" @click="logout">Esci</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
}

.app-header__inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: 0 var(--space-6);
}

.app-header__logo {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  text-decoration: none;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex: 1;
}

.app-header__nav-link {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}

.app-header__nav-link:hover,
.app-header__nav-link--active {
  color: var(--color-accent);
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.app-header__bell {
  position: relative;
  font-size: var(--font-size-lg);
  text-decoration: none;
}

.app-header__badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: var(--color-error);
  color: #fff;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  min-width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}

.app-header__user {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.app-header__logout {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-3);
  cursor: pointer;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.app-header__logout:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-muted);
}
</style>
