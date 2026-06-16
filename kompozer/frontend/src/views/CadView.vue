<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { Category, ConfigurationStatus } from '@/types/cad';
import { useCad } from '@/composables/useCad';

const {
  items,
  selected,
  loading,
  detailLoading,
  createLoading,
  finalizeLoading,
  categoryLoading,
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
  finalizeSelected,
  setStatusFilter,
  nextPage,
  prevPage,
} = useCad();

const statuses: Array<ConfigurationStatus> = [
  'DRAFT',
  'ENVIRONMENT_DEFINED',
  'CATEGORY_SELECTED',
  'COLUMNS_DEFINED',
  'DESIGN_IN_PROGRESS',
  'READY_FOR_FINALIZE',
  'FINALIZED',
];

const categories: Array<Category> = ['TONDO', 'QUADRO', 'KUBE'];
const route = useRoute();

onMounted(() => {
  void (async () => {
    await loadList();
    const configurationId = route.query['configurationId'];
    if (typeof configurationId === 'string' && configurationId.length > 0) {
      await loadDetail(configurationId);
    }
  })();
});

const canFinalize = computed(() => {
  if (!selected.value) {
    return false;
  }
  return selected.value.status === 'READY_FOR_FINALIZE';
});

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}
</script>

<template>
  <div class="view-container">
    <header class="header">
      <div>
        <h1>Configuratore CAD</h1>
        <p class="subtitle">Gestisci configurazioni, categoria e finalizzazione</p>
      </div>
      <button class="btn btn--light" :disabled="loading" @click="loadList">Aggiorna</button>
    </header>

    <section class="toolbar">
      <label class="field">
        <span class="field__label">Stato</span>
        <select
          class="field__input"
          :value="statusFilter"
          @change="setStatusFilter(($event.target as HTMLSelectElement).value as ConfigurationStatus | '')"
        >
          <option value="">Tutti</option>
          <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
        </select>
      </label>
      <span class="meta">{{ total }} configurazioni</span>
    </section>

    <section class="create-card">
      <h2>Nuova configurazione</h2>
      <div class="create-grid">
        <label class="field">
          <span class="field__label">Nome</span>
          <input v-model="createName" class="field__input" type="text" placeholder="Es. Libreria soggiorno" />
        </label>
        <label class="field">
          <span class="field__label">Categoria iniziale</span>
          <select v-model="createCategory" class="field__input">
            <option value="">Nessuna</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </label>
        <button class="btn btn--primary" :disabled="createLoading" @click="createConfiguration">
          {{ createLoading ? 'Creazione...' : 'Crea configurazione' }}
        </button>
      </div>
    </section>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="layout">
      <section class="list-panel">
        <h2>Le tue configurazioni</h2>
        <p v-if="loading" class="placeholder">Caricamento elenco...</p>
        <p v-else-if="items.length === 0" class="placeholder">Nessuna configurazione trovata.</p>

        <div v-else class="list">
          <button
            v-for="item in items"
            :key="item.id"
            class="list-item"
            :class="{ 'list-item--active': selected?.id === item.id }"
            @click="loadDetail(item.id)"
          >
            <div class="list-item__top">
              <strong>{{ item.name }}</strong>
              <span class="status">{{ item.status }}</span>
            </div>
            <div class="list-item__meta">
              <span>{{ item.category || 'Senza categoria' }}</span>
              <span>v{{ item.version }}</span>
            </div>
          </button>
        </div>

        <footer class="pagination" v-if="totalPages > 1">
          <button class="btn btn--light" :disabled="!canPrev || loading" @click="prevPage">Precedente</button>
          <span>Pagina {{ page }} di {{ totalPages }}</span>
          <button class="btn btn--light" :disabled="!canNext || loading" @click="nextPage">Successiva</button>
        </footer>
      </section>

      <aside class="detail-panel">
        <h2>Dettaglio</h2>
        <p v-if="detailLoading" class="placeholder">Caricamento dettaglio...</p>
        <p v-else-if="!selected" class="placeholder">Seleziona una configurazione dalla lista.</p>

        <template v-else>
          <div class="detail-grid">
            <div><span class="muted">ID</span><strong>{{ selected.id }}</strong></div>
            <div><span class="muted">Stato</span><strong>{{ selected.status }}</strong></div>
            <div><span class="muted">Creata</span><strong>{{ formatDate(selected.createdAt) }}</strong></div>
            <div><span class="muted">Aggiornata</span><strong>{{ formatDate(selected.updatedAt) }}</strong></div>
          </div>

          <label class="field detail-action">
            <span class="field__label">Categoria</span>
            <select
              class="field__input"
              :value="selected.category || ''"
              :disabled="categoryLoading"
              @change="updateCategory(($event.target as HTMLSelectElement).value as Category)"
            >
              <option disabled value="">Seleziona categoria</option>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
          </label>

          <div class="detail-action">
            <button class="btn btn--primary" :disabled="!canFinalize || finalizeLoading" @click="finalizeSelected">
              {{ finalizeLoading ? 'Finalizzazione...' : 'Finalizza e invia al carrello' }}
            </button>
            <p class="hint" v-if="!canFinalize">
              Per finalizzare, lo stato deve essere READY_FOR_FINALIZE.
            </p>
          </div>
        </template>
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

.toolbar {
  margin-top: var(--space-5);
  display: flex;
  justify-content: space-between;
  align-items: end;
}

.create-card {
  margin-top: var(--space-5);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.create-grid {
  margin-top: var(--space-3);
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: var(--space-3);
  align-items: end;
}

.field { display: flex; flex-direction: column; gap: var(--space-1); }
.field__label { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.field__input {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
}

.meta { color: var(--color-text-muted); font-size: var(--font-size-sm); }

.error {
  margin-top: var(--space-4);
  color: var(--color-error);
  background: var(--color-error-subtle);
  border: 1px solid #f0cccc;
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.layout {
  margin-top: var(--space-5);
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: var(--space-5);
}

.list-panel,
.detail-panel {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.list {
  margin-top: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.list-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  padding: var(--space-3);
  text-align: left;
  cursor: pointer;
}

.list-item--active {
  border-color: var(--color-accent);
  box-shadow: inset 0 0 0 1px var(--color-accent);
}

.list-item__top,
.list-item__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-item__meta {
  margin-top: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.status {
  font-size: var(--font-size-xs);
  color: var(--color-accent);
}

.pagination {
  margin-top: var(--space-4);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-3);
}

.detail-grid {
  margin-top: var(--space-3);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.detail-grid > div {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.muted {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.detail-action {
  margin-top: var(--space-4);
}

.hint {
  margin-top: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.placeholder {
  margin-top: var(--space-3);
  color: var(--color-text-muted);
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

.btn--light {
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

@media (max-width: 1000px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .create-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
