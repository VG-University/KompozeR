import { CatalogComponentType } from '../ports/CatalogRulesProvider';

/**
 * Bill of materials line item derived from a CAD configuration.
 */
export interface BomItem {
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  componentType: CatalogComponentType;
}
