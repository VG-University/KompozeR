<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/types/api';
import appLogo from '@/assets/images/kompozer-logo.png';

const router = useRouter();
const auth = useAuthStore();

type Mode = 'login' | 'register';
const mode = ref<Mode>('login');
const error = ref('');
const loading = ref(false);
const showRegistrationSuccess = ref(false);

const login = reactive({ username: '', password: '' });
const register = reactive({ username: '', email: '', password: '' });

function mapLoginError(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return 'Errore di accesso';
  }

  if (err.code === 'RESOURCE_NOT_FOUND') {
    return 'Utente Non Trovato';
  }

  if (err.code === 'INVALID_PASSWORD') {
    return 'Password Errata';
  }

  return 'Invalid username or password';
}

function mapRegisterError(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return 'Errore di registrazione';
  }

  if (err.code === 'VALIDATION_ERROR') {
    const passwordReasons = Array.isArray(err.details)
      ? err.details
          .filter((detail): detail is { field?: unknown; reason?: unknown } => typeof detail === 'object' && detail !== null)
          .filter((detail) => detail.field === 'password' && typeof detail.reason === 'string')
          .map((detail) => detail.reason)
      : [];

    if (passwordReasons.length > 0) {
      return `Password non valida, si richiedono 8 caratteri. ${passwordReasons.join(' ')}`;
    }
  }

  return err.message;
}

async function handleLogin(): Promise<void> {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(login.username, login.password);
    await router.push({ name: 'catalog' });
  } catch (e) {
    error.value = mapLoginError(e);
  } finally {
    loading.value = false;
  }
}

async function handleRegister(): Promise<void> {
  error.value = '';
  loading.value = true;
  try {
    await auth.register(register.username, register.email, register.password);
    auth.logout();
    login.username = register.username;
    login.password = '';
    register.password = '';
    mode.value = 'login';
    showRegistrationSuccess.value = true;
  } catch (e) {
    error.value = mapRegisterError(e);
  } finally {
    loading.value = false;
  }
}

function handleRegistrationSuccessAcknowledge(): void {
  showRegistrationSuccess.value = false;
  error.value = '';
  mode.value = 'login';
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
      <img :src="appLogo" alt="KompozeR" class="auth-logo" />
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

    <div v-if="showRegistrationSuccess" class="auth-modal-backdrop" role="presentation">
      <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="registration-success-title">
        <h2 id="registration-success-title" class="auth-modal__title">Registrazione effettuata</h2>
        <button class="btn btn--primary" type="button" @click="handleRegistrationSuccessAcknowledge">
          Accedi
        </button>
      </div>
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

.auth-logo {
  display: block;
  width: min(220px, 70%);
  margin: 0 auto var(--space-3);
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

.auth-modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: rgb(15 23 42 / 0.45);
}

.auth-modal {
  width: min(360px, 100%);
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.auth-modal__title {
  margin: 0 0 var(--space-6);
  text-align: center;
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
}
</style>
