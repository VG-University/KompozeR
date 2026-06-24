/** Catalog lookup contract used by the chatbot answer generator. */
export interface CatalogQaItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

/** Search contract for catalog question-answer responses. */
export interface CatalogQaProvider {
  search(query: string): Promise<CatalogQaItem[]>;
}
