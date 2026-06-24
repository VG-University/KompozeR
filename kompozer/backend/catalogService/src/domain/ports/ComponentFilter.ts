/**
 * Input DTO for catalog search/filtering.
 * All fields are optional: omitted fields mean no filter.
 * Pagination uses page (1-based) + limit; defaults are applied by ListComponents.
 */
import { ComponentCategory } from '../entities/ComponentCategory';

export interface ComponentFilter {
  category?:  ComponentCategory;
  minPrice?:  number;   // cents, inclusive
  maxPrice?:  number;   // cents, inclusive
  available?: boolean;  // when true: only isAvailable=true
  search?:    string;   // full-text on name and description
  page?:      number;   // 1-based, default 1
  limit?:     number;   // max results per page, default 20
}
