/**
 * Domain port for reading item availability/price snapshots from catalog.
 */
export interface CatalogItemSnapshot {
  sku: string;
  unitPrice: number;
  isAvailable: boolean;
}

export interface CatalogSnapshotProvider {
  getBySku(sku: string): Promise<CatalogItemSnapshot | null>;
}
