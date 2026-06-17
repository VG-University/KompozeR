import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthUser } from '@/types/auth';
import { authService } from '@/services/authService';

const TOKEN_KEY = 'kompozer_token';
const USER_KEY = 'kompozer_user';
const GUEST_KEY = 'kompozer_guest';

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const user = ref<AuthUser | null>(readStoredUser());
  const isGuest = ref<boolean>(localStorage.getItem(GUEST_KEY) === 'true');

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isBaseUser = computed(() => isLoggedIn.value && !isGuest.value && !isAdmin.value);
  const homeRouteName = computed(() => (isAdmin.value ? 'catalog' : 'cad'));

  function persistToken(t: string): void {
    token.value = t;
    localStorage.setItem(TOKEN_KEY, t);
  }

  function persistUser(nextUser: AuthUser | null): void {
    user.value = nextUser;
    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      return;
    }
    localStorage.removeItem(USER_KEY);
  }

  function persistGuest(nextValue: boolean): void {
    isGuest.value = nextValue;
    if (nextValue) {
      localStorage.setItem(GUEST_KEY, 'true');
      return;
    }
    localStorage.removeItem(GUEST_KEY);
  }

  function clearSession(): void {
    token.value = null;
    persistUser(null);
    persistGuest(false);
    localStorage.removeItem(TOKEN_KEY);
  }

  async function hydrateCurrentUser(): Promise<void> {
    if (!token.value || isGuest.value || user.value) {
      return;
    }

    try {
      const currentUser = await authService.me();
      persistUser(currentUser);
    } catch {
      clearSession();
    }
  }

  async function login(username: string, password: string): Promise<void> {
    const res = await authService.login({ username, password });
    persistToken(res.token);
    persistUser(res.user);
    persistGuest(false);
  }

  async function register(username: string, email: string, password: string): Promise<void> {
    const res = await authService.register({ username, email, password });
    persistToken(res.token);
    persistUser(res.user);
    persistGuest(false);
  }

  async function loginAsGuest(): Promise<void> {
    const res = await authService.guest();
    persistToken(res.token);
    persistUser(null);
    persistGuest(true);
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
    isBaseUser,
    homeRouteName,
    hydrateCurrentUser,
    login,
    register,
    loginAsGuest,
    logout,
  };
});
