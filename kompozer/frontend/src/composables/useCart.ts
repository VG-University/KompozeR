import { ref } from 'vue';
import { cartService } from '@/services/cartService';
import { useNotificationStore } from '@/store/notificationStore';
import type { Cart, CartItem } from '@/types/cart';
import { ApiError } from '@/types/api';

export function useCart() {
  const cart = ref<Cart | null>(null);
  const loading = ref(false);
  const checkoutLoading = ref(false);
  const clearLoading = ref(false);
  const error = ref('');

  const notifications = useNotificationStore();

  async function load(): Promise<void> {
    loading.value = true;
    error.value = '';
    try {
      cart.value = await cartService.get();
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Errore caricamento carrello';
    } finally {
      loading.value = false;
    }
  }

  async function setQuantity(item: CartItem, quantity: number): Promise<void> {
    const safeQuantity = Math.max(0, quantity);
    try {
      if (safeQuantity === 0) {
        cart.value = await cartService.removeItem(item.sku);
      } else {
        cart.value = await cartService.addItem(item.sku, {
          name: item.name,
          unitPrice: item.unitPrice,
          quantity: safeQuantity,
        });
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Errore aggiornamento quantità';
      notifications.addToast('error', msg);
    }
  }

  async function checkout(): Promise<void> {
    checkoutLoading.value = true;
    try {
      const result = await cartService.checkout();
      notifications.addToast('success', `Ordine ${result.orderId} creato con successo`);
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Errore durante checkout';
      notifications.addToast('error', msg);
    } finally {
      checkoutLoading.value = false;
    }
  }

  async function clearCart(): Promise<void> {
    clearLoading.value = true;
    try {
      await cartService.clear();
      notifications.addToast('success', 'Carrello svuotato');
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Errore durante svuotamento carrello';
      notifications.addToast('error', msg);
    } finally {
      clearLoading.value = false;
    }
  }

  return {
    cart,
    loading,
    checkoutLoading,
    clearLoading,
    error,
    load,
    setQuantity,
    clearCart,
    checkout,
  };
}
