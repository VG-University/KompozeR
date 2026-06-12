import { Category } from '../entities/Category';

export type CatalogComponentType = 'PIEDINO' | 'MONTANTE' | 'RIPIANO' | 'TERMINALE' | 'MENSOLA';

export interface CatalogComponentRule {
  type: CatalogComponentType;
  widthMm: number;
  heightMm: number;
  depthMm: number;
}

export interface CatalogRules {
  shelfByWidthMm: Map<number, CatalogComponentRule>;
  terminalHeightsMm: number[];
  footHeightsMm: number[];
  uprightHeightsMm: number[];
}

export interface CatalogRulesProvider {
  getRules(category: Category): Promise<CatalogRules>;
}
