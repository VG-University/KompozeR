/** Catalog domain contracts for product listing and administrative operations. */
export interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  Type: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string;
  dimensions?: {
    widthMm: number;
    heightMm: number;
    depthMm: number;
  };
  version: number;
}

export interface CatalogListDto {
  items: CatalogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
