import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { cartService } from '@/services/cartService';
import type { Cart } from '@/types/cart';

function countItems(cart: Cart | null): number {
  if (!cart) {
    return 0;
  }
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export const useCartStore = defineStore('cart', () => {
  const itemCount = ref(0);

  const hasItems = computed(() => itemCount.value > 0);

  function setFromCart(cart: Cart | null): void {
    itemCount.value = countItems(cart);
  }

  function clearCount(): void {
    itemCount.value = 0;
  }

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
