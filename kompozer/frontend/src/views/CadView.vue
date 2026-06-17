<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type {
  Category,
  ColumnPlan,
  ConfigurationStatus,
  Environment,
  NextOption,
} from '@/types/cad';
import { useCad } from '@/composables/useCad';
import { catalogService } from '@/services/catalogService';
import type { CatalogItem } from '@/types/catalog';

const {
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
  nextOptionsLoading,
  error,
  page,
  total,
  totalPages,
  statusFilter,
  createName,
  nextOptionsByColumn,
  canPrev,
  canNext,
  loadList,
  loadDetail,
  createConfiguration,
  updateCategory,
  updateEnvironment,
  updateColumnPlan,
  fetchNextOptions,
  setNextOptions,
  addTopShelf,
  removeTopShelf,
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

const environmentDraft = ref<Environment>({
  maxWidthMm: 5000,
  maxHeightMm: 3000,
  minWidthMm: 600,
  minHeightMm: 220,
  unit: 'mm',
});

const columnCountDraft = ref(2);
const shelfWidthsDraft = ref<number[]>([800, 800]);
const shelfThicknessDraft = ref(20);
const selectedGapByColumn = ref<Record<number, number | null>>({});
const selectedTerminalByColumn = ref<Record<number, number | null>>({});
const categoryCatalogItems = ref<CatalogItem[]>([]);
const catalogLoading = ref(false);

const showBomMobile = ref(false);
const showResetConfirm = ref(false);
const showResetFinalConfirm = ref(false);
const pendingCategory = ref<Category | null>(null);
const pendingEnvironment = ref<Environment | null>(null);

onMounted(() => {
  void (async () => {
    await loadList();
    const configurationId = route.query['configurationId'];
    if (typeof configurationId === 'string' && configurationId.length > 0) {
      await loadDetail(configurationId);
    }
  })();
});

watch(selected, (value) => {
  if (!value) {
    return;
  }

  if (value.environment) {
    environmentDraft.value = { ...value.environment };
  }

  if (value.columnPlan) {
    columnCountDraft.value = value.columnPlan.columnCount;
    shelfWidthsDraft.value = value.columnPlan.columns
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((column) => column.shelfWidthMm);
  }
}, { immediate: true });

watch(
  () => selected.value?.category,
  (category) => {
    void loadCatalogForCategory(category ?? null);
  },
  { immediate: true },
);

const currentStepIndex = computed(() => {
  if (!selected.value) return 0;
  switch (selected.value.status) {
    case 'DRAFT':
      return 0;
    case 'ENVIRONMENT_DEFINED':
      return 1;
    case 'CATEGORY_SELECTED':
      return 2;
    case 'COLUMNS_DEFINED':
      return 3;
    case 'DESIGN_IN_PROGRESS':
      return 3;
    case 'READY_FOR_FINALIZE':
      return 4;
    case 'FINALIZED':
      return 5;
    default:
      return 0;
  }
});

const selectedCategoryDraft = computed(() => selected.value?.category || '');

const canFinalize = computed(() => selected.value?.status === 'READY_FOR_FINALIZE');
const canEditEnvironment = computed(() => selected.value && selected.value.status !== 'FINALIZED');
const canEditCategory = computed(() => selected.value && selected.value.status !== 'FINALIZED');
const canEditColumns = computed(() => {
  if (!selected.value) return false;
  return (
    selected.value.status === 'CATEGORY_SELECTED' ||
    selected.value.status === 'COLUMNS_DEFINED' ||
    selected.value.status === 'DESIGN_IN_PROGRESS' ||
    selected.value.status === 'READY_FOR_FINALIZE'
  );
});
const canEditDesign = computed(() => {
  if (!selected.value) return false;
  return (
    selected.value.status === 'COLUMNS_DEFINED' ||
    selected.value.status === 'DESIGN_IN_PROGRESS' ||
    selected.value.status === 'READY_FOR_FINALIZE'
  );
});

const totalPrice = computed(() => {
  const bom = selected.value?.bom ?? [];
  return bom.reduce((sum, item) => {
    const unit = item.unitPrice ?? (item.unitPriceCents ? item.unitPriceCents / 100 : 0);
    return sum + unit * item.quantity;
  }, 0);
});

const orderedColumns = computed(() => {
  const plan = selected.value?.columnPlan;
  if (!plan) {
    return shelfWidthsDraft.value.map((width, index) => ({ index, shelfWidthMm: width }));
  }
  return plan.columns.slice().sort((a, b) => a.index - b.index);
});

const availableShelfWidths = computed(() =>
  uniqueSortedNumeric(
    categoryCatalogItems.value
      .filter((item) => normalizedType(item) === 'RIPIANO')
      .map((item) => Number(item.dimensions?.widthMm))
      .filter((value) => Number.isFinite(value) && value > 0),
  ),
);

const availableFootHeights = computed(() =>
  uniqueSortedNumeric(
    categoryCatalogItems.value
      .filter((item) => normalizedType(item) === 'PIEDINO')
      .map((item) => Number(item.dimensions?.heightMm))
      .filter((value) => Number.isFinite(value) && value > 0),
  ),
);

const availableMountHeights = computed(() =>
  uniqueSortedNumeric(
    categoryCatalogItems.value
      .filter((item) => normalizedType(item) === 'MONTANTE')
      .map((item) => Number(item.dimensions?.heightMm))
      .filter((value) => Number.isFinite(value) && value > 0),
  ),
);

const availableTerminalHeights = computed(() =>
  uniqueSortedNumeric(
    categoryCatalogItems.value
      .filter((item) => normalizedType(item) === 'TERMINALE')
      .map((item) => Number(item.dimensions?.heightMm))
      .filter((value) => Number.isFinite(value) && value > 0),
  ),
);

watch(columnCountDraft, (count) => {
  const safeCount = Math.max(1, Math.min(8, count));
  if (safeCount !== count) {
    columnCountDraft.value = safeCount;
    return;
  }

  shelfWidthsDraft.value = Array.from(
    { length: safeCount },
    (_, index) => shelfWidthsDraft.value[index] ?? availableShelfWidths.value[0] ?? 800,
  );
});

watch(() => availableShelfWidths.value, (widths) => {
  if (widths.length === 0) {
    return;
  }

  shelfWidthsDraft.value = shelfWidthsDraft.value.map((width) =>
    widths.includes(width) ? width : widths[0],
  );
});

const designByColumn = computed(() => {
  const map = new Map<number, { levelsMm: number[]; shelfThicknessMm: number }>();
  for (const design of selected.value?.columnDesigns ?? []) {
    map.set(design.columnIndex, {
      levelsMm: [...design.levelsMm].sort((a, b) => a - b),
      shelfThicknessMm: design.shelfThicknessMm,
    });
  }
  return map;
});

const gridMaxHeight = computed(() => Math.max(environmentDraft.value.maxHeightMm || 1, 1));

const canvasColumns = computed(() => {
  return orderedColumns.value.map((column) => {
    const design = designByColumn.value.get(column.index);
    const levels = design?.levelsMm ?? [];
    return {
      ...column,
      levels,
      levelPercents: levels.map((level) => Math.min(95, Math.max(2, Math.round((level / gridMaxHeight.value) * 100)))),
    };
  });
});

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value);
}

