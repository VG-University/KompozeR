import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store/authStore';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'auth',
    component: () => import('@/views/AuthView.vue'),
    meta: { public: true },
  },
  {
    path: '/catalog',
    name: 'catalog',
    component: () => import('@/views/CatalogView.vue'),
    meta: { requiresToken: true },
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/CartView.vue'),
    meta: { requiresToken: true },
  },
  {
    path: '/cad',
    name: 'cad',
    component: () => import('@/views/CadView.vue'),
    meta: { requiresToken: true },
  },
  {
    path: '/configurations',
    name: 'configurations',
    component: () => import('@/views/ConfigurationsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/views/NotificationsView.vue'),
    meta: { requiresToken: true },
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/views/admin/AdminOrdersView.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/reports',
    name: 'admin-reports',
    component: () => import('@/views/admin/AdminReportsView.vue'),
    meta: { requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'auth' };
  }

  if (to.meta.requiresAuth && (!auth.isLoggedIn || auth.isGuest)) {
    return { name: 'auth' };
  }

  if (to.meta.requiresToken && !auth.isLoggedIn) {
    return { name: 'auth' };
  }

  if (to.meta.public && auth.isLoggedIn) {
    return { name: 'catalog' };
  }
});

export default router;
