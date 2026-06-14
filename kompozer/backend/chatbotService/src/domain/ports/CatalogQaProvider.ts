export interface CatalogQaItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface CatalogQaProvider {
  search(query: string): Promise<CatalogQaItem[]>;
}