function syncDraftLengths(nextCount: number): void {
  const safeCount = Math.max(1, Math.min(8, nextCount));
  columnCountDraft.value = safeCount;
}

function normalizedType(item: CatalogItem): string {
  return String(item.Type ?? '').trim().toUpperCase();
}

function uniqueSortedNumeric(values: number[]): number[] {
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

async function loadCatalogForCategory(category: Category | null): Promise<void> {
  if (!category) {
    categoryCatalogItems.value = [];
    return;
  }

  catalogLoading.value = true;
  try {
    const allItems: CatalogItem[] = [];
    let currentPage = 1;
    let totalPagesCount = 1;

    do {
      const response = await catalogService.list({
        category,
        available: true,
        page: currentPage,
        limit: 200,
      });
      allItems.push(...response.items);
      totalPagesCount = response.totalPages;
      currentPage += 1;
    } while (currentPage <= totalPagesCount);

    categoryCatalogItems.value = allItems;
  } catch {
    categoryCatalogItems.value = [];
  } finally {
    catalogLoading.value = false;
  }
}

async function saveEnvironment(): Promise<void> {
  if (!selected.value) return;

  if (selected.value.status === 'FINALIZED') {
    return;
  }

  const requiresReset = ['COLUMNS_DEFINED', 'DESIGN_IN_PROGRESS', 'READY_FOR_FINALIZE'].includes(selected.value.status);
  if (requiresReset) {
    pendingEnvironment.value = { ...environmentDraft.value };
    showResetConfirm.value = true;
    return;
  }

  await updateEnvironment(environmentDraft.value);
}

async function saveCategory(value: string): Promise<void> {
  if (!selected.value || !value) {
    return;
  }

  const nextCategory = value as Category;
  if (nextCategory === selected.value.category) {
    return;
  }

  if (selected.value.status === 'FINALIZED') {
    return;
  }

  const requiresReset = ['COLUMNS_DEFINED', 'DESIGN_IN_PROGRESS', 'READY_FOR_FINALIZE'].includes(selected.value.status);
  if (requiresReset) {
    pendingCategory.value = nextCategory;
    showResetConfirm.value = true;
    return;
  }

  await updateCategory(nextCategory);
}

async function confirmResetStepOne(): Promise<void> {
  showResetConfirm.value = false;
  showResetFinalConfirm.value = true;
}

async function confirmResetStepTwo(): Promise<void> {
  showResetFinalConfirm.value = false;

  if (pendingEnvironment.value) {
    await updateEnvironment(pendingEnvironment.value);
    pendingEnvironment.value = null;
  }

  if (pendingCategory.value) {
    await updateCategory(pendingCategory.value);
    pendingCategory.value = null;
  }
}

function cancelReset(): void {
  showResetConfirm.value = false;
  showResetFinalConfirm.value = false;
  pendingCategory.value = null;
  pendingEnvironment.value = null;

  if (selected.value?.environment) {
    environmentDraft.value = { ...selected.value.environment };
  }
}

async function saveColumnPlan(): Promise<void> {
  const columnPlan: ColumnPlan = {
    columnCount: columnCountDraft.value,
    columns: shelfWidthsDraft.value.map((shelfWidthMm, index) => ({ index, shelfWidthMm })),
  };
  await updateColumnPlan(columnPlan);
}

function getOptions(columnIndex: number): NextOption[] {
  return nextOptionsByColumn.value[columnIndex] ?? [];
}

function fallbackOptions(columnIndex: number): NextOption[] {
  const levels = designByColumn.value.get(columnIndex)?.levelsMm ?? [];
  const sourceHeights = levels.length === 0 ? availableFootHeights.value : availableMountHeights.value;
  return sourceHeights.map((heightMm) => ({
    heightMm,
    allowed: true,
  }));
}

async function openNextOptions(columnIndex: number): Promise<void> {
  const fetchedOptions = await fetchNextOptions(columnIndex);
  const options = (fetchedOptions.length > 0 ? fetchedOptions : fallbackOptions(columnIndex)).filter(
    (option) => option.allowed,
  );
  setNextOptions(columnIndex, options);
  selectedGapByColumn.value = {
    ...selectedGapByColumn.value,
    [columnIndex]: options[0]?.heightMm ?? null,
  };

  selectedTerminalByColumn.value = {
    ...selectedTerminalByColumn.value,
    [columnIndex]: selectedTerminalByColumn.value[columnIndex] ?? availableTerminalHeights.value[0] ?? null,
  };
}

async function addShelf(columnIndex: number): Promise<void> {
  const gap = selectedGapByColumn.value[columnIndex];
  if (!gap) {
    return;
  }
  await addTopShelf(columnIndex, gap, shelfThicknessDraft.value);
  await openNextOptions(columnIndex);
}

async function removeShelf(columnIndex: number): Promise<void> {
  await removeTopShelf(columnIndex, shelfThicknessDraft.value);
  await openNextOptions(columnIndex);
}

async function addTerminal(columnIndex: number): Promise<void> {
  const terminalHeight = selectedTerminalByColumn.value[columnIndex];
  if (!terminalHeight) {
    return;
  }

  await addTopShelf(columnIndex, terminalHeight, shelfThicknessDraft.value);
  await openNextOptions(columnIndex);
}

function stepDone(index: number): boolean {
  return currentStepIndex.value > index;
}

function stepActive(index: number): boolean {
  return currentStepIndex.value === index;
}
</script>

<template>
  <div class="cad-workspace">
    <header class="cad-header">
      <div>
        <h1>Configuratore CAD</h1>
        <p class="subtitle">Flusso guidato a step con vincoli backend</p>
      </div>
      <div class="header-actions">
        <button class="btn btn--light" :disabled="loading" @click="loadList">Aggiorna</button>
        <button class="btn btn--light bom-mobile-btn" @click="showBomMobile = true">Lista componenti</button>
      </div>
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
        <button class="btn btn--primary" :disabled="createLoading" @click="createConfiguration">
          {{ createLoading ? 'Creazione...' : 'Crea configurazione' }}
        </button>
      </div>
    </section>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="cad-layout">
      <aside class="left-panel">
        <h2>Configurazioni</h2>
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
      </aside>

      <main class="center-panel">
        <p v-if="detailLoading" class="placeholder">Caricamento dettaglio...</p>
        <p v-else-if="!selected" class="placeholder">Seleziona una configurazione per iniziare.</p>

        <template v-else>
          <section class="stepper">
            <article class="step" :class="{ 'step--done': stepDone(0), 'step--active': stepActive(0) }">
              <span class="step__index">1</span>
              <span class="step__label">Ambiente</span>
            </article>
            <article class="step" :class="{ 'step--done': stepDone(1), 'step--active': stepActive(1) }">
              <span class="step__index">2</span>
              <span class="step__label">Categoria</span>
            </article>
            <article class="step" :class="{ 'step--done': stepDone(2), 'step--active': stepActive(2) }">
              <span class="step__index">3</span>
              <span class="step__label">Colonne</span>
            </article>
            <article class="step" :class="{ 'step--done': stepDone(3), 'step--active': stepActive(3) }">
              <span class="step__index">4</span>
              <span class="step__label">Design</span>
            </article>
            <article class="step" :class="{ 'step--done': stepDone(4), 'step--active': stepActive(4) }">
              <span class="step__index">5</span>
              <span class="step__label">Finalizza</span>
            </article>
          </section>

          <section class="meta-row">
            <div><span class="muted">Configurazione</span><strong>{{ selected.name }}</strong></div>
            <div><span class="muted">Stato</span><strong>{{ selected.status }}</strong></div>
            <div><span class="muted">Ultimo update</span><strong>{{ formatDate(selected.updatedAt) }}</strong></div>
          </section>

          <section class="canvas-section">
            <header class="canvas-section__header">
              <h3>Griglia configuratore</h3>
              <span class="canvas-size">{{ environmentDraft.maxWidthMm }} x {{ environmentDraft.maxHeightMm }} mm</span>
            </header>

            <div class="canvas-grid" :style="{ '--cols': String(canvasColumns.length || 1) }">
              <article v-for="column in canvasColumns" :key="column.index" class="canvas-column">
                <div class="canvas-column__scale">Y</div>
                <div class="canvas-column__body">
                  <div
                    v-for="(level, idx) in column.levelPercents"
                    :key="`level-${column.index}-${idx}`"
                    class="level-line"
                    :style="{ bottom: `${level}%` }"
                  >
                    <span>{{ column.levels[idx] }}mm</span>
                  </div>
                </div>
                <div class="canvas-column__x">C{{ column.index + 1 }} · {{ column.shelfWidthMm }}mm</div>
              </article>
            </div>
          </section>

          <section class="controls-section">
            <article class="control-card">
              <h3>Step 1 - Ambiente</h3>
              <div class="two-cols">
                <label class="field">
                  <span class="field__label">Larghezza max (mm)</span>
                  <input v-model.number="environmentDraft.maxWidthMm" class="field__input" type="number" min="1" />
                </label>
                <label class="field">
                  <span class="field__label">Altezza max (mm)</span>
                  <input v-model.number="environmentDraft.maxHeightMm" class="field__input" type="number" min="1" />
                </label>
                <label class="field">
                  <span class="field__label">Larghezza min (mm)</span>
                  <input v-model.number="environmentDraft.minWidthMm" class="field__input" type="number" min="1" />
                </label>
                <label class="field">
                  <span class="field__label">Altezza min (mm)</span>
                  <input v-model.number="environmentDraft.minHeightMm" class="field__input" type="number" min="1" />
                </label>
              </div>
              <button class="btn btn--light" :disabled="!canEditEnvironment || environmentLoading" @click="saveEnvironment">
                {{ environmentLoading ? 'Salvataggio...' : 'Salva ambiente' }}
              </button>
            </article>

            <article class="control-card">
              <h3>Step 2 - Categoria</h3>
              <label class="field">
                <span class="field__label">Categoria</span>
                <select
                  class="field__input"
                  :value="selectedCategoryDraft"
                  :disabled="!canEditCategory || categoryLoading"
                  @change="saveCategory(($event.target as HTMLSelectElement).value)"
                >
                  <option disabled value="">Seleziona categoria</option>
                  <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                </select>
              </label>
            </article>

            <article class="control-card">
              <h3>Step 3 - Piano colonne</h3>
              <label class="field">
                <span class="field__label">Numero colonne (1-8)</span>
                <input
                  :value="columnCountDraft"
                  class="field__input"
                  type="number"
                  min="1"
                  max="8"
                  :disabled="!canEditColumns"
                  @change="syncDraftLengths(Number(($event.target as HTMLInputElement).value))"
                />
              </label>
              <p class="mini muted" v-if="catalogLoading">Caricamento larghezze da catalogo...</p>
              <p class="mini muted" v-else-if="availableShelfWidths.length === 0">
                Nessun RIPIANO disponibile per la categoria selezionata.
              </p>
              <div class="column-widths">
                <label v-for="(_, i) in columnCountDraft" :key="`col-width-${i}`" class="field">
                  <span class="field__label">Colonna {{ i + 1 }}</span>
                  <select
                    v-model.number="shelfWidthsDraft[i]"
                    class="field__input"
                    :disabled="!canEditColumns || availableShelfWidths.length === 0"
                  >
                    <option v-for="width in availableShelfWidths" :key="`width-${i}-${width}`" :value="width">
                      {{ width }} mm
                    </option>
                  </select>
                </label>
              </div>
              <button
                class="btn btn--light"
                :disabled="!canEditColumns || columnPlanLoading || availableShelfWidths.length === 0"
                @click="saveColumnPlan"
              >
                {{ columnPlanLoading ? 'Salvataggio...' : 'Salva piano colonne' }}
              </button>
            </article>

            <article class="control-card">
              <h3>Step 4 - Design ripiani (+ / -)</h3>
              <label class="field">
                <span class="field__label">Spessore ripiano (mm)</span>
                <input
                  v-model.number="shelfThicknessDraft"
                  class="field__input"
                  type="number"
                  min="1"
                  :disabled="!canEditDesign"
                />
              </label>

              <div class="design-columns">
                <article v-for="column in canvasColumns" :key="`design-col-${column.index}`" class="design-column">
                  <header>
                    <strong>Colonna {{ column.index + 1 }}</strong>
                    <span>{{ column.shelfWidthMm }}mm</span>
                  </header>

                  <p class="mini muted">Livelli correnti: {{ column.levels.join(', ') || 'nessuno' }}</p>
                  <p class="mini muted">
                    {{ column.levels.length === 0 ? 'Livello 0: opzioni PIEDINO' : 'Livelli successivi: opzioni MONTANTE' }}
                  </p>

                  <button
                    class="btn btn--light btn--small"
                    :disabled="!canEditDesign || nextOptionsLoading"
                    @click="openNextOptions(column.index)"
                  >
                    {{ nextOptionsLoading ? 'Carico...' : 'Mostra opzioni +' }}
                  </button>

                  <label class="field" v-if="getOptions(column.index).length > 0">
                    <span class="field__label">Gap da aggiungere</span>
                    <select
                      class="field__input"
                      :disabled="!canEditDesign || designLoading"
                      v-model.number="selectedGapByColumn[column.index]"
                    >
                      <option
                        v-for="option in getOptions(column.index)"
                        :key="`opt-${column.index}-${option.heightMm}`"
                        :value="option.allowed ? option.heightMm : null"
                        :disabled="!option.allowed"
                      >
                        {{ option.heightMm }}mm{{ option.allowed ? '' : ` - ${option.reason || 'non consentito'}` }}
                      </option>
                    </select>
                  </label>

                  <label class="field" v-if="availableTerminalHeights.length > 0 && column.levels.length > 0">
                    <span class="field__label">Terminale finale</span>
                    <select
                      class="field__input"
                      :disabled="!canEditDesign || designLoading"
                      v-model.number="selectedTerminalByColumn[column.index]"
                    >
                      <option
                        v-for="height in availableTerminalHeights"
                        :key="`terminal-${column.index}-${height}`"
                        :value="height"
                      >
                        {{ height }}mm
                      </option>
                    </select>
                  </label>

                  <div class="actions-row">
                    <button
                      class="btn btn--primary btn--small"
                      :disabled="!canEditDesign || designLoading || !selectedGapByColumn[column.index]"
                      @click="addShelf(column.index)"
                    >
                      + Ripiano
                    </button>
                    <button
                      class="btn btn--light btn--small"
                      :disabled="!canEditDesign || designLoading || column.levels.length === 0"
                      @click="removeShelf(column.index)"
                    >
                      - Ultimo
                    </button>
                    <button
                      class="btn btn--light btn--small"
                      v-if="availableTerminalHeights.length > 0 && column.levels.length > 0"
                      :disabled="!canEditDesign || designLoading || !selectedTerminalByColumn[column.index]"
                      @click="addTerminal(column.index)"
                    >
                      + Terminale
                    </button>
                  </div>
                </article>
              </div>
            </article>

            <article class="control-card finalize-card">
              <h3>Step 5 - Finalizzazione</h3>
              <button class="btn btn--primary" :disabled="!canFinalize || finalizeLoading" @click="finalizeSelected">
                {{ finalizeLoading ? 'Finalizzazione...' : 'Finalizza e invia al carrello' }}
              </button>
              <p v-if="!canFinalize" class="hint">Finalizzazione disponibile solo in READY_FOR_FINALIZE.</p>
            </article>
          </section>
        </template>
      </main>

      <aside class="right-panel" v-if="selected">
        <h2>Lista componenti</h2>
        <p class="muted">Aggiornata in tempo reale dal backend</p>

        <div class="bom-list" v-if="(selected.bom?.length ?? 0) > 0">
          <article class="bom-row" v-for="item in selected.bom" :key="`${item.sku}-${item.componentType || 'GEN'}`">
            <div>
              <strong>{{ item.name }}</strong>
              <p class="mini">SKU: {{ item.sku }} · {{ item.componentType || 'COMPONENTE' }}</p>
            </div>
            <div class="bom-row__right">
              <span>x{{ item.quantity }}</span>
              <strong>
                {{ formatPrice((item.unitPrice ?? ((item.unitPriceCents || 0) / 100)) * item.quantity) }}
              </strong>
            </div>
          </article>
        </div>
        <p v-else class="placeholder">Nessun componente disponibile: completa i passaggi di design.</p>

        <footer class="total-box">
          <span>Totale preview</span>
          <strong>{{ formatPrice(totalPrice) }}</strong>
        </footer>
      </aside>
    </div>

    <div v-if="showBomMobile" class="modal-overlay" @click.self="showBomMobile = false">
      <article class="modal-card">
        <header class="modal-header">
          <h3>Lista componenti</h3>
          <button class="btn btn--light btn--small" @click="showBomMobile = false">Chiudi</button>
        </header>
        <div class="bom-list" v-if="(selected?.bom?.length ?? 0) > 0">
          <article class="bom-row" v-for="item in selected?.bom" :key="`mob-${item.sku}-${item.componentType || 'GEN'}`">
            <div>
              <strong>{{ item.name }}</strong>
              <p class="mini">SKU: {{ item.sku }}</p>
            </div>
            <div class="bom-row__right">
              <span>x{{ item.quantity }}</span>
              <strong>
                {{ formatPrice((item.unitPrice ?? ((item.unitPriceCents || 0) / 100)) * item.quantity) }}
              </strong>
            </div>
          </article>
        </div>
        <p v-else class="placeholder">Nessun componente disponibile.</p>
        <footer class="total-box">
          <span>Totale preview</span>
          <strong>{{ formatPrice(totalPrice) }}</strong>
        </footer>
      </article>
    </div>

    <div v-if="showResetConfirm" class="modal-overlay" @click.self="cancelReset">
      <article class="modal-card modal-card--narrow">
        <h3>Conferma reset progetto</h3>
        <p>
          Cambiare ambiente o categoria dopo la definizione colonne resetta design e componenti. Vuoi continuare?
        </p>
        <div class="actions-row">
          <button class="btn btn--light" @click="cancelReset">Annulla</button>
          <button class="btn btn--primary" @click="confirmResetStepOne">Continua</button>
        </div>
      </article>
    </div>

    <div v-if="showResetFinalConfirm" class="modal-overlay" @click.self="cancelReset">
      <article class="modal-card modal-card--narrow">
        <h3>Seconda conferma richiesta</h3>
        <p>Confermi definitivamente il reset dei passaggi successivi?</p>
        <div class="actions-row">
          <button class="btn btn--light" @click="cancelReset">Annulla</button>
          <button class="btn btn--primary" @click="confirmResetStepTwo">Conferma reset</button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.cad-workspace {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.cad-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.subtitle {
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.header-actions {
  display: flex;
  gap: var(--space-2);
}

.bom-mobile-btn {
  display: none;
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
  grid-template-columns: 1fr auto;
  gap: var(--space-3);
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.field__input {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
}

.meta,
.muted {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.mini {
  font-size: var(--font-size-xs);
}

.error {
  margin-top: var(--space-4);
  color: var(--color-error);
  background: var(--color-error-subtle);
  border: 1px solid #f0cccc;
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.cad-layout {
  margin-top: var(--space-5);
  display: grid;
  grid-template-columns: minmax(260px, 320px) 1fr minmax(280px, 340px);
  gap: var(--space-4);
  align-items: start;
}

.left-panel,
.center-panel,
.right-panel {
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
  max-height: 500px;
  overflow: auto;
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

.stepper {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
}

.step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  background: var(--color-surface-raised);
}

.step__index {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
}

.step__label {
  font-size: var(--font-size-xs);
}

.step--active {
  border-color: var(--color-accent);
}

.step--done .step__index {
  background: var(--color-accent);
  color: #fff;
}

.meta-row {
  margin-top: var(--space-3);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.meta-row > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.canvas-section {
  margin-top: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
}

.canvas-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.canvas-size {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.canvas-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(110px, 1fr));
  gap: var(--space-2);
  min-height: 260px;
}

.canvas-column {
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: var(--space-2);
}

.canvas-column__scale,
.canvas-column__x {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.canvas-column__body {
  position: relative;
  background: linear-gradient(to top, #f2f6f8 0%, #ffffff 100%);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.level-line {
  position: absolute;
  left: 8px;
  right: 8px;
  border-top: 2px solid var(--color-accent);
}

.level-line span {
  position: absolute;
  right: 0;
  top: -14px;
  background: #fff;
  font-size: 10px;
  color: var(--color-text-secondary);
  padding: 0 4px;
}

.controls-section {
  margin-top: var(--space-4);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

.control-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  display: grid;
  gap: var(--space-3);
}

.two-cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 1fr));
  gap: var(--space-2);
}

.column-widths {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-2);
}

.design-columns {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-2);
}

.design-column {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  display: grid;
  gap: var(--space-2);
}

.design-column header {
  display: flex;
  justify-content: space-between;
}

.actions-row {
  display: flex;
  gap: var(--space-2);
}

.bom-list {
  margin-top: var(--space-3);
  display: grid;
  gap: var(--space-2);
}

.bom-row {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
}

.bom-row__right {
  text-align: right;
  display: grid;
  gap: 2px;
}

.total-box {
  margin-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.placeholder,
.hint {
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 25, 0.45);
  display: grid;
  place-items: center;
  z-index: 40;
  padding: var(--space-4);
}

.modal-card {
  width: min(720px, 100%);
  max-height: 88vh;
  overflow: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.modal-card--narrow {
  width: min(460px, 100%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.btn--small {
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-sm);
}

.btn--primary {
  background: var(--color-accent);
  color: #fff;
}

.btn--light {
  background: var(--color-surface-raised);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

@media (max-width: 1360px) {
  .cad-layout {
    grid-template-columns: 280px 1fr;
  }

  .right-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 980px) {
  .cad-workspace {
    padding: var(--space-6) var(--space-4);
  }

  .create-grid {
    grid-template-columns: 1fr;
  }

  .cad-layout {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .left-panel {
    order: 1;
  }

  .center-panel {
    order: 2;
  }

  .right-panel {
    display: none;
  }

  .bom-mobile-btn {
    display: inline-flex;
  }

  .stepper {
    grid-template-columns: 1fr;
  }

  .meta-row,
  .two-cols {
    grid-template-columns: 1fr;
  }

  .canvas-grid {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }

  .actions-row {
    flex-wrap: wrap;
  }
}
</style>
