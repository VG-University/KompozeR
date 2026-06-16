import { ref } from 'vue';
import { catalogService } from '@/services/catalogService';
import { cartService } from '@/services/cartService';
import { useNotificationStore } from '@/store/notificationStore';
import type { CatalogItem } from '@/types/catalog';
import { ApiError } from '@/types/api';

export function useCatalog() {
  const items = ref<CatalogItem[]>([]);
  const loading = ref(false);
  const error = ref('');

  const search = ref('');
  const category = ref('');
  const availableOnly = ref(false);

  const notifications = useNotificationStore();

  async function load(): Promise<void> {
    loading.value = true;
    error.value = '';
    try {
      const response = await catalogService.list({
        search: search.value || undefined,
        category: category.value || undefined,
        available: availableOnly.value ? true : undefined,
        limit: 50,
        page: 1,
      });
      items.value = response.items;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Errore caricamento catalogo';
    } finally {
      loading.value = false;
    }
  }

  async function addToCart(item: CatalogItem): Promise<void> {
    try {
      await cartService.addItem(item.sku, {
        name: item.name,
        unitPrice: item.price,
        quantity: 1,
      });
      notifications.addToast('success', `Aggiunto al carrello: ${item.name}`);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Errore aggiunta al carrello';
      notifications.addToast('error', msg);
    }
  }

  return {
    items,
    loading,
    error,
    search,
    category,
    availableOnly,
    load,
    addToCart,
  };
}
