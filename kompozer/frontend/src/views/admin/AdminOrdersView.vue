<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { orderService } from '@/services/orderService';
import { useNotificationStore } from '@/store/notificationStore';
import type { Order, OrderStatus } from '@/types/order';
import { ApiError } from '@/types/api';

const notifications = useNotificationStore();

const items = ref<Order[]>([]);
const loading = ref(false);
const error = ref('');
const updatingOrderId = ref('');
const statusFilter = ref<OrderStatus | ''>('');

const filteredItems = computed(() => {
  if (!statusFilter.value) {
    return items.value;
  }
  return items.value.filter((order) => order.status === statusFilter.value);
});

const submittedCount = computed(() => items.value.filter((order) => order.status === 'SUBMITTED').length);
const doneCount = computed(() => items.value.filter((order) => order.status === 'DONE').length);
const cancelledCount = computed(() => items.value.filter((order) => order.status === 'CANCELLED').length);

onMounted(() => {
  void load();
});

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

function formatDate(iso?: string): string {
  if (!iso) {
    return '-';
  }
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await orderService.list({ page: 1, limit: 100 });
    items.value = result.items;
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Errore caricamento ordini';
  } finally {
    loading.value = false;
  }
}

async function markDone(order: Order): Promise<void> {
  updatingOrderId.value = order.id;
  try {
    const updated = await orderService.markDone(order.id);
    items.value = items.value.map((current) => (current.id === updated.id ? updated : current));
    notifications.addToast('success', `Ordine ${order.id} marcato come DONE`);
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : 'Errore aggiornamento stato ordine';
    notifications.addToast('error', msg);
  } finally {
    updatingOrderId.value = '';
  }
}
</script>

<template>
  <div class="view-container">
    <header class="header">
      <div>
        <h1>Gestione ordini</h1>
        <p class="subtitle">Controlla gli ordini e avanzali allo stato DONE</p>
      </div>
      <button class="btn btn--light" :disabled="loading" @click="load">Aggiorna</button>
    </header>

    <section class="metrics">
      <article class="metric-card">
        <span class="metric-label">Totali</span>
        <strong class="metric-value">{{ items.length }}</strong>
      </article>
      <article class="metric-card">
        <span class="metric-label">SUBMITTED</span>
        <strong class="metric-value">{{ submittedCount }}</strong>
      </article>
      <article class="metric-card">
        <span class="metric-label">DONE</span>
        <strong class="metric-value">{{ doneCount }}</strong>
      </article>
      <article class="metric-card">
        <span class="metric-label">CANCELLED</span>
        <strong class="metric-value">{{ cancelledCount }}</strong>
      </article>
    </section>

    <section class="toolbar">
      <label class="field">
        <span class="field__label">Filtra stato</span>
        <select v-model="statusFilter" class="field__input">
          <option value="">Tutti</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="DONE">DONE</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </label>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="placeholder">Caricamento ordini...</p>
    <p v-else-if="filteredItems.length === 0" class="placeholder">Nessun ordine per il filtro selezionato.</p>

    <section v-else class="list">
      <article class="order" v-for="order in filteredItems" :key="order.id">
        <div class="order__top">
          <div>
            <h2>{{ order.id }}</h2>
            <p class="meta">Utente: {{ order.userId }}</p>
          </div>
          <span :class="['status', order.status.toLowerCase()]">{{ order.status }}</span>
        </div>

        <div class="order__grid">
          <div>
            <span class="label">Totale</span>
            <strong>{{ formatCurrency(order.total) }}</strong>
          </div>
          <div>
            <span class="label">Articoli</span>
            <strong>{{ order.items.length }}</strong>
          </div>
          <div>
            <span class="label">Sottomesso</span>
            <strong>{{ formatDate(order.submittedAt) }}</strong>
          </div>
          <div>
            <span class="label">Completato</span>
            <strong>{{ formatDate(order.doneAt) }}</strong>
          </div>
        </div>

        <div class="order__items">
          <p class="items-title">Dettaglio articoli</p>
          <ul>
            <li v-for="item in order.items" :key="`${order.id}-${item.sku}`">
              {{ item.name }} ({{ item.sku }}) x{{ item.quantity }} · {{ formatCurrency(item.unitPrice) }}
            </li>
          </ul>
        </div>

        <div class="order__actions">
          <button
            class="btn btn--primary"
            :disabled="order.status !== 'SUBMITTED' || updatingOrderId === order.id"
            @click="markDone(order)"
          >
            {{ updatingOrderId === order.id ? 'Aggiornamento...' : 'Segna come DONE' }}
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.view-container {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.subtitle {
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.metrics {
  margin-top: var(--space-5);
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: var(--space-3);
}

.metric-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.metric-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.metric-value {
  font-size: var(--font-size-xl);
}

.toolbar {
  margin-top: var(--space-4);
}

.field {
  display: inline-flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field__label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.field__input {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  min-width: 220px;
}

.error {
  margin-top: var(--space-4);
  color: var(--color-error);
  background: var(--color-error-subtle);
  border: 1px solid #f0cccc;
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.placeholder {
  margin-top: var(--space-4);
  color: var(--color-text-muted);
}

.list {
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.order {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.order__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.meta {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-top: 2px;
}

.status {
  font-size: var(--font-size-xs);
  border-radius: var(--radius-full);
  padding: 2px 10px;
}

.status.submitted {
  background: var(--color-warning-subtle);
  color: var(--color-warning);
}

.status.done {
  background: var(--color-success-subtle);
  color: var(--color-success);
}

.status.cancelled {
  background: var(--color-error-subtle);
  color: var(--color-error);
}

.order__grid {
  margin-top: var(--space-3);
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: var(--space-3);
}

.label {
  display: block;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin-bottom: 2px;
}

.order__items {
  margin-top: var(--space-3);
}

.items-title {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-1);
}

.order__items ul {
  margin: 0;
  padding-left: 18px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.order__actions {
  margin-top: var(--space-4);
}

.btn {
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--color-admin-accent);
  color: #fff;
}

.btn--light {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

@media (max-width: 1000px) {
  .metrics {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }

  .order__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .order__grid {
    grid-template-columns: 1fr;
  }
}
</style>
