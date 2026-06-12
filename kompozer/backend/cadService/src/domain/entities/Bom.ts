import { CatalogComponentType } from '../ports/CatalogRulesProvider';

export interface BomItem {
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  componentType: CatalogComponentType;
}
