import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthUser } from '@/types/auth';
import { authService } from '@/services/authService';

const TOKEN_KEY = 'kompozer_token';
const ROLE_KEY = 'kompozer_role';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const user = ref<AuthUser | null>(null);
  const isGuest = ref<boolean>(false);

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');

  function persistToken(t: string): void {
    token.value = t;
    localStorage.setItem(TOKEN_KEY, t);
  }

  function clearSession(): void {
    token.value = null;
    user.value = null;
    isGuest.value = false;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  }

  async function login(username: string, password: string): Promise<void> {
    const res = await authService.login({ username, password });
    persistToken(res.token);
    user.value = res.user;
    isGuest.value = false;
  }

  async function register(username: string, email: string, password: string): Promise<void> {
    const res = await authService.register({ username, email, password });
    persistToken(res.token);
    user.value = res.user;
    isGuest.value = false;
  }

  async function loginAsGuest(): Promise<void> {
    const res = await authService.guest();
    persistToken(res.token);
    user.value = null;
    isGuest.value = true;
  }

  function logout(): void {
    clearSession();
  }

  return {
    token,
    user,
    isGuest,
    isLoggedIn,
    isAdmin,
    login,
    register,
    loginAsGuest,
    logout,
  };
});
