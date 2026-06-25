/** Central cart store for item collection, totals, and cart synchronization. */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { cartService } from '@/services/cartService';
import type { Cart } from '@/types/cart';

/** Sums item quantities across all cart entries. */
function countItems(cart: Cart | null): number {
  if (!cart) {
    return 0;
  }
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export const useCartStore = defineStore('cart', () => {
  const itemCount = ref(0);

  const hasItems = computed(() => itemCount.value > 0);

  /** Updates the item count from a fresh cart payload. */
  function setFromCart(cart: Cart | null): void {
    itemCount.value = countItems(cart);
  }

  /** Resets the item count to zero, e.g. after checkout or clear. */
  function clearCount(): void {
    itemCount.value = 0;
  }

  /** Polls the cart API and updates the badge count, silently ignoring transient errors. */
  async function refreshItemCount(): Promise<void> {
    try {
      const cart = await cartService.get();
      setFromCart(cart);
    } catch {
      // Ignore transient errors for header badge.
    }
  }

  return {
    itemCount,
    hasItems,
    setFromCart,
    clearCount,
    refreshItemCount,
  };
});
