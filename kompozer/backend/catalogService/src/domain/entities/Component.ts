/**
 * Main domain entity of catalogService.
 * Represents a single physical component in the Kompo system.
 *
 * Price is expressed in euro cents (integer) to avoid floating-point errors.
 * Example: 1990 = EUR 19.90.
 *
 * compatibleWith contains SKUs of components that are geometrically and
 * structurally compatible. cadService relies on this as source of truth.
 *
 * [DS] version implements optimistic concurrency control.
 */
import { ComponentCategory } from './ComponentCategory';
import { ComponentType }     from './ComponentType';
import { Dimensions }        from './Dimensions';

export interface Component {
  id:             string;
  sku:            string;
  name:           string;
  description:    string;
  category:       ComponentCategory;
  Type:           ComponentType;
  price:          number;         // euro cents, integer >= 0
  isAvailable:    boolean;        // explicit availability flag (admin-managed)
  imageUrl:       string;
  dimensions:     Dimensions;
  compatibleWith: string[];       // array of compatible SKUs
  version:        number;         // [DS] optimistic concurrency control, starts at 1
  createdAt:      Date;
  updatedAt:      Date;
}
