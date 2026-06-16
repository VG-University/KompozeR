<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/types/api';

const router = useRouter();
const auth = useAuthStore();

type Mode = 'login' | 'register';
const mode = ref<Mode>('login');
const error = ref('');
const loading = ref(false);

const login = reactive({ username: '', password: '' });
const register = reactive({ username: '', email: '', password: '' });

async function handleLogin(): Promise<void> {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(login.username, login.password);
    await router.push({ name: 'catalog' });
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Errore di accesso';
  } finally {
    loading.value = false;
  }
}

async function handleRegister(): Promise<void> {
  error.value = '';
  loading.value = true;
  try {
    await auth.register(register.username, register.email, register.password);
    await router.push({ name: 'catalog' });
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Errore di registrazione';
  } finally {
    loading.value = false;
  }
}

async function handleGuest(): Promise<void> {
  error.value = '';
  loading.value = true;
  try {
    await auth.loginAsGuest();
    await router.push({ name: 'catalog' });
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Errore accesso ospite';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-view">
    <div class="auth-card">
      <h1 class="auth-title">KompozeR</h1>
      <p class="auth-subtitle">Configura la tua scaffalatura ideale</p>

      <div class="auth-tabs">
        <button :class="['auth-tab', { 'auth-tab--active': mode === 'login' }]" @click="mode = 'login'">Accedi</button>
        <button :class="['auth-tab', { 'auth-tab--active': mode === 'register' }]" @click="mode = 'register'">Registrati</button>
      </div>

      <form v-if="mode === 'login'" class="auth-form" @submit.prevent="handleLogin">
        <label class="field">
          <span class="field__label">Username</span>
          <input v-model="login.username" class="field__input" type="text" required autocomplete="username" />
        </label>
        <label class="field">
          <span class="field__label">Password</span>
          <input v-model="login.password" class="field__input" type="password" required autocomplete="current-password" />
        </label>
        <p v-if="error" class="auth-error">{{ error }}</p>
        <button class="btn btn--primary" type="submit" :disabled="loading">
          {{ loading ? 'Attendere...' : 'Accedi' }}
        </button>
      </form>

      <form v-else class="auth-form" @submit.prevent="handleRegister">
        <label class="field">
          <span class="field__label">Username</span>
          <input v-model="register.username" class="field__input" type="text" required autocomplete="username" />
        </label>
        <label class="field">
          <span class="field__label">Email</span>
          <input v-model="register.email" class="field__input" type="email" required autocomplete="email" />
        </label>
        <label class="field">
          <span class="field__label">Password</span>
          <input v-model="register.password" class="field__input" type="password" required autocomplete="new-password" />
        </label>
        <p v-if="error" class="auth-error">{{ error }}</p>
        <button class="btn btn--primary" type="submit" :disabled="loading">
          {{ loading ? 'Attendere...' : 'Registrati' }}
        </button>
      </form>

      <div class="auth-divider">oppure</div>

      <button class="btn btn--secondary" :disabled="loading" @click="handleGuest">
        Continua come ospite
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--color-background);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-10) var(--space-8);
  box-shadow: var(--shadow-md);
}

.auth-title {
  font-size: var(--font-size-2xl);
  text-align: center;
  margin-bottom: var(--space-1);
}

.auth-subtitle {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-8);
}

.auth-tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.auth-tab {
  flex: 1;
  padding: var(--space-2);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.auth-tab--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.field { display: flex; flex-direction: column; gap: var(--space-1); }
.field__label { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); }
.field__input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: var(--color-background);
  transition: border-color var(--transition-fast);
}
.field__input:focus { border-color: var(--color-accent); outline: none; }

.auth-error {
  font-size: var(--font-size-sm);
  color: var(--color-error);
}

.auth-divider {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: var(--space-4) 0;
}

.btn {
  width: 100%;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn--primary { background: var(--color-accent); color: #fff; }
.btn--primary:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn--secondary { background: var(--color-surface-raised); color: var(--color-text-primary); border: 1px solid var(--color-border); }
.btn--secondary:hover:not(:disabled) { background: var(--color-border-subtle); }
</style>
