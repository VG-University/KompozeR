import { computed, ref } from 'vue';
import { cadService, type ConfigurationStatus as ServiceConfigurationStatus } from '@/services/cadService';
import { useNotificationStore } from '@/store/notificationStore';
import type { Category, ColumnDesign, ColumnPlan, ConfigurationDto, Environment } from '@/types/cad';
import { ApiError } from '@/types/api';

export function useCad() {
  const notifications = useNotificationStore();

  const items = ref<ConfigurationDto[]>([]);
  const selected = ref<ConfigurationDto | null>(null);

  const loading = ref(false);
  const detailLoading = ref(false);
  const createLoading = ref(false);
  const finalizeLoading = ref(false);
  const categoryLoading = ref(false);
  const environmentLoading = ref(false);
  const columnPlanLoading = ref(false);
  const designLoading = ref(false);

  const error = ref('');

  const page = ref(1);
  const limit = ref(20);
  const total = ref(0);
  const totalPages = ref(1);
  const statusFilter = ref<ServiceConfigurationStatus | ''>('');

  const createName = ref('Nuova configurazione');
  const createCategory = ref<Category | ''>('');

  const canPrev = computed(() => page.value > 1);
  const canNext = computed(() => page.value < totalPages.value);

  async function loadList(): Promise<void> {
    loading.value = true;
    error.value = '';
    try {
      const result = await cadService.list({
        status: statusFilter.value || undefined,
        page: page.value,
        limit: limit.value,
      });
      items.value = result.items;
      total.value = result.total;
      totalPages.value = result.totalPages;

      if (selected.value) {
        const current = result.items.find((c) => c.id === selected.value?.id);
        if (current) {
          selected.value = current;
        }
      }
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Errore caricamento configurazioni';
    } finally {
      loading.value = false;
    }
  }

  async function loadDetail(id: string): Promise<void> {
    detailLoading.value = true;
    try {
      selected.value = await cadService.get(id);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Errore caricamento dettaglio configurazione';
      notifications.addToast('error', msg);
    } finally {
      detailLoading.value = false;
    }
  }

  async function createConfiguration(): Promise<void> {
    createLoading.value = true;
    try {
      const created = await cadService.create({
        name: createName.value.trim() || undefined,
        category: createCategory.value || undefined,
      });
      notifications.addToast('success', `Configurazione creata: ${created.name}`);
      selected.value = created;
      await loadList();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Errore creazione configurazione';
      notifications.addToast('error', msg);
    } finally {
      createLoading.value = false;
    }
  }

  async function updateCategory(category: Category): Promise<void> {
    if (!selected.value) {
      return;
    }
    categoryLoading.value = true;
    try {
      selected.value = await cadService.setCategory(selected.value.id, category);
      notifications.addToast('success', 'Categoria aggiornata');
      await loadList();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Errore aggiornamento categoria';
      notifications.addToast('error', msg);
    } finally {
      categoryLoading.value = false;
    }
  }

  async function updateEnvironment(environment: Environment): Promise<void> {
    if (!selected.value) {
      return;
    }
    environmentLoading.value = true;
    try {
      selected.value = await cadService.setEnvironment(selected.value.id, environment);
      notifications.addToast('success', 'Ambiente aggiornato');
      await loadList();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Errore aggiornamento ambiente';
      notifications.addToast('error', msg);
    } finally {
      environmentLoading.value = false;
    }
  }

  async function updateColumnPlan(columnPlan: ColumnPlan): Promise<void> {
    if (!selected.value) {
      return;
    }
    columnPlanLoading.value = true;
    try {
      selected.value = await cadService.setColumnPlan(selected.value.id, columnPlan);
      notifications.addToast('success', 'Piano colonne aggiornato');
      await loadList();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Errore aggiornamento piano colonne';
      notifications.addToast('error', msg);
    } finally {
      columnPlanLoading.value = false;
    }
  }

  async function updateDesign(columnDesigns: ColumnDesign[]): Promise<void> {
    if (!selected.value) {
      return;
    }
    designLoading.value = true;
    try {
      selected.value = await cadService.updateDesign(selected.value.id, columnDesigns);
      notifications.addToast('success', 'Design colonne aggiornato');
      await loadList();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Errore aggiornamento design';
      notifications.addToast('error', msg);
    } finally {
      designLoading.value = false;
    }
  }

  async function finalizeSelected(): Promise<void> {
    if (!selected.value) {
      return;
    }
    finalizeLoading.value = true;
    try {
      selected.value = await cadService.finalize(selected.value.id);
      notifications.addToast('success', 'Configurazione finalizzata e inviata al carrello');
      await loadList();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Errore finalizzazione configurazione';
      notifications.addToast('error', msg);
    } finally {
      finalizeLoading.value = false;
    }
  }

  async function setStatusFilter(value: ServiceConfigurationStatus | ''): Promise<void> {
    statusFilter.value = value;
    page.value = 1;
    await loadList();
  }

  async function nextPage(): Promise<void> {
    if (!canNext.value) {
      return;
    }
    page.value += 1;
    await loadList();
  }

  async function prevPage(): Promise<void> {
    if (!canPrev.value) {
      return;
    }
    page.value -= 1;
    await loadList();
  }

  return {
    items,
    selected,
    loading,
    detailLoading,
    createLoading,
    finalizeLoading,
    categoryLoading,
    environmentLoading,
    columnPlanLoading,
    designLoading,
    error,
    page,
    total,
    totalPages,
    statusFilter,
    createName,
    createCategory,
    canPrev,
    canNext,
    loadList,
    loadDetail,
    createConfiguration,
    updateCategory,
    updateEnvironment,
    updateColumnPlan,
    updateDesign,
    finalizeSelected,
    setStatusFilter,
    nextPage,
    prevPage,
  };
}
