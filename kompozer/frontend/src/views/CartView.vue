<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useCart } from '@/composables/useCart';
import type { CartItem } from '@/types/cart';

const { cart, loading, checkoutLoading, clearLoading, error, load, setQuantity, clearCart, checkout } = useCart();

onMounted(() => {
  void load();
});

const items = computed(() => cart.value?.items ?? []);
const total = computed(() => cart.value?.total ?? 0);

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

function increment(item: CartItem): void {
  void setQuantity(item, item.quantity + 1);
}

function decrement(item: CartItem): void {
  void setQuantity(item, item.quantity - 1);
}
</script>

<template>
  <div class="view-container">
    <header class="cart-header">
      <div>
        <h1>Carrello</h1>
        <p class="subtitle">Rivedi gli articoli prima del checkout</p>
      </div>
      <button class="btn btn--light" :disabled="loading" @click="load">Aggiorna</button>
    </header>

    <p v-if="error" class="error" role="alert" aria-live="assertive">{{ error }}</p>
    <p v-if="loading" class="placeholder">Caricamento carrello...</p>
    <div v-else-if="items.length === 0" class="empty-state">
      <p class="placeholder">Il tuo carrello è vuoto.</p>
      <p class="empty-hint">
        Se un componente è diventato non disponibile il carrello viene svuotato automaticamente.
        Puoi <RouterLink :to="{ name: 'configurations' }" class="empty-link">riordinare una configurazione finalizzata</RouterLink>
        o <RouterLink :to="{ name: 'cad' }" class="empty-link">crearne una nuova nel configuratore</RouterLink>.
      </p>
    </div>

    <div v-else class="layout">
      <section class="items">
        <article v-for="item in items" :key="item.sku" class="item-row">
          <div class="item-main">
            <h2 class="item-name">{{ item.name }}</h2>
            <p class="item-sku">SKU: {{ item.sku }}</p>
            <p class="item-price">{{ formatCurrency(item.unitPrice) }} cad.</p>
          </div>

          <div class="qty-controls">
            <button class="qty-btn" :aria-label="`Riduci quantita ${item.name}`" @click="decrement(item)">-</button>
            <span class="qty-value">{{ item.quantity }}</span>
            <button class="qty-btn" :aria-label="`Aumenta quantita ${item.name}`" @click="increment(item)">+</button>
          </div>

          <div class="line-total">
            {{ formatCurrency(item.lineTotal) }}
          </div>
        </article>
      </section>

      <aside class="summary">
        <h2>Riepilogo</h2>
        <div class="summary-row">
          <span>Totale</span>
          <strong>{{ formatCurrency(total) }}</strong>
        </div>
        <button class="btn btn--danger summary-btn-secondary" :disabled="clearLoading" @click="clearCart">
          {{ clearLoading ? 'Svuotamento in corso...' : 'Svuota carrello' }}
        </button>
        <button class="btn btn--primary summary-btn" :disabled="checkoutLoading || clearLoading" @click="checkout">
          {{ checkoutLoading ? 'Checkout in corso...' : 'Procedi al checkout' }}
        </button>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.subtitle {
  color: var(--color-text-muted);
  margin-top: var(--space-1);
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

.empty-state {
  margin-top: var(--space-4);
}

.empty-hint {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.empty-link {
  color: var(--color-accent);
  text-decoration: underline;
}

.layout {
  margin-top: var(--space-6);
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-6);
}

.items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.item-row {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--space-4);
  align-items: center;
}

.item-name { font-size: var(--font-size-base); }
.item-sku, .item-price { color: var(--color-text-secondary); font-size: var(--font-size-sm); }

.qty-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-raised);
}

.qty-value {
  min-width: 24px;
  text-align: center;
}

.line-total {
  font-weight: var(--font-weight-semibold);
}

.summary {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  height: fit-content;
}

.summary-row {
  margin-top: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-btn {
  margin-top: var(--space-3);
  width: 100%;
}

.summary-btn-secondary {
  margin-top: var(--space-6);
  width: 100%;
}

.btn {
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
}

.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn--primary {
  background: var(--color-accent);
  color: #fff;
}

.btn--danger {
  background: var(--color-error-subtle);
  color: var(--color-error);
  border: 1px solid #f0cccc;
}

.btn--light {
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .item-row {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
}

@media (max-width: 700px) {
  .view-container {
    padding: var(--space-6) var(--space-4);
  }

  .cart-header {
    flex-direction: column;
  }
}
</style>
